export interface Layer1Stats {
  enabled: boolean
  url: string
  reachable: boolean
  classified: number
  hits: number
  failures: number
  cache_size: number
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
