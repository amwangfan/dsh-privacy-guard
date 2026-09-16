import React, { useState, useEffect, useCallback, useRef } from 'react'
import type {
  PrivacyGuardStatus,
  DryRunResponse,
  ExemptionEntry,
  ExemptionList,
  ExemptionAuditRecord,
} from './types.js'

export const name = 'dsh-privacy-guard-client'

const EXEMPTION_POLL_MS = 4000

function formatRemaining(seconds: number): string {
  if (!seconds || seconds <= 0) return '已过期'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时 ${Math.floor((seconds % 3600) / 60)} 分`
  return `${Math.floor(seconds / 86400)} 天 ${Math.floor((seconds % 86400) / 3600)} 小时`
}

function formatClock(epoch: number): string {
  if (!epoch) return '--'
  const d = new Date(epoch * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * Polls the Host route (which proxies the loopback-only gateway API) and returns
 * the active exemption list plus any audit records newer than the last poll.
 */
function useExemptions() {
  const [list, setList] = useState<ExemptionList | null>(null)
  const [freshRecords, setFreshRecords] = useState<ExemptionAuditRecord[]>([])
  const [online, setOnline] = useState<boolean>(true)
  const cursor = useRef<number>(0)
  const primed = useRef<boolean>(false)

  useEffect(() => {
    let cancelled = false
    const tick = async () => {
      try {
        const r = await fetch('/api/dsh-privacy-guard/exemptions')
        if (r.ok) {
          const data = (await r.json()) as ExemptionList
          if (!cancelled) {
            setList(data)
            setOnline(true)
          }
        } else if (!cancelled) {
          setOnline(false)
        }
      } catch {
        if (!cancelled) setOnline(false)
      }
      try {
        const r = await fetch(
          `/api/dsh-privacy-guard/exemptions/audit?since=${cursor.current}&limit=40`,
        )
        if (r.ok) {
          const data = await r.json()
          const records: ExemptionAuditRecord[] = (data?.records || []) as ExemptionAuditRecord[]
          if (records.length) {
            cursor.current = Math.max(...records.map((rec) => rec.ts || 0), cursor.current)
            // The first poll only establishes the cursor; it must not replay history.
            if (primed.current && !cancelled) {
              const decisions = records.filter((rec) => rec.action === 'add' || rec.action === 'revoke')
              if (decisions.length) setFreshRecords(decisions)
            }
          }
          primed.current = true
        }
      } catch {
        /* audit is best-effort */
      }
    }
    tick()
    const timer = setInterval(tick, EXEMPTION_POLL_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  return { list, freshRecords, online, dismissFresh: () => setFreshRecords([]) }
}

function ExemptionBanner(): React.ReactElement | null {
  const { freshRecords, dismissFresh } = useExemptions()
  if (!freshRecords.length) return null

  const primary = freshRecords[0]
  const isAdd = primary.action === 'add'
  const accent = isAdd ? '#f59e0b' : '#22c55e'
  const title = isAdd
    ? `过滤已暂停：${primary.term}`
    : `过滤已恢复：${primary.term}`

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
        width: 'min(720px, calc(100vw - 32px))',
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
      React.createElement('span', { style: { fontSize: '16px', lineHeight: '1.2' } }, isAdd ? '⚠️' : '✅'),
      React.createElement(
        'div',
        { style: { flex: 1, minWidth: 0 } },
        React.createElement(
          'div',
          { style: { fontWeight: 700, color: accent, marginBottom: '4px' } },
          title,
        ),
        React.createElement(
          'div',
          { style: { opacity: 0.9 } },
          React.createElement('span', { style: { opacity: 0.7 } }, '原因：'),
          primary.reason || '(未记录)',
        ),
        React.createElement(
          'div',
          { style: { opacity: 0.65, fontSize: '12px', marginTop: '2px' } },
          `操作者：${primary.actor || 'unknown'}` +
            (freshRecords.length > 1 ? ` · 本次共 ${freshRecords.length} 条豁免变更` : ''),
        ),
        isAdd &&
          React.createElement(
            'div',
            { style: { opacity: 0.6, fontSize: '11px', marginTop: '4px' } },
            '该词在有效期结束后自动恢复过滤；其余敏感信息仍在脱敏。',
          ),
      ),
      React.createElement(
        'button',
        {
          onClick: dismissFresh,
          title: '关闭提醒',
          style: {
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '16px',
            lineHeight: 1,
            padding: '2px 4px',
          },
        },
        '✕',
      ),
    ),
  )
}

function ExemptionCard(): React.ReactElement {
  const { list, online } = useExemptions()
  const stats = list?.stats
  const entries: ExemptionEntry[] = list?.entries || []

  return React.createElement(
    'div',
    {
      style: {
        background: entries.length ? 'rgba(245,158,11,0.06)' : 'var(--dsh-card-bg, rgba(255,255,255,0.02))',
        borderRadius: '10px',
        border: `1px solid ${entries.length ? 'rgba(245,158,11,0.35)' : 'var(--dsh-border, rgba(255,255,255,0.08))'}`,
        padding: '16px',
        marginBottom: '24px',
      },
    },
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' } },
      React.createElement('span', { style: { fontSize: '14px', fontWeight: 600 } }, '🔓 豁免名单（暂停过滤的词）'),
      React.createElement(
        'span',
        {
          style: {
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: 600,
            background: !online
              ? 'rgba(156,163,175,0.2)'
              : entries.length
                ? 'rgba(245,158,11,0.2)'
                : 'rgba(34,197,94,0.2)',
            color: !online ? '#9ca3af' : entries.length ? '#fbbf24' : '#4ade80',
          },
        },
        !online ? '○ 网关豁免接口不可用' : entries.length ? `● ${entries.length} 条生效中` : '● 全量过滤中',
      ),
    ),
    React.createElement(
      'div',
      { style: { fontSize: '12px', opacity: 0.75, lineHeight: '1.6', marginBottom: entries.length ? '12px' : 0 } },
      '默认对全部流量过滤；被豁免的词只在有效期内跳过脱敏，到期自动恢复。每条豁免都必须写明理由，且都会写入审计日志。',
    ),
    !online &&
      React.createElement(
        'div',
        { style: { fontSize: '12px', color: '#fbbf24', lineHeight: '1.6' } },
        '无法读取网关豁免列表：确认 privacy-gateway 已加载含豁免功能的新版本（systemctl restart privacy-gateway）。',
      ),
    entries.map((entry, idx) =>
      React.createElement(
        'div',
        {
          key: idx,
          style: {
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'rgba(0,0,0,0.18)',
            border: '1px solid rgba(245,158,11,0.18)',
            marginBottom: '8px',
          },
        },
        React.createElement(
          'div',
          { style: { display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'baseline' } },
          React.createElement(
            'code',
            { style: { fontSize: '12px', wordBreak: 'break-all', color: '#fde68a' } },
            entry.term,
          ),
          React.createElement(
            'span',
            { style: { fontSize: '11px', opacity: 0.8, whiteSpace: 'nowrap' } },
            `剩余 ${formatRemaining(entry.remaining_seconds)}`,
          ),
        ),
        React.createElement(
          'div',
          { style: { fontSize: '12px', opacity: 0.85, marginTop: '4px' } },
          React.createElement('span', { style: { opacity: 0.65 } }, '理由：'),
          entry.reason,
        ),
        React.createElement(
          'div',
          { style: { fontSize: '11px', opacity: 0.6, marginTop: '3px' } },
          `范围 ${entry.scope} · 操作者 ${entry.actor} · 命中 ${entry.hits} 次 · 到期 ${formatClock(entry.expires_at)}`,
        ),
      ),
    ),
    stats &&
      React.createElement(
        'div',
        { style: { fontSize: '11px', opacity: 0.55, marginTop: '4px' } },
        `本次进程累计：新增 ${stats.adds} · 撤销 ${stats.revokes} · 命中 ${stats.session_hits} · ` +
          `默认有效期 ${formatRemaining(stats.default_ttl_seconds)} · 上限 ${formatRemaining(stats.max_ttl_seconds)}`,
      ),
  )
}

function ExemptionCliHint(): React.ReactElement {
  const command = '/root/privacy-gateway/scripts/privacy-exempt.sh'
  const lines = [
    `allow  --term "<要放行的词>" --reason "<为什么它不敏感>" [--scope all|layer0|layer1] [--ttl 3600]`,
    `revoke --term "<词>" --reason "<为什么可以恢复过滤>"`,
    'list / audit / health',
  ]
  return React.createElement(
    'div',
    {
      style: {
        background: 'var(--dsh-card-bg, rgba(255,255,255,0.02))',
        borderRadius: '10px',
        border: '1px solid var(--dsh-border, rgba(255,255,255,0.08))',
        padding: '16px',
        marginBottom: '24px',
        fontSize: '12px',
        lineHeight: '1.7',
      },
    },
    React.createElement(
      'div',
      { style: { fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#60a5fa' } },
      '🤖 AI 如何申请豁免（默认全开过滤，豁免需理由且会自动过期）',
    ),
    React.createElement(
      'div',
      { style: { opacity: 0.85 } },
      React.createElement('div', null, '当某个词必须原样出现在外发内容里（例如要贴到公开工单上的链接片段），AI 用下面这条命令申请放行，并必须在回复中说明理由：'),
      React.createElement(
        'pre',
        {
          style: {
            margin: '8px 0',
            padding: '10px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '6px',
            overflowX: 'auto',
            fontSize: '11px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
          },
        },
        `${command} ${lines[0]}\n${command} ${lines[1]}\n${command} ${lines[2]}`,
      ),
      React.createElement('div', null, '缺 --reason、理由过短、或有效期超过 7 天都会被网关直接拒绝；豁免到期后过滤自动恢复。'),
    ),
  )
}

export function PrivacyGuardView(): React.ReactElement {
  const [status, setStatus] = useState<PrivacyGuardStatus | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Sandbox state
  const [inputVal, setInputVal] = useState<string>(
    '# 测试敏感凭据脱密（支持正则、千问0.5B模型判定、以及自定义密码密钥）：\napi_key = "sk-proj-abcdefghijklmnopqrstuvwxyz123456"\ndb_url = "postgres://root:SuperSecret123@db.internal:5432/main"\npassword = "my_private_db_password_2026"\ncustom_token = "Zx7Qm2Vt9Lp4Kd8Wn3Rf"\nsafe_word = "hello world office-N100"',
  )
  const [dryRunRes, setDryRunRes] = useState<DryRunResponse | null>(null)
  const [dryRunLoading, setDryRunLoading] = useState<boolean>(false)

  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch('/api/dsh-privacy-guard/status')
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = (await r.json()) as PrivacyGuardStatus
      setStatus(data)
      setError(null)
    } catch (e: any) {
      setError(e.message || '无法连接到隐私网关')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const timer = setInterval(fetchStatus, 4000)
    return () => clearInterval(timer)
  }, [fetchStatus])

  const handleDryRun = async () => {
    if (!inputVal.trim()) return
    setDryRunLoading(true)
    try {
      const r = await fetch('/api/dsh-privacy-guard/dry-run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: inputVal }),
      })
      const data = (await r.json()) as DryRunResponse
      setDryRunRes(data)
    } catch (e: any) {
      setDryRunRes({ ok: false, error: e?.message || '测试调用失败' })
    } finally {
      setDryRunLoading(false)
    }
  }

  const gwOnline = status?.gateway.online ?? false
  const cfOnline = status?.classifier.online ?? false
  const stats = status?.gateway.stats
  const persist = stats?.persist

  return React.createElement(
    'div',
    {
      style: {
        padding: '24px',
        maxWidth: '1000px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--dsh-text, #e2e8f0)',
      },
    },
    // Header
    React.createElement(
      'div',
      { style: { marginBottom: '24px', borderBottom: '1px solid var(--dsh-border, rgba(255,255,255,0.1))', paddingBottom: '16px' } },
      React.createElement('h2', { style: { margin: '0 0 8px 0', fontSize: '20px', fontWeight: 600 } }, '🛡️ DSH 隐私脱密网关 (Privacy Guard)'),
      React.createElement(
        'p',
        { style: { margin: 0, fontSize: '13px', opacity: 0.75, lineHeight: '1.5' } },
        '实时监控本地 Privacy Gateway (:8317)、Qwen2.5-0.5B 本地小模型 (:8319) 及 AES-GCM 本地加密持久化存储状态。敏感凭据在离开内网前强制脱敏，流式回显无感还原。',
      ),
    ),

    // Status Badges Row (3 cards: Gateway, Classifier, Persistent Storage)
    React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' } },
      // 1. Gateway Card
      React.createElement(
        'div',
        {
          style: {
            background: 'var(--dsh-card-bg, rgba(255,255,255,0.03))',
            borderRadius: '10px',
            border: `1px solid ${gwOnline ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            padding: '16px',
          },
        },
        React.createElement(
          'div',
          { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' } },
          React.createElement('span', { style: { fontSize: '14px', fontWeight: 600 } }, '网络脱密网关 (:8317)'),
          React.createElement(
            'span',
            {
              style: {
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: gwOnline ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                color: gwOnline ? '#4ade80' : '#f87171',
                fontWeight: 600,
              },
            },
            gwOnline ? '● 正在保护 (Active)' : '○ 未连接 (Offline)',
          ),
        ),
        React.createElement(
          'div',
          { style: { fontSize: '12px', opacity: 0.8, lineHeight: '1.8' } },
          React.createElement('div', null, `监听地址: ${status?.gateway.url || 'http://127.0.0.1:8317'}`),
          React.createElement('div', null, `在线时长: ${stats ? `${Math.floor(stats.uptime_seconds / 60)} 分钟` : '--'}`),
          React.createElement('div', null, `占位符规范: ${stats?.placeholder_prefix || '<SECRET_'}*`),
        ),
      ),
      // 2. Classifier Card
      React.createElement(
        'div',
        {
          style: {
            background: 'var(--dsh-card-bg, rgba(255,255,255,0.03))',
            borderRadius: '10px',
            border: `1px solid ${cfOnline ? 'rgba(59,130,246,0.3)' : 'rgba(156,163,175,0.3)'}`,
            padding: '16px',
          },
        },
        React.createElement(
          'div',
          { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' } },
          React.createElement('span', { style: { fontSize: '14px', fontWeight: 600 } }, '千问 0.5B 残差模型 (:8319)'),
          React.createElement(
            'span',
            {
              style: {
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: cfOnline ? 'rgba(59,130,246,0.2)' : 'rgba(156,163,175,0.2)',
                color: cfOnline ? '#60a5fa' : '#9ca3af',
                fontWeight: 600,
              },
            },
            cfOnline ? '● 在线 (Qwen2.5-0.5B)' : '○ 未加载 (Offline)',
          ),
        ),
        React.createElement(
          'div',
          { style: { fontSize: '12px', opacity: 0.8, lineHeight: '1.8' } },
          React.createElement('div', null, `推理端点: ${status?.classifier.url || 'http://127.0.0.1:8319'}`),
          React.createElement('div', null, `并发模式: 2 槽位并行 (Parallel)`),
          React.createElement('div', null, `Layer 1 缓存: ${stats?.layer1.cache_size ?? '--'} 条`),
        ),
      ),
      // 3. Persistent Vault Card
      React.createElement(
        'div',
        {
          style: {
            background: 'var(--dsh-card-bg, rgba(255,255,255,0.03))',
            borderRadius: '10px',
            border: `1px solid ${persist?.enabled ? 'rgba(168,85,247,0.3)' : 'rgba(156,163,175,0.3)'}`,
            padding: '16px',
          },
        },
        React.createElement(
          'div',
          { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' } },
          React.createElement('span', { style: { fontSize: '14px', fontWeight: 600 } }, '本地加密持久化 (SQLite)'),
          React.createElement(
            'span',
            {
              style: {
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: persist?.enabled ? 'rgba(168,85,247,0.2)' : 'rgba(156,163,175,0.2)',
                color: persist?.enabled ? '#c084fc' : '#9ca3af',
                fontWeight: 600,
              },
            },
            persist?.enabled ? '● 已启用 (AES-GCM)' : '○ 纯内存 (Memory)',
          ),
        ),
        React.createElement(
          'div',
          { style: { fontSize: '12px', opacity: 0.8, lineHeight: '1.8' } },
          React.createElement('div', null, `落盘凭据: ${persist?.vault_rows ?? '--'} 条`),
          React.createElement('div', null, `模型缓存: ${persist?.layer1_rows ?? '--'} 条`),
          React.createElement('div', null, `密钥来源: ${persist?.key_source === 'password' ? '🔑 用户自定义密码 (PBKDF2)' : '📄 系统主密钥文件'}`),
        ),
      ),
    ),

    // Metrics Counters
    React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' } },
      [
        { label: '累计拦截脱敏', value: stats?.total_redacted_secrets ?? 0, color: '#38bdf8' },
        { label: '出网流式还原', value: stats?.total_restored_secrets ?? 0, color: '#34d399' },
        { label: 'Vault 凭据总库', value: persist?.vault_rows ?? (stats?.active_vault_mappings ?? 0), color: '#fbbf24' },
        { label: '0.5B 模型分类命中', value: stats?.layer1.hits ?? 0, color: '#a78bfa' },
      ].map((item, idx) =>
        React.createElement(
          'div',
          {
            key: idx,
            style: {
              background: 'var(--dsh-card-bg, rgba(255,255,255,0.02))',
              borderRadius: '8px',
              border: '1px solid var(--dsh-border, rgba(255,255,255,0.06))',
              padding: '12px 14px',
              textAlign: 'center',
            },
          },
          React.createElement('div', { style: { fontSize: '11px', opacity: 0.7, marginBottom: '6px' } }, item.label),
          React.createElement('div', { style: { fontSize: '22px', fontWeight: 700, color: item.color } }, item.value),
        ),
      ),
    ),

    // Active exemption list (redaction paused for these exact terms)
    React.createElement(ExemptionCard),

    // How an AI asks for an exemption
    React.createElement(ExemptionCliHint),

    // User Configuration & Custom Secrets Guide
    React.createElement(
      'div',
      {
        style: {
          background: 'var(--dsh-card-bg, rgba(255,255,255,0.02))',
          borderRadius: '10px',
          border: '1px solid var(--dsh-border, rgba(255,255,255,0.08))',
          padding: '16px',
          marginBottom: '24px',
          fontSize: '12px',
          lineHeight: '1.7',
        },
      },
      React.createElement('div', { style: { fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#60a5fa' } }, '⚙️ 用户自定义密码密钥与规则配置指引'),
      React.createElement(
        'div',
        { style: { opacity: 0.85 } },
        React.createElement('div', null, '• ', React.createElement('b', null, '自定义存储主密码 (Vault Password): '), '可通过环境变量 ', React.createElement('code', null, 'VAULT_PASSWORD="你的强口令"'), ' 自定义持久化数据库的 AES-256 加密密钥（采用 PBKDF2-HMAC-SHA256 派生），不再受限于单机随机文件。'),
        React.createElement('div', null, '• ', React.createElement('b', null, '自定义敏感凭据词表 (Custom Secrets): '), '可通过环境变量 ', React.createElement('code', null, 'CUSTOM_SECRETS="token1,password2"'), ' 或将敏感词写入 ', React.createElement('code', null, '/etc/privacy-gateway/custom_secrets.txt'), '。列表内的敏感词将作为 Layer 0 最高优先级强制脱密，零推理延迟。'),
      ),
    ),

    // Interactive Dry-run Sandbox
    React.createElement(
      'div',
      {
        style: {
          background: 'var(--dsh-card-bg, rgba(255,255,255,0.02))',
          borderRadius: '10px',
          border: '1px solid var(--dsh-border, rgba(255,255,255,0.08))',
          padding: '18px',
          marginBottom: '24px',
        },
      },
      React.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' } },
        React.createElement('span', { style: { fontSize: '14px', fontWeight: 600 } }, '🧪 在线泄密探测沙箱 (Dry-Run Tester)'),
        React.createElement(
          'button',
          {
            onClick: handleDryRun,
            disabled: dryRunLoading || !gwOnline,
            style: {
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              background: 'var(--dsh-primary, #3b82f6)',
              color: '#fff',
              border: 'none',
              cursor: dryRunLoading || !gwOnline ? 'not-allowed' : 'pointer',
              opacity: dryRunLoading || !gwOnline ? 0.6 : 1,
            },
          },
          dryRunLoading ? '探测中...' : '▶ 执行脱密测试 (Dry Run)',
        ),
      ),
      React.createElement(
        'div',
        { style: { fontSize: '12px', opacity: 0.7, marginBottom: '10px' } },
        '在下方贴入任意包含口令、Token、私钥或配置文本，测试网关两层规则（Layer 0 正则 + Layer 1 0.5B 判定 + 用户自定义密钥）的脱敏替换效果（纯本地仿真，不出网）：',
      ),
      React.createElement('textarea', {
        value: inputVal,
        onChange: (e: any) => setInputVal(e.target.value),
        rows: 4,
        style: {
          width: '100%',
          boxSizing: 'border-box',
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid var(--dsh-border, rgba(255,255,255,0.1))',
          borderRadius: '6px',
          color: 'var(--dsh-text, #f1f5f9)',
          padding: '10px',
          fontSize: '12px',
          fontFamily: 'monospace',
          marginBottom: '12px',
        },
      }),
      dryRunRes &&
        React.createElement(
          'div',
          {
            style: {
              padding: '12px',
              borderRadius: '6px',
              background: dryRunRes.ok ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${dryRunRes.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              fontSize: '12px',
            },
          },
          React.createElement(
            'div',
            { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 600 } },
            React.createElement('span', { style: { color: dryRunRes.ok ? '#4ade80' : '#f87171' } }, dryRunRes.ok ? '✓ 脱密成功 (出网文本已占位符化)' : '✗ 测试失败'),
            dryRunRes.layer1_applied && React.createElement('span', { style: { fontSize: '11px', color: '#93c5fd' } }, '★ 触发了 0.5B 本地模型判定'),
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
                color: '#e2e8f0',
              },
            },
            dryRunRes.ok
              ? typeof dryRunRes.redacted === 'object'
                ? JSON.stringify(dryRunRes.redacted, null, 2)
                : String(dryRunRes.redacted)
              : dryRunRes.error,
          ),
        ),
    ),

    // Footer Info
    React.createElement(
      'div',
      { style: { fontSize: '12px', opacity: 0.65, display: 'flex', justifyContent: 'space-between' } },
      React.createElement(
        'span',
        null,
        '开源项目: ',
        React.createElement('a', { href: 'https://github.com/amwangfan/privacy-gateway', target: '_blank', rel: 'noreferrer', style: { color: '#60a5fa', textDecoration: 'none' } }, 'privacy-gateway (GitHub)'),
      ),
      React.createElement(
        'span',
        null,
        '模型权重: ',
        React.createElement('a', { href: 'https://huggingface.co/amwangfan/privacy-gateway-v4-qwen2.5-0.5b', target: '_blank', rel: 'noreferrer', style: { color: '#60a5fa', textDecoration: 'none' } }, 'Qwen2.5-0.5B v4 (Hugging Face)'),
      ),
    ),
  )
}

export function apply(ctx: any): void {
  const slots = ctx.get ? ctx.get('slots') : ctx.slots
  if (!slots) return

  // Settings page: dashboard, sandbox, exemption list and CLI guidance.
  if (slots.inject) {
    slots.inject('settings.section', () => {
      try {
        return slots.register(
          {
            name: 'settings.section',
            id: 'dsh-privacy-guard',
            order: 85,
            label: () => '隐私脱密 (Privacy Guard)',
          },
          PrivacyGuardView,
        )
      } catch {
        return () => {}
      }
    })

    // Frame-wide banner announcing that filtering was paused/resumed for a term.
    // `shell.overlay` is the additive frame-wide layer; a fresh id sits beside
    // the shipped entries and never replaces them.
    try {
      slots.inject('shell.overlay', () => {
        try {
          return slots.register(
            { name: 'shell.overlay', id: 'privacy-guard-exemption-banner', order: 60 },
            ExemptionBanner,
          )
        } catch {
          return () => {}
        }
      })
    } catch {
      /* overlay is optional; the settings page still shows the list */
    }
  }
}
