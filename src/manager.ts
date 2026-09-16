import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'

/**
 * Thin bridge to privacy-gateway's scripts/privacy-manager.py, which owns
 * installing, starting and configuring the gateway and the local model.
 *
 * The manager is the single writer for those services; this module only runs it
 * and relays JSON. Nothing here interprets the gateway's own state.
 */
export const MANAGER_PATH =
  process.env.PRIVACY_MANAGER || '/root/privacy-gateway/scripts/privacy-manager.py'

/** Generous: an install may spawn a transient unit, not download inline. */
const RUN_TIMEOUT_MS = 150_000

export interface ManagerResult {
  ok: boolean
  error?: string
  [key: string]: unknown
}

export function managerAvailable(): boolean {
  return existsSync(MANAGER_PATH)
}

export function runManager(args: string[]): Promise<ManagerResult> {
  return new Promise((resolve) => {
    if (!existsSync(MANAGER_PATH)) {
      resolve({ ok: false, error: `manager not found at ${MANAGER_PATH}` })
      return
    }
    execFile(
      'python3',
      [MANAGER_PATH, ...args],
      { timeout: RUN_TIMEOUT_MS, maxBuffer: 4 * 1024 * 1024, encoding: 'utf8' },
      (err, stdout) => {
        const text = String(stdout || '').trim()
        const lastLine = text.split('\n').filter(Boolean).pop() || ''
        if (lastLine) {
          try {
            resolve(JSON.parse(lastLine) as ManagerResult)
            return
          } catch {
            /* fall through to the error path */
          }
        }
        resolve({
          ok: false,
          error: err ? `${(err as Error).message}` : 'manager produced no JSON',
        })
      },
    )
  })
}
