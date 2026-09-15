import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver'
import type { DryRunRequest, DryRunResponse, GatewayHealth, PrivacyGuardStatus } from './types.js'

export const name = 'dsh-privacy-guard'
export const inject = ['webServer']

export interface Config {
  gatewayUrl?: string
  classifierUrl?: string
}

const DEFAULT_GATEWAY_URL = 'http://127.0.0.1:8317'
const DEFAULT_CLASSIFIER_URL = 'http://127.0.0.1:8319'

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
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Failed to call /privacy/dry-run' }
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

  const webServer = (ctx as any).webServer
  if (webServer?.addRoute) {
    for (const r of routes) {
      webServer.addRoute(r)
    }
  }
}
