import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver'
import { managerAvailable, runManager } from './manager.js'
import {
  applyProtectedProvider,
  detectGatewayProviders,
  listProviders,
  removeProtectedProvider,
} from './protect.js'
import type {
  DryRunRequest,
  DryRunResponse,
  ExemptionAudit,
  ExemptionList,
  GatewayHealth,
  PrivacyGuardStatus,
} from './types.js'

export const name = 'dsh-privacy-guard'
export const inject = ['webServer']

export interface Config {
  gatewayUrl?: string
  classifierUrl?: string
}

const DEFAULT_GATEWAY_URL = 'http://127.0.0.1:8317'
const DEFAULT_CLASSIFIER_URL = 'http://127.0.0.1:8319'

/**
 * Placement of the injected guidance: after the tool-usage sections and before
 * the session-query section (see the harness SECTION_ORDERS table). Sits among
 * other tool instructions rather than at the end, so it neither competes with
 * the deployment persona suffix nor perturbs the tail of the prefix.
 */
const PROMPT_SECTION_ORDER = 2250

/**
 * Injected verbatim, kept as short as the guidance allows.
 *
 * Deliberately a static string: the assembled prefix must be byte-identical
 * across steps or every request pays a prompt-cache miss. Nothing time-varying,
 * no counts, no file paths, no environment-derived text may go in here.
 */
const PROMPT_TEXT = `# 出网脱敏
本机出网请求经脱密网关：凭据被替换为 <SECRET_类型_序号>，回程自动还原。
- 把 <SECRET_...> 当作它所代表的凭据本身：需要时直接原样发出，不要解释或猜测内容，也不要改写占位符。
- 需要让某非凭据词原样出网：privacy-exempt.sh allow --term "<词或代号>" --reason "<简短理由>"；理由必填，并在回复中说明放行了什么、为什么。revoke 恢复过滤。
- 拿不准是否是凭据就保持过滤，不要为了通过校验主动关脱敏。`

function writeJson(res: ServerResponse, status: number, body: unknown): void {
  const json = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(json),
    'cache-control': 'no-store',
  })
  res.end(json)
}

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    req.on('error', reject)
  })
}

export class PrivacyGuardService {
  public gatewayUrl: string
  public classifierUrl: string

  constructor(config?: Config) {
    this.gatewayUrl = (config?.gatewayUrl || DEFAULT_GATEWAY_URL).replace(/\/+$/, '')
    this.classifierUrl = (config?.classifierUrl || DEFAULT_CLASSIFIER_URL).replace(/\/+$/, '')
  }

  async getHealth(): Promise<GatewayHealth | null> {
    try {
      const resp = await fetch(`${this.gatewayUrl}/privacy/health`, { signal: AbortSignal.timeout(3000) })
      if (!resp.ok) return null
      return (await resp.json()) as GatewayHealth
    } catch {
      return null
    }
  }

  async checkClassifier(): Promise<boolean> {
    try {
      const resp = await fetch(`${this.classifierUrl}/health`, { signal: AbortSignal.timeout(2000) })
      return resp.ok
    } catch {
      return false
    }
  }

  async getStatus(): Promise<PrivacyGuardStatus> {
    const [health, classifierOnline] = await Promise.all([this.getHealth(), this.checkClassifier()])
    return {
      gateway: {
        online: health !== null,
        url: this.gatewayUrl,
        stats: health ?? undefined,
        error: health === null ? 'Cannot connect to Privacy Gateway on :8317' : undefined,
      },
      classifier: {
        online: classifierOnline,
        url: this.classifierUrl,
        modelAlias: 'qwen25-05b-privacy',
      },
    }
  }

  async dryRun(req: DryRunRequest): Promise<DryRunResponse> {
    let payload = req.json_payload
    if (!payload && req.text) {
      payload = {
        input: [
          {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: req.text }],
          },
        ],
      }
    }
    if (!payload) {
      return { ok: false, error: 'Empty test content' }
    }

    try {
      const resp = await fetch(`${this.gatewayUrl}/privacy/dry-run`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      })
      if (!resp.ok) {
        return { ok: false, error: `Gateway returned HTTP ${resp.status}` }
      }
      const data = await resp.json()
      return {
        ok: true,
        redacted: data.redacted,
        vault_active: data.vault_active,
        layer1_applied: data.layer1_applied,
        exempt_spans: data.exempt_spans,
        exempt_terms: data.exempt_terms,
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Failed to call /privacy/dry-run' }
    }
  }

  /**
   * Active exemption list. This runs in the Host, not the browser, so the page
   * never talks to the gateway directly (the control plane is loopback-only).
   */
  async getExemptions(): Promise<ExemptionList | null> {
    try {
      const resp = await fetch(`${this.gatewayUrl}/privacy/exemptions`, {
        signal: AbortSignal.timeout(4000),
      })
      if (!resp.ok) return null
      return (await resp.json()) as ExemptionList
    } catch {
      return null
    }
  }

  /** Vault key configuration. Never contains the passphrase itself. */
  async getKeyConfig(): Promise<any | null> {
    try {
      const resp = await fetch(`${this.gatewayUrl}/privacy/key`, { signal: AbortSignal.timeout(4000) })
      if (!resp.ok) return null
      const data = await resp.json()
      return data?.config ?? null
    } catch {
      return null
    }
  }

  /** Switch the vault key source. The gateway re-encrypts before it restarts. */
  async setKeyConfig(body: { mode: string; password?: string; actor?: string }): Promise<any> {
    try {
      const resp = await fetch(`${this.gatewayUrl}/privacy/key`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(190000),
      })
      return await resp.json()
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Failed to reach /privacy/key' }
    }
  }

  /** Add one exemption (used by the panel's whitelist editor). */
  async addExemption(
    term: string,
    scope?: string,
    reason?: string,
    actor?: string,
  ): Promise<any> {
    try {
      const resp = await fetch(`${this.gatewayUrl}/privacy/exemptions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ term, scope: scope || 'all', reason: reason || '', actor: actor || 'human:panel' }),
        signal: AbortSignal.timeout(10000),
      })
      return await resp.json()
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Failed to add the exemption' }
    }
  }

  /** Revoke one exemption. The gateway also accepts it as a query parameter. */
  async revokeExemption(term: string, reason?: string, actor?: string): Promise<any> {
    try {
      const resp = await fetch(`${this.gatewayUrl}/privacy/exemptions`, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ term, reason: reason || '', actor: actor || 'human:panel' }),
        signal: AbortSignal.timeout(10000),
      })
      return await resp.json()
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Failed to revoke the exemption' }
    }
  }

  /** Append-only audit trail of allow / revoke / expire / hit decisions. */
  async getExemptionAudit(since = 0, limit = 40): Promise<ExemptionAudit | null> {
    try {
      const url = `${this.gatewayUrl}/privacy/exemptions/audit?since=${encodeURIComponent(
        String(since),
      )}&limit=${encodeURIComponent(String(limit))}`
      const resp = await fetch(url, { signal: AbortSignal.timeout(4000) })
      if (!resp.ok) return null
      return (await resp.json()) as ExemptionAudit
    } catch {
      return null
    }
  }
}

export function apply(ctx: Context, config?: Config): void {
  const service = new PrivacyGuardService(config)

  const routes: WebRoute[] = [
    {
      kind: 'exact',
      path: '/api/dsh-privacy-guard/status',
      handler: async (_req: IncomingMessage, res: ServerResponse): Promise<void> => {
        const status = await service.getStatus()
        writeJson(res, 200, status)
      },
    },
    {
      kind: 'exact',
      path: '/api/dsh-privacy-guard/health',
      handler: async (_req: IncomingMessage, res: ServerResponse): Promise<void> => {
        const health = await service.getHealth()
        if (!health) {
          writeJson(res, 503, { ok: false, error: 'Privacy Gateway offline' })
          return
        }
        writeJson(res, 200, health)
      },
    },
    {
      kind: 'exact',
      path: '/api/dsh-privacy-guard/key',
      handler: async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        if (req.method === 'POST') {
          try {
            const raw = await readBody(req)
            const body = JSON.parse(raw) as { mode: string; password?: string; actor?: string }
            const result = await service.setKeyConfig(body)
            writeJson(res, result.ok ? 200 : 400, result)
          } catch (err: any) {
            writeJson(res, 400, { ok: false, error: err?.message || 'Invalid JSON body' })
          }
          return
        }
        const config = await service.getKeyConfig()
        if (!config) {
          writeJson(res, 503, { ok: false, error: 'Privacy Gateway offline' })
          return
        }
        writeJson(res, 200, { ok: true, config })
      },
    },
    {
      kind: 'exact',
      path: '/api/dsh-privacy-guard/exemptions',
      handler: async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        // The panel edits the whitelist in a text area and applies the diff, so
        // this route accepts POST (allow) and DELETE (revoke) with a JSON body.
        if (req.method === 'POST' || req.method === 'DELETE') {
          try {
            const raw = await readBody(req)
            const body = JSON.parse(raw || '{}') as {
              term?: string
              reason?: string
              scope?: string
              actor?: string
            }
            if (!body.term) {
              writeJson(res, 400, { ok: false, error: 'term is required' })
              return
            }
            const result =
              req.method === 'DELETE'
                ? await service.revokeExemption(body.term, body.reason, body.actor)
                : await service.addExemption(body.term, body.scope, body.reason, body.actor)
            writeJson(res, result.ok ? 200 : 400, result)
          } catch (err: any) {
            writeJson(res, 400, { ok: false, error: err?.message || 'Invalid JSON body' })
          }
          return
        }

        const list = await service.getExemptions()
        if (!list) {
          writeJson(res, 503, {
            ok: false,
            error: 'Privacy Gateway offline or exemption API unavailable (restart the gateway after upgrading)',
            count: 0,
            entries: [],
          })
          return
        }
        writeJson(res, 200, list)
      },
    },
    {
      kind: 'exact',
      path: '/api/dsh-privacy-guard/exemptions/audit',
      handler: async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        const url = new URL(req.url || '/', 'http://127.0.0.1')
        const since = Number(url.searchParams.get('since') || 0) || 0
        const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') || 40) || 40))
        const audit = await service.getExemptionAudit(since, limit)
        if (!audit) {
          writeJson(res, 503, { ok: false, error: 'Privacy Gateway offline', count: 0, records: [] })
          return
        }
        writeJson(res, 200, audit)
      },
    },
    // ---- deployment control plane (drives scripts/privacy-manager.py) ----
    // ---- protected model-list entry (a gateway-routed twin provider) ----
    {
      kind: 'exact',
      path: '/api/dsh-privacy-guard/protect',
      handler: async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        try {
          if (req.method === 'GET') {
            writeJson(res, 200, {
              ok: true,
              // `gateway_providers` is what is still pointed at the gateway; the
              // panel picks a source from `providers` when that list is empty
              // because the original was already moved to the direct route.
              gateway_providers: detectGatewayProviders(),
              providers: listProviders(),
            })
            return
          }
          const raw = await readBody(req)
          const body = JSON.parse(raw || '{}') as {
            action?: string
            source?: string
            suffix?: string
            display_suffix?: string
            gateway_base_url?: string
            provider?: string
          }
          const action = String(body.action || 'apply')
          if (action === 'remove') {
            writeJson(res, 200, removeProtectedProvider(String(body.provider || '')))
            return
          }
          // The direct endpoint is the gateway's configured BACKEND_URL: that is
          // where the gateway forwards to, so it is the unprotected route.
          let directBase = String((body as any).direct_base_url || '')
          if (!directBase) {
            const st = await runManager(['config'])
            const backend = String((st as any)?.config?.direct_base_url || '')
            if (backend) directBase = backend
          }
          writeJson(
            res,
            200,
            applyProtectedProvider(
              String(body.source || ''),
              String(body.suffix || '-protected'),
              String(body.display_suffix || '(凭据保护)'),
              String(body.gateway_base_url || ''),
              directBase,
            ),
          )
        } catch (err: any) {
          writeJson(res, 400, { ok: false, error: err?.message || 'invalid request body' })
        }
      },
    },
    {
      kind: 'exact',
      path: '/api/dsh-privacy-guard/deploy',
      handler: async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        if (!managerAvailable()) {
          writeJson(res, 503, {
            ok: false,
            error: 'privacy-manager.py not found on this host',
          })
          return
        }
        if (req.method === 'GET') {
          writeJson(res, 200, await runManager(['status']))
          return
        }
        try {
          const raw = await readBody(req)
          const body = JSON.parse(raw || '{}') as { action?: string; part?: string; values?: Record<string, string> }
          const action = String(body.action || '')
          const part = String(body.part || 'all')
          switch (action) {
            case 'install':
              writeJson(res, 200, await runManager(['install', '--part', part]))
              return
            case 'start':
            case 'stop':
            case 'restart':
              writeJson(res, 200, await runManager([action, '--part', part]))
              return
            case 'config': {
              const values = body.values || {}
              const args = ['config']
              for (const [key, value] of Object.entries(values)) {
                args.push('--set', `${key}=${value}`)
              }
              writeJson(res, 200, await runManager(args))
              return
            }
            default:
              writeJson(res, 400, { ok: false, error: `unknown action: ${action}` })
          }
        } catch (err: any) {
          writeJson(res, 400, { ok: false, error: err?.message || 'invalid request body' })
        }
      },
    },
    {
      kind: 'exact',
      path: '/api/dsh-privacy-guard/deploy/logs',
      handler: async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        const url = new URL(req.url || '/', 'http://127.0.0.1')
        const part = url.searchParams.get('part') === 'model' ? 'model' : 'gateway'
        const lines = Math.min(400, Math.max(10, Number(url.searchParams.get('lines') || 80) || 80))
        writeJson(res, 200, await runManager(['logs', '--part', part, '--lines', String(lines)]))
      },
    },
    {
      kind: 'exact',
      path: '/api/dsh-privacy-guard/dry-run',
      handler: async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        if (req.method !== 'POST') {
          writeJson(res, 405, { ok: false, error: 'Method Not Allowed' })
          return
        }
        try {
          const raw = await readBody(req)
          const body: DryRunRequest = JSON.parse(raw)
          const result = await service.dryRun(body)
          writeJson(res, result.ok ? 200 : 400, result)
        } catch (err: any) {
          writeJson(res, 400, { ok: false, error: err?.message || 'Invalid JSON body' })
        }
      },
    },
  ]

  // The web carrier service exposes `register(route)`, NOT `addRoute`. Calling a
  // method that does not exist here used to be swallowed by a truthiness guard,
  // so the plugin loaded "successfully" while registering zero routes and every
  // panel request 404'd — which the UI could only report as "offline".
  const webServer = (ctx as any).webServer
  if (typeof webServer?.register !== 'function') {
    throw new Error(
      'dsh-privacy-guard: the webServer service has no register(route); cannot serve the panel API',
    )
  }
  const disposers: Array<() => void> = []
  for (const r of routes) {
    const dispose = webServer.register(r)
    if (typeof dispose === 'function') disposers.push(dispose)
  }
  // Owned by this fiber so a stop, update or patch reload removes the routes.
  if (typeof (ctx as any).effect === 'function') {
    (ctx as any).effect(() => () => {
      for (const dispose of disposers) {
        try {
          dispose()
        } catch {
          /* the carrier is going away anyway */
        }
      }
    })
  }

  registerPromptSection(ctx)
}

/**
 * Tell the model how redaction works, so it does not treat a placeholder as an
 * opaque blob and refuse to send it, and so it knows the exemption command.
 *
 * Read optionally: `systemPrompt` may be absent in a composition without the
 * prompt registry, and it is never worth failing the whole plugin over one
 * prompt section. The returned disposer is registered through ctx.effect so the
 * section disappears with the plugin.
 */
function registerPromptSection(ctx: any): void {
  const systemPrompt = ctx.get ? ctx.get('systemPrompt') : undefined
  if (!systemPrompt || typeof systemPrompt.section !== 'function') return

  const section = {
    name: 'dsh-privacy-guard/redaction',
    order: PROMPT_SECTION_ORDER,
    text: PROMPT_TEXT,
  }

  if (typeof ctx.effect === 'function') {
    ctx.effect(() => systemPrompt.section(section))
  } else {
    systemPrompt.section(section)
  }
}
