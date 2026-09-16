export interface Layer1Stats {
  enabled: boolean
  url: string
  reachable: boolean
  classified: number
  hits: number
  failures: number
  cache_size: number
}

export interface PersistStats {
  enabled: boolean
  db_path?: string
  vault_rows?: number
  layer1_rows?: number
  mem_mappings?: number
  key_source?: string
  custom_secrets_count?: number
}

export interface ExemptionEntry {
  term: string
  scope: 'all' | 'layer0' | 'layer1'
  reason: string
  actor: string
  source: 'plain' | 'secret-alias'
  /** The vault alias this exemption was created from, when it was created from one. */
  placeholder: string
  created_at: number
  /** 0 means no expiry: the exemption stays until it is revoked. */
  expires_at: number
  permanent: boolean
  remaining_seconds: number
  hits: number
  last_hit_at: number
  expired: boolean
}

export interface ExemptionStats {
  enabled: boolean
  file: string
  active_count: number
  total_count: number
  permanent_count: number
  session_hits: number
  adds: number
  revokes: number
  api_calls: number
  next_expiry_at: number
  terms: string[]
  min_term_chars: number
}

export interface ExemptionList {
  ok: boolean
  count: number
  stats: ExemptionStats
  entries: ExemptionEntry[]
}

export interface ExemptionAuditRecord {
  ts: number
  action: 'add' | 'revoke' | 'expire' | 'hit'
  term: string
  scope?: string
  reason?: string
  actor?: string
  active_count?: number
}

export interface ExemptionAudit {
  ok: boolean
  count: number
  records: ExemptionAuditRecord[]
}

export interface GatewayHealth {
  status: string
  uptime_seconds: number
  total_redacted_secrets: number
  total_restored_secrets: number
  active_vault_mappings: number
  backend_url: string
  restore_outbound: boolean
  placeholder_prefix: string
  persist?: PersistStats
  exemptions?: ExemptionStats
  layer1: Layer1Stats
}

export interface DryRunRequest {
  text?: string
  json_payload?: any
}

export interface DryRunResponse {
  ok: boolean
  redacted?: any
  vault_active?: number
  layer1_applied?: boolean
  exempt_spans?: number
  exempt_terms?: string[]
  error?: string
}

export interface PrivacyGuardStatus {
  gateway: {
    online: boolean
    url: string
    stats?: GatewayHealth
    error?: string
  }
  classifier: {
    online: boolean
    url: string
    modelAlias?: string
  }
}
