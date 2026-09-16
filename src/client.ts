import React, { useState, useEffect, useCallback, useRef } from 'react'
import type {
  PrivacyGuardStatus,
  DryRunResponse,
  ExemptionEntry,
  ExemptionList,
  ExemptionAuditRecord,
} from './types.js'

export const name = 'dsh-privacy-guard-client'

const NS = 'dsh-privacy-guard'
const PKG = 'dsh-privacy-guard'
const POLL_MS = 4000

/**
 * Copy for both built-in locales. Registered through the client locale service,
 * so the settings label and every string follow the active language instead of
 * showing Chinese and English at the same time.
 */
const DICT = {
  zh: {
    'section.label': '隐私脱密',
    'panel.title': '隐私脱密',
    'gateway.card': '脱密网关 :8317',
    'gateway.active': '正在保护',
    'gateway.offline': '未连接',
    'classifier.card': '残差模型 :8319',
    'classifier.online': '在线',
    'classifier.offline': '未加载',
    'vault.card': '加密持久化',
    'vault.enabled': '已启用',
    'vault.memory': '纯内存',
    'metric.redacted': '累计脱敏',
    'metric.restored': '流式还原',
    'metric.vault': '凭据总库',
    'metric.hits': '模型命中',
    'exempt.title': '豁免名单',
    'exempt.active': '{count} 条生效',
    'exempt.allFiltered': '全部过滤中',
    'exempt.apiDown': '接口不可用',
    'exempt.scope': '范围',
    'exempt.actor': '操作者',
    'exempt.hits': '命中',
    'exempt.reason': '理由',
    'exempt.noReason': '未填写',
    'exempt.permanent': '长期有效',
    'exempt.until': '至 {time}',
    'exempt.empty': '暂无豁免，所有流量都在过滤',
    'exempt.apiDownHint': '网关未运行含豁免功能的版本',
    'exempt.bannerAdded': '已放行：{term}',
    'exempt.bannerRemoved': '已恢复过滤：{term}',
    'exempt.bannerReason': '理由',
    'exempt.bannerBy': '操作者',
    'exempt.bannerMore': '本次共 {count} 条变更',
    'exempt.bannerDismiss': '关闭',
    'sandbox.title': '泄密探测沙箱',
    'sandbox.run': '测试',
    'sandbox.running': '测试中…',
    'sandbox.ok': '脱敏生效',
    'sandbox.fail': '调用失败',
    'sandbox.hitLayer1': '模型判定命中',
    'sandbox.exempted': '{count} 处豁免未脱敏',
    'key.title': '加密密钥',
    'key.mode.file': '密钥文件',
    'key.mode.password': '自定义口令',
    'key.current': '来源',
    'key.vaultRows': '落盘凭据',
    'key.customLabel': '自定义口令（可选）',
    'key.customHint': '设置后用于加密持久化数据；留空则使用自动生成的密钥文件。',
    'key.passwordPlaceholder': '至少 8 位，不会回显',
    'key.confirmPlaceholder': '再输入一次',
    'key.save': '保存',
    'key.saving': '正在重新加密…',
    'key.clear': '改回密钥文件',
    'key.notSet': '未设置',
    'key.mismatch': '两次输入不一致',
    'key.tooShort': '口令至少 8 位',
    'key.rotated': '已重新加密 {count} 条凭据',
    'key.rotatedClear': '已改回密钥文件',
    'key.restartHint': '改动已保存，可重启 DSH 刷新显示',
    'key.warn': '更换密钥会重新加密已有凭据；旧对话里的占位符仍可正常还原。',
    'exempt.edit': '编辑',
    'exempt.editing': '编辑白名单',
    'exempt.editHint': '每行一个词；删除某行即撤销该豁免。',
    'exempt.save': '保存',
    'exempt.saving': '保存中…',
    'exempt.cancel': '取消',
    'exempt.applied': '白名单已更新（新增 {added}，撤销 {removed}）',
    'exempt.addedByPanel': '在插件面板中人工添加',
    'banner.dismiss': '关闭',
    'error.noGateway': '无法连接隐私网关',
  },
  en: {
    'section.label': 'Privacy Guard',
    'panel.title': 'Privacy Guard',
    'gateway.card': 'Gateway :8317',
    'gateway.active': 'Protecting',
    'gateway.offline': 'Offline',
    'classifier.card': 'Classifier :8319',
    'classifier.online': 'Online',
    'classifier.offline': 'Not loaded',
    'vault.card': 'Encrypted store',
    'vault.enabled': 'Enabled',
    'vault.memory': 'Memory only',
    'metric.redacted': 'Redacted',
    'metric.restored': 'Restored',
    'metric.vault': 'In vault',
    'metric.hits': 'Model hits',
    'exempt.title': 'Exemptions',
    'exempt.active': '{count} active',
    'exempt.allFiltered': 'Everything filtered',
    'exempt.apiDown': 'API unavailable',
    'exempt.scope': 'Scope',
    'exempt.actor': 'By',
    'exempt.hits': 'Hits',
    'exempt.reason': 'Reason',
    'exempt.noReason': 'not given',
    'exempt.permanent': 'no expiry',
    'exempt.until': 'until {time}',
    'exempt.empty': 'No exemptions — all traffic is filtered',
    'exempt.apiDownHint': 'The gateway is not running a build that has exemptions',
    'exempt.bannerAdded': 'Allowed through: {term}',
    'exempt.bannerRemoved': 'Filtering restored: {term}',
    'exempt.bannerReason': 'Reason',
    'exempt.bannerBy': 'By',
    'exempt.bannerMore': '{count} changes in this batch',
    'exempt.bannerDismiss': 'Dismiss',
    'sandbox.title': 'Leak-test sandbox',
    'sandbox.run': 'Test',
    'sandbox.running': 'Testing…',
    'sandbox.ok': 'Redaction applied',
    'sandbox.fail': 'Request failed',
    'sandbox.hitLayer1': 'residual model flagged it',
    'sandbox.exempted': '{count} exempted spans left as-is',
    'key.title': 'Encryption key',
    'key.mode.file': 'Key file',
    'key.mode.password': 'Custom passphrase',
    'key.current': 'Source',
    'key.vaultRows': 'Stored credentials',
    'key.customLabel': 'Custom passphrase (optional)',
    'key.customHint': 'Used to encrypt persisted data. Leave empty to keep the generated key file.',
    'key.passwordPlaceholder': 'At least 8 characters, never echoed back',
    'key.confirmPlaceholder': 'Repeat the passphrase',
    'key.save': 'Save',
    'key.saving': 'Re-encrypting…',
    'key.clear': 'Use the key file',
    'key.notSet': 'not set',
    'key.mismatch': 'The two entries differ',
    'key.tooShort': 'Use at least 8 characters',
    'key.rotated': 'Re-encrypted {count} credential(s)',
    'key.rotatedClear': 'Switched back to the key file',
    'key.restartHint': 'Saved. Restart DSH to refresh this panel.',
    'key.warn': 'Changing the key re-encrypts stored credentials; placeholders in older chats stay restorable.',
    'exempt.edit': 'Edit',
    'exempt.editing': 'Edit whitelist',
    'exempt.editHint': 'One term per line; removing a line revokes that exemption.',
    'exempt.save': 'Save',
    'exempt.saving': 'Saving…',
    'exempt.cancel': 'Cancel',
    'exempt.applied': 'Whitelist updated (+{added}, -{removed})',
    'exempt.addedByPanel': 'added by hand in the panel',
    'banner.dismiss': 'Dismiss',
    'error.noGateway': 'Cannot reach the privacy gateway',
  },
}

type T = (key: string, params?: Record<string, string | number>) => string

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  let out = text
  for (const [k, v] of Object.entries(params)) out = out.split(`{${k}}`).join(String(v))
  return out
}

/** Resolve a translator from the client locale service. */
function bindTranslator(ctx: any): any {
  try {
    const locale = ctx && ctx.get ? ctx.get('locale') : undefined
    if (locale && typeof locale.bind === 'function') return locale.bind(NS)
  } catch {
    /* fall through to the document hint */
  }
  return null
}

/**
 * Best-effort language guess used only when the locale service is unreachable,
 * so the panel still follows the interface language instead of always showing
 * Chinese or always showing English.
 */
function documentLocale(): string {
  try {
    const lang = String((globalThis as any).document?.documentElement?.lang || '').toLowerCase()
    if (lang) return lang
    const nav = String((globalThis as any).navigator?.language || '').toLowerCase()
    return nav
  } catch {
    return ''
  }
}

/**
 * The translator is resolved lazily on every call.
 *
 * The locale service is provided by a sibling client plugin that itself injects
 * `slots`, `remote` and `settingsScope`, so its `apply` may run AFTER this
 * plugin's — looking it up once during apply silently produced the English
 * fallback in a Chinese interface. Re-resolving per call also means a language
 * switch needs no re-registration, because the settings label is a thunk the
 * panel re-reads on each projection.
 */
function makeT(ctx: any): T {
  let bound: any = null
  return (key: string, params?: Record<string, string | number>) => {
    if (bound === null) bound = bindTranslator(ctx) || false
    if (bound) {
      try {
        const out = bound(key)
        if (typeof out === 'string' && out !== key) return interpolate(out, params)
      } catch {
        /* fall through to the built-in dictionary */
      }
    }
    const lang = documentLocale()
    const dict = lang.startsWith('zh') ? DICT.zh : DICT.en
    const text = (dict as Record<string, string>)[key] ?? (DICT.en as Record<string, string>)[key] ?? key
    return interpolate(text, params)
  }
}

function clock(epoch: number): string {
  if (!epoch) return '-'
  const d = new Date(epoch * 1000)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/** Polls the Host routes, which proxy the loopback-only gateway API. */
function useExemptions() {
  const [list, setList] = useState<ExemptionList | null>(null)
  const [fresh, setFresh] = useState<ExemptionAuditRecord[]>([])
  const [online, setOnline] = useState(true)
  const cursor = useRef(0)
  const primed = useRef(false)
  const tickRef = useRef<() => Promise<void>>(async () => {})

  useEffect(() => {
    let cancelled = false
    const tick = async () => {
      try {
        const r = await fetch(`/api/${PKG}/exemptions`)
        if (!r.ok) throw new Error(String(r.status))
        const data = (await r.json()) as ExemptionList
        if (!cancelled) {
          setList(data)
          setOnline(true)
        }
      } catch {
        if (!cancelled) setOnline(false)
      }
      try {
        const r = await fetch(`/api/${PKG}/exemptions/audit?since=${cursor.current}&limit=40`)
        if (!r.ok) return
        const data = await r.json()
        const records: ExemptionAuditRecord[] = data?.records || []
        if (records.length) {
          cursor.current = Math.max(...records.map((x) => x.ts || 0), cursor.current)
          // The first poll only primes the cursor; it must not replay history.
          if (primed.current && !cancelled) {
            const decisions = records.filter((x) => x.action === 'add' || x.action === 'revoke')
            if (decisions.length) setFresh(decisions)
          }
        }
        primed.current = true
      } catch {
        /* audit is best-effort */
      }
    }
    tickRef.current = tick
    tick()
    const timer = setInterval(tick, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  return { list, fresh, online, clear: () => setFresh([]), refresh: () => tickRef.current() }
}

const card: React.CSSProperties = {
  background: 'var(--dsh-card-bg, rgba(255,255,255,0.03))',
  borderRadius: '10px',
  padding: '14px',
  border: '1px solid rgba(255,255,255,0.12)',
}
const dim: React.CSSProperties = { fontSize: '12px', opacity: 0.7 }

function StatusCard(props: {
  title: string
  badge: string
  tone: string
  rows: string[]
}): React.ReactElement {
  return React.createElement(
    'div',
    { style: { ...card, borderColor: props.tone } },
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' } },
      React.createElement('span', { style: { fontSize: '13px', fontWeight: 600 } }, props.title),
      React.createElement('span', { style: { fontSize: '11px', fontWeight: 600, color: props.tone } }, props.badge),
    ),
    React.createElement(
      'div',
      { style: { fontSize: '12px', opacity: 0.8, lineHeight: '1.7' } },
      props.rows.map((row, i) => React.createElement('div', { key: i }, row)),
    ),
  )
}

/**
 * Frame-wide banner for exemption and key changes.
 *
 * Reads the gateway's folded notification list rather than the audit trail, so a
 * retried operation is shown once. The first poll only primes the cursor; it
 * never replays history at the user.
 */
function NotificationBanner(props: { t: T }): React.ReactElement | null {
  const { t } = props
  const [item, setItem] = useState<any>(null)
  const cursor = useRef(0)
  const primed = useRef(false)

  useEffect(() => {
    let cancelled = false
    const tick = async () => {
      try {
        const r = await fetch(`/api/${PKG}/health`)
        if (!r.ok) return
        const data = await r.json()
        const notes = data?.notifications
        if (!notes || !Array.isArray(notes.items)) return
        const at = Number(notes.changed_at || 0)
        if (primed.current && at > cursor.current) {
          const newest = notes.items[notes.items.length - 1]
          if (newest && !cancelled) setItem(newest)
        }
        cursor.current = Math.max(cursor.current, at)
        primed.current = true
      } catch {
        /* the banner is best-effort */
      }
    }
    tick()
    const timer = setInterval(tick, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  if (!item) return null
  const added = item.kind === 'add'
  const accent = added ? '#f59e0b' : item.kind === 'key-change' ? '#a78bfa' : '#22c55e'

  return React.createElement(
    'div',
    {
      role: 'status',
      style: {
        position: 'fixed',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9000,
        pointerEvents: 'auto',
        width: 'min(620px, calc(100vw - 32px))',
        background: 'rgba(20,20,24,0.97)',
        border: `1px solid ${accent}`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: '10px',
        padding: '12px 14px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
        color: '#f1f5f9',
        fontSize: '13px',
        lineHeight: '1.55',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
    },
    React.createElement(
      'div',
      { style: { display: 'flex', alignItems: 'flex-start', gap: '10px' } },
      React.createElement('span', null, added ? '⚠️' : item.kind === 'key-change' ? '🔑' : '✅'),
      React.createElement(
        'div',
        { style: { flex: 1, minWidth: 0 } },
        React.createElement(
          'div',
          { style: { fontWeight: 700, color: accent, marginBottom: '2px', wordBreak: 'break-all' } },
          item.title || item.dedupe_key,
        ),
        item.detail
          ? React.createElement('div', { style: { opacity: 0.9 } }, item.detail)
          : null,
        React.createElement(
          'div',
          { style: { opacity: 0.6, fontSize: '12px' } },
          `${t('exempt.bannerBy')}: ${item.actor || '-'}`,
        ),
      ),
      React.createElement(
        'button',
        {
          onClick: () => setItem(null),
          title: t('banner.dismiss'),
          style: {
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '15px',
            lineHeight: 1,
            padding: '2px 4px',
          },
        },
        '✕',
      ),
    ),
  )
}

function ExemptionCard(props: { t: T }): React.ReactElement {
  const { t } = props
  const { list, online, refresh } = useExemptions()
  const entries: ExemptionEntry[] = list?.entries || []
  const stats = list?.stats
  const tone = !online ? '#9ca3af' : entries.length ? '#fbbf24' : '#4ade80'

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  const beginEdit = () => {
    setDraft(entries.map((e) => e.term).join('\n'))
    setNote(null)
    setEditing(true)
  }

  /** Apply the edit as a diff, so existing reasons/hits survive a re-order. */
  const save = async () => {
    const next = new Set(
      draft
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    )
    const current = new Map(entries.map((e) => [e.term, e]))
    const added = [...next].filter((term) => !current.has(term))
    const removed = [...current.keys()].filter((term) => !next.has(term))

    if (!added.length && !removed.length) {
      setEditing(false)
      return
    }
    setBusy(true)
    try {
      for (const term of removed) {
        await fetch(`/api/${PKG}/exemptions`, {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ term, reason: t('exempt.addedByPanel'), actor: 'human:panel' }),
        })
      }
      for (const term of added) {
        const r = await fetch(`/api/${PKG}/exemptions`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ term, reason: t('exempt.addedByPanel'), actor: 'human:panel' }),
        })
        if (!r.ok) {
          const d = await r.json().catch(() => ({}))
          setNote(d.error || t('sandbox.fail'))
          setBusy(false)
          return
        }
      }
      setNote(t('exempt.applied', { added: added.length, removed: removed.length }))
      setEditing(false)
      await refresh()
    } catch (e: any) {
      setNote(e?.message || t('sandbox.fail'))
    } finally {
      setBusy(false)
    }
  }

  return React.createElement(
    'div',
    {
      style: {
        ...card,
        borderColor: entries.length ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.12)',
      },
    },
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' } },
      React.createElement('span', { style: { fontSize: '13px', fontWeight: 600 } }, t('exempt.title')),
      React.createElement(
        'span',
        { style: { display: 'flex', gap: '10px', alignItems: 'center' } },
        React.createElement(
          'span',
          { style: { fontSize: '11px', fontWeight: 600, color: tone } },
          !online
            ? t('exempt.apiDown')
            : entries.length
              ? t('exempt.active', { count: entries.length })
              : t('exempt.allFiltered'),
        ),
        online && !editing
          ? React.createElement(
              'button',
              {
                onClick: beginEdit,
                style: {
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: '6px',
                  color: 'inherit',
                  fontSize: '11px',
                  padding: '2px 8px',
                  cursor: 'pointer',
                },
              },
              t('exempt.edit'),
            )
          : null,
      ),
    ),

    !online && React.createElement('div', { style: { ...dim, color: '#fbbf24' } }, t('exempt.apiDownHint')),

    editing
      ? React.createElement(
          'div',
          null,
          React.createElement('div', { style: { ...dim, marginBottom: '6px' } }, t('exempt.editHint')),
          React.createElement('textarea', {
            value: draft,
            onChange: (e: any) => setDraft(e.target.value),
            rows: Math.max(4, entries.length + 2),
            spellCheck: false,
            style: {
              width: '100%',
              boxSizing: 'border-box',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '6px',
              color: 'inherit',
              padding: '8px',
              fontSize: '12px',
              fontFamily: 'monospace',
              lineHeight: '1.6',
            },
          }),
          React.createElement(
            'div',
            { style: { display: 'flex', gap: '8px', marginTop: '8px' } },
            React.createElement(
              'button',
              {
                onClick: save,
                disabled: busy,
                style: {
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: 'var(--dsh-primary, #3b82f6)',
                  color: '#fff',
                  border: 'none',
                  cursor: busy ? 'not-allowed' : 'pointer',
                  opacity: busy ? 0.6 : 1,
                },
              },
              busy ? t('exempt.saving') : t('exempt.save'),
            ),
            React.createElement(
              'button',
              {
                onClick: () => setEditing(false),
                disabled: busy,
                style: {
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  background: 'transparent',
                  color: 'inherit',
                  border: '1px solid rgba(255,255,255,0.18)',
                  cursor: busy ? 'not-allowed' : 'pointer',
                },
              },
              t('exempt.cancel'),
            ),
          ),
        )
      : React.createElement(
          'div',
          null,
          online && !entries.length && React.createElement('div', { style: dim }, t('exempt.empty')),
          entries.map((e, i) =>
            React.createElement(
              'div',
              {
                key: i,
                style: {
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.18)',
                  marginBottom: '6px',
                },
              },
              React.createElement(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', gap: '8px' } },
                React.createElement(
                  'code',
                  { style: { fontSize: '12px', wordBreak: 'break-all', color: '#fde68a' } },
                  e.term,
                ),
                React.createElement(
                  'span',
                  { style: { fontSize: '11px', opacity: 0.75, whiteSpace: 'nowrap' } },
                  e.permanent ? t('exempt.permanent') : t('exempt.until', { time: clock(e.expires_at) }),
                ),
              ),
              React.createElement(
                'div',
                { style: { fontSize: '11px', opacity: 0.7, marginTop: '3px' } },
                `${t('exempt.reason')}: ${e.reason || t('exempt.noReason')}`,
              ),
              React.createElement(
                'div',
                { style: { fontSize: '11px', opacity: 0.55, marginTop: '2px' } },
                `${t('exempt.scope')} ${e.scope} · ${t('exempt.actor')} ${e.actor} · ${t('exempt.hits')} ${e.hits}`,
              ),
            ),
          ),
          entries.length && stats
            ? React.createElement(
                'div',
                { style: { fontSize: '11px', opacity: 0.45, marginTop: '4px' } },
                `adds ${stats.adds} · revokes ${stats.revokes} · hits ${stats.session_hits}`,
              )
            : null,
        ),

    note
      ? React.createElement(
          'div',
          { style: { fontSize: '12px', marginTop: '8px', color: note.includes(t('sandbox.fail')) ? '#f87171' : '#4ade80' } },
          note,
        )
      : null,
  )
}

/** Optional passphrase for the encrypted persistence store. */
function KeyConfigCard(props: { t: T }): React.ReactElement {
  const { t } = props
  const [cfg, setCfg] = useState<any>(null)
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/${PKG}/key`)
      if (!r.ok) throw new Error(String(r.status))
      const d = await r.json()
      setCfg(d.config)
    } catch {
      setCfg(null)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const submit = async (mode: 'password' | 'file') => {
    setMsg(null)
    if (mode === 'password') {
      if (pw.length < 8) {
        setMsg({ ok: false, text: t('key.tooShort') })
        return
      }
      if (pw !== pw2) {
        setMsg({ ok: false, text: t('key.mismatch') })
        return
      }
    }
    setBusy(true)
    try {
      const r = await fetch(`/api/${PKG}/key`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode, password: mode === 'password' ? pw : undefined, actor: 'human:panel' }),
      })
      const d = await r.json()
      if (!r.ok || !d.ok) {
        setMsg({ ok: false, text: d.error || t('sandbox.fail') })
        return
      }
      const count = d.result?.reencrypted ?? 0
      setMsg({
        ok: true,
        text: (mode === 'password' ? t('key.rotated', { count }) : t('key.rotatedClear')),
      })
      setPw('')
      setPw2('')
      await load()
    } catch (e: any) {
      setMsg({ ok: false, text: e?.message || t('sandbox.fail') })
    } finally {
      setBusy(false)
    }
  }

  const isPassword = cfg?.mode === 'password'

  return React.createElement(
    'div',
    { style: { ...card, marginTop: '16px' } },
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' } },
      React.createElement('span', { style: { fontSize: '13px', fontWeight: 600 } }, t('key.title')),
      React.createElement(
        'span',
        { style: { fontSize: '11px', fontWeight: 600, color: isPassword ? '#c084fc' : '#9ca3af' } },
        isPassword ? t('key.mode.password') : t('key.mode.file'),
      ),
    ),
    cfg
      ? React.createElement(
          'div',
          { style: { fontSize: '11px', opacity: 0.6, marginBottom: '10px' } },
          `${t('key.current')}: ${cfg.effective_source} · ${t('key.vaultRows')}: ${cfg.vault_rows}` +
            (isPassword && cfg.password_set ? '' : '' ),
        )
      : React.createElement('div', { style: dim }, t('exempt.apiDownHint')),
    React.createElement('div', { style: { ...dim, marginBottom: '10px' } }, t('key.warn')),
    React.createElement(
      'div',
      { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } },
      React.createElement('input', {
        type: 'password',
        value: pw,
        placeholder: t('key.passwordPlaceholder'),
        onChange: (e: any) => setPw(e.target.value),
        style: {
          flex: '1 1 200px',
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '6px',
          color: 'inherit',
          padding: '6px 8px',
          fontSize: '12px',
        },
      }),
      React.createElement('input', {
        type: 'password',
        value: pw2,
        placeholder: t('key.confirmPlaceholder'),
        onChange: (e: any) => setPw2(e.target.value),
        style: {
          flex: '1 1 200px',
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '6px',
          color: 'inherit',
          padding: '6px 8px',
          fontSize: '12px',
        },
      }),
      React.createElement(
        'button',
        {
          onClick: () => submit('password'),
          disabled: busy,
          style: {
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            background: 'var(--dsh-primary, #3b82f6)',
            color: '#fff',
            border: 'none',
            cursor: busy ? 'not-allowed' : 'pointer',
            opacity: busy ? 0.6 : 1,
          },
        },
        busy ? t('key.saving') : t('key.save'),
      ),
      isPassword
        ? React.createElement(
            'button',
            {
              onClick: () => submit('file'),
              disabled: busy,
              style: {
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                background: 'transparent',
                color: 'inherit',
                border: '1px solid rgba(255,255,255,0.18)',
                cursor: busy ? 'not-allowed' : 'pointer',
              },
            },
            t('key.clear'),
          )
        : null,
    ),
    msg
      ? React.createElement(
          'div',
          { style: { fontSize: '12px', marginTop: '8px', color: msg.ok ? '#4ade80' : '#f87171' } },
          msg.text,
          msg.ok ? ` · ${t('key.restartHint')}` : '',
        )
      : null,
  )
}

function Panel(props: { t: T }): React.ReactElement {
  const { t } = props
  const [status, setStatus] = useState<PrivacyGuardStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState<string>(
    'api_key = "sk-proj-abcdefghijklmnopqrstuvwxyz123456"\n' +
      'db_url = "postgres://root:SuperSecret123@db.internal:5432/main"\n' +
      'safe_word = "office-N100"',
  )
  const [result, setResult] = useState<DryRunResponse | null>(null)
  const [running, setRunning] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`/api/${PKG}/status`)
      if (!r.ok) throw new Error(String(r.status))
      setStatus((await r.json()) as PrivacyGuardStatus)
      setError(null)
    } catch (e: any) {
      setError(e?.message || t('error.noGateway'))
    }
  }, [t])

  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, POLL_MS)
    return () => clearInterval(timer)
  }, [refresh])

  const run = async () => {
    if (!input.trim()) return
    setRunning(true)
    try {
      const r = await fetch(`/api/${PKG}/dry-run`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: input }),
      })
      setResult((await r.json()) as DryRunResponse)
    } catch (e: any) {
      setResult({ ok: false, error: e?.message || t('sandbox.fail') })
    } finally {
      setRunning(false)
    }
  }

  const gw = status?.gateway
  const stats = gw?.stats
  const persist = stats?.persist

  return React.createElement(
    'div',
    {
      style: {
        padding: '20px',
        maxWidth: '960px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--dsh-text, #e2e8f0)',
      },
    },
    React.createElement(
      'h2',
      { style: { margin: '0 0 16px', fontSize: '18px', fontWeight: 600 } },
      t('panel.title'),
    ),

    React.createElement(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        },
      },
      React.createElement(StatusCard, {
        title: t('gateway.card'),
        badge: gw?.online ? t('gateway.active') : t('gateway.offline'),
        tone: gw?.online ? '#4ade80' : '#f87171',
        rows: [String(gw?.url || ''), String(stats?.active_vault_mappings ?? 0)],
      }),
      React.createElement(StatusCard, {
        title: t('classifier.card'),
        badge: status?.classifier.online ? t('classifier.online') : t('classifier.offline'),
        tone: status?.classifier.online ? '#60a5fa' : '#9ca3af',
        rows: [String(status?.classifier.url || ''), String(status?.classifier.modelAlias || '')],
      }),
      React.createElement(StatusCard, {
        title: t('vault.card'),
        badge: persist?.enabled ? t('vault.enabled') : t('vault.memory'),
        tone: persist?.enabled ? '#c084fc' : '#9ca3af',
        rows: [String(persist?.vault_rows ?? 0), String(persist?.key_source === 'password' ? 'PBKDF2' : 'key file')],
      }),
    ),

    React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' } },
      [
        { label: t('metric.redacted'), value: stats?.total_redacted_secrets ?? 0, color: '#38bdf8' },
        { label: t('metric.restored'), value: stats?.total_restored_secrets ?? 0, color: '#34d399' },
        { label: t('metric.vault'), value: persist?.vault_rows ?? stats?.active_vault_mappings ?? 0, color: '#fbbf24' },
        { label: t('metric.hits'), value: stats?.layer1.hits ?? 0, color: '#a78bfa' },
      ].map((m, i) =>
        React.createElement(
          'div',
          { key: i, style: { ...card, padding: '10px', textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: '11px', opacity: 0.6 } }, m.label),
          React.createElement('div', { style: { fontSize: '20px', fontWeight: 700, color: m.color } }, m.value),
        ),
      ),
    ),

    React.createElement(ExemptionCard, { t }),

    React.createElement(KeyConfigCard, { t }),

    React.createElement(
      'div',
      { style: { ...card, marginTop: '16px' } },
      React.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' } },
        React.createElement('span', { style: { fontSize: '13px', fontWeight: 600 } }, t('sandbox.title')),
        React.createElement(
          'button',
          {
            onClick: run,
            disabled: running || !gw?.online,
            style: {
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              background: 'var(--dsh-primary, #3b82f6)',
              color: '#fff',
              border: 'none',
              cursor: running || !gw?.online ? 'not-allowed' : 'pointer',
              opacity: running || !gw?.online ? 0.6 : 1,
            },
          },
          running ? t('sandbox.running') : t('sandbox.run'),
        ),
      ),
      React.createElement('textarea', {
        value: input,
        onChange: (e: any) => setInput(e.target.value),
        rows: 4,
        style: {
          width: '100%',
          boxSizing: 'border-box',
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px',
          color: 'inherit',
          padding: '8px',
          fontSize: '12px',
          fontFamily: 'monospace',
        },
      }),
      result &&
        React.createElement(
          'div',
          { style: { marginTop: '10px', fontSize: '12px' } },
          React.createElement(
            'div',
            { style: { color: result.ok ? '#4ade80' : '#f87171', marginBottom: '6px' } },
            result.ok ? t('sandbox.ok') : t('sandbox.fail'),
            result.ok && result.layer1_applied ? ` · ${t('sandbox.hitLayer1')}` : '',
            result.ok && result.exempt_spans
              ? ` · ${t('sandbox.exempted', { count: result.exempt_spans })}`
              : '',
          ),
          React.createElement(
            'pre',
            {
              style: {
                margin: 0,
                padding: '8px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '4px',
                overflowX: 'auto',
                fontSize: '11px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
              },
            },
            result.ok
              ? typeof result.redacted === 'object'
                ? JSON.stringify(result.redacted, null, 2)
                : String(result.redacted)
              : result.error,
          ),
        ),
    ),

    error
      ? React.createElement('div', { style: { ...dim, marginTop: '10px', color: '#f87171' } }, error)
      : null,
  )
}

export function apply(ctx: any): void {
  const slots = ctx.get ? ctx.get('slots') : ctx.slots
  if (!slots) return

  // Register both dictionaries as early as the service allows. `makeT` resolves
  // the translator lazily on every call, so a locale service that appears later
  // (its own apply injects slots/remote/settingsScope and can run after ours)
  // is still picked up instead of silently falling back to English.
  try {
    const locale = ctx.get ? ctx.get('locale') : undefined
    if (locale && typeof locale.register === 'function') locale.register(NS, DICT)
  } catch {
    /* the built-in dictionary still localises the panel */
  }
  const t: T = makeT(ctx)

  slots.inject('settings.section', () => {
    try {
      return slots.register(
        {
          name: 'settings.section',
          id: NS,
          order: 85,
          label: () => t('section.label'),
        },
        () => React.createElement(Panel, { t }),
      )
    } catch {
      return () => {}
    }
  })

  // Frame-wide overlay: the in-page banner announcing exemption and key changes.
  slots.inject('shell.overlay', () => {
    try {
      return slots.register(
        { name: 'shell.overlay', id: 'privacy-guard-exemption-banner', order: 60 },
        () => React.createElement(NotificationBanner, { t }),
      )
    } catch {
      return () => {}
    }
  })
}
