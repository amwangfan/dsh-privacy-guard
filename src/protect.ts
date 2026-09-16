import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs'
import yaml from 'js-yaml'

/**
 * Adds a "protected" twin of an existing DSH provider, pointing at the local
 * redaction gateway.
 *
 * The point is to leave the existing provider exactly as it is and let the model
 * list offer both routes: the original (direct) and the copy (through the
 * gateway). Applying it writes ~/.dsh/settings.yaml, which dsh-settings-file
 * watches through chokidar — it reloads and publishes, so the model list updates
 * without a restart.
 *
 * Only the provider block is touched: the file is loaded as a whole document and
 * written back with its key order preserved, so unrelated settings survive
 * byte-for-byte in structure.
 */

export interface ProtectResult {
  ok: boolean
  action?: 'created' | 'updated' | 'noop'
  error?: string
  provider?: string
  display_name?: string
  source?: string
  base_url?: string
  models?: number
  settings_file?: string
  backup?: string
  /** True when the original provider was moved back to the direct endpoint. */
  source_flipped_direct?: boolean
  source_base_url?: string
}

function settingsPath(): string {
  const home = process.env.DSH_HOME || `${process.env.HOME || '/root'}/.dsh`
  return `${home}/settings.yaml`
}

/** Key written into a twin so this plugin can recognise its own entries. */
const MANAGED_KEY = 'privacy-guard-managed'
/** Key recording which provider a twin was copied from. */
const SOURCE_KEY = 'privacy-guard-source'

export interface ProviderRow {
  name: string
  baseURL: string
  kind: string
  managed: boolean
  source?: string
}

/** Every provider, with a flag for the twins this plugin created. */
export function listProviders(): ProviderRow[] {
  const cfg: any = readSettings()
  const rows: ProviderRow[] = []
  for (const [kind, block] of Object.entries<any>(cfg || {})) {
    const providers = block?.providers
    if (!providers || typeof providers !== 'object') continue
    for (const [name, provider] of Object.entries<any>(providers)) {
      rows.push({
        name,
        baseURL: String(provider?.baseURL || ''),
        kind,
        managed: Boolean(provider && provider[MANAGED_KEY]),
        source: provider && provider[SOURCE_KEY] ? String(provider[SOURCE_KEY]) : undefined,
      })
    }
  }
  return rows
}

/**
 * Providers whose baseURL points at the gateway, excluding twins this plugin
 * created: the twin IS gateway-routed and must never be picked as the source,
 * or applying again would treat the copy as the original.
 */
export function detectGatewayProviders(): Array<{ name: string; baseURL: string; kind: string }> {
  const cfg: any = readSettings()
  const found: Array<{ name: string; baseURL: string; kind: string }> = []
  for (const [kind, block] of Object.entries<any>(cfg || {})) {
    const providers = block?.providers
    if (!providers || typeof providers !== 'object') continue
    for (const [name, provider] of Object.entries<any>(providers)) {
      if (provider && provider[MANAGED_KEY]) continue
      const base = String(provider?.baseURL || '')
      if (/\b8317\b/.test(base) || /privacy-gateway/i.test(base)) {
        found.push({ name, baseURL: base, kind })
      }
    }
  }
  return found
}

function readSettings(): any {
  const file = settingsPath()
  if (!existsSync(file)) throw new Error(`no settings file at ${file}`)
  return yaml.load(readFileSync(file, 'utf8')) as any
}

/**
 * Create or refresh the protected twin of `sourceName`.
 *
 * `sourceName` empty means "the provider that is already routed through the
 * gateway" (if exactly one is).
 */
export function applyProtectedProvider(
  sourceName: string,
  suffix: string,
  displaySuffix: string,
  gatewayBaseUrl: string,
  directBaseUrl: string,
): ProtectResult {
  const file = settingsPath()
  let cfg: any
  try {
    cfg = readSettings()
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) }
  }

  const gatewayProviders = detectGatewayProviders()
  let source = sourceName
  if (!source) {
    if (gatewayProviders.length === 1) source = gatewayProviders[0].name
    else if (gatewayProviders.length === 0) {
      return { ok: false, error: 'no provider is routed through the gateway; name one explicitly' }
    } else {
      return {
        ok: false,
        error: `several providers point at the gateway (${gatewayProviders
          .map((p) => p.name)
          .join(', ')}); name one explicitly`,
      }
    }
  }

  // Locate the source provider block.
  let block: any = null
  let sourceProvider: any = null
  for (const value of Object.values<any>(cfg || {})) {
    const providers = value?.providers
    if (providers && providers[source]) {
      block = providers
      sourceProvider = providers[source]
      break
    }
  }
  if (!sourceProvider) {
    return { ok: false, error: `provider ${source} not found in ${file}`, settings_file: file }
  }
  if (sourceProvider[MANAGED_KEY]) {
    return {
      ok: false,
      error:
        `${source} is a copy created by this plugin, not an original provider. ` +
        'Choose the provider you want a protected twin of.',
      settings_file: file,
    }
  }

  const targetName = `${source}${suffix}`
  const baseName = String(sourceProvider.displayName || source)
  const modelCount = Array.isArray(sourceProvider.models) ? sourceProvider.models.length : 0

  const existed = Boolean(block[targetName])
  const existing = existed ? block[targetName] : null

  // The whole point is two distinct routes. If the source is still pointed at the
  // gateway, the twin would duplicate it, so move the source back to the direct
  // endpoint. Refuse when no direct endpoint is known rather than guessing one.
  const sourceBase = String(sourceProvider.baseURL || '')
  const sourceIsGateway = /\b8317\b/.test(sourceBase) || /privacy-gateway/i.test(sourceBase)
  let flipped = false
  if (sourceIsGateway) {
    if (!directBaseUrl) {
      return {
        ok: false,
        error:
          `provider ${source} still points at the gateway (${sourceBase}) and no direct ` +
          'endpoint is configured, so the copy would be identical to the original. ' +
          'Set the direct backend URL first.',
        settings_file: file,
      }
    }
    if (directBaseUrl === sourceBase) {
      return {
        ok: false,
        error: `the direct endpoint equals the gateway endpoint (${sourceBase})`,
        settings_file: file,
      }
    }
  }

  // The recorded source is part of the comparison: a twin created before that
  // marker existed must be rewritten once so later visits can pre-fill the form.
  const twinSame =
    existed &&
    existing &&
    String(existing.baseURL || '') === gatewayBaseUrl &&
    String(existing.displayName || '') === `${baseName}${displaySuffix}` &&
    String(existing[SOURCE_KEY] || '') === source

  // A no-op only when the source is already the direct route AND it is the
  // intended one; a source left pointing somewhere else must still be corrected.
  const sourceIsIntended =
    !sourceIsGateway && (!directBaseUrl || sourceBase === directBaseUrl)
  if (twinSame && sourceIsIntended) {
    return {
      ok: true,
      action: 'noop',
      provider: targetName,
      display_name: existing.displayName,
      source,
      base_url: gatewayBaseUrl,
      models: modelCount,
      settings_file: file,
      source_flipped_direct: false,
      source_base_url: sourceBase,
    }
  }

  let backup = ''
  try {
    backup = `${file}.bak-plugin-${Date.now()}`
    copyFileSync(file, backup)

    // Any source that is not already on the intended direct endpoint is moved
    // there: either it points at the gateway (so the twin would duplicate it), or
    // it has drifted to some other address.
    if (directBaseUrl && sourceBase !== directBaseUrl) {
      sourceProvider.baseURL = directBaseUrl
      flipped = true
    }
    // Deep copy so the original keeps its own arrays/objects.
    block[targetName] = JSON.parse(JSON.stringify(sourceProvider))
    block[targetName].baseURL = gatewayBaseUrl
    block[targetName].displayName = `${baseName}${displaySuffix}`
    // Marked so detectGatewayProviders never mistakes the twin for a source, and
    // so the panel can default the source field on a later visit.
    block[targetName][MANAGED_KEY] = true
    block[targetName][SOURCE_KEY] = source
    writeFileSync(file, yaml.dump(cfg, { noRefs: true, lineWidth: 120, quotingType: '"' }), 'utf8')
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e), settings_file: file }
  }

  return {
    ok: true,
    action: existed ? 'updated' : 'created',
    provider: targetName,
    display_name: block[targetName].displayName,
    source,
    base_url: gatewayBaseUrl,
    models: modelCount,
    settings_file: file,
    backup,
    source_flipped_direct: flipped,
    source_base_url: String(sourceProvider.baseURL || ''),
  }
}

/** Remove a previously created protected twin. */
export function removeProtectedProvider(name: string): ProtectResult {
  const file = settingsPath()
  let cfg: any
  try {
    cfg = readSettings()
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) }
  }
  for (const value of Object.values<any>(cfg || {})) {
    const providers = value?.providers
    if (providers && providers[name]) {
      const backup = `${file}.bak-plugin-${Date.now()}`
      try {
        copyFileSync(file, backup)
        delete providers[name]
        writeFileSync(file, yaml.dump(cfg, { noRefs: true, lineWidth: 120, quotingType: '"' }), 'utf8')
      } catch (e: any) {
        return { ok: false, error: e?.message || String(e), settings_file: file }
      }
      return { ok: true, action: 'updated', provider: name, settings_file: file, backup }
    }
  }
  return { ok: false, error: `provider ${name} not found`, settings_file: file }
}
