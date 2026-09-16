# DSH Privacy Protection

**English** | [简体中文](README.md)

DeepSeek Harness (DSH) Web plugin for local privacy protection: gateway monitoring, an audit
dashboard, the exemption whitelist, encryption-key management, a credential-protected model entry,
and deployment controls.

> Named "Privacy Protection" rather than "redaction" because semantic sensitive-information
> filtering is planned.

Designed to accompany [amwangfan/privacy-gateway](https://github.com/amwangfan/privacy-gateway).

---

## 🌟 Features

1. **🛡️ Gateway & Model Health Probes**:
   - Live status of the local reverse proxy (`:8317`) and Qwen2.5-0.5B residual classifier (`:8319`).
2. **📊 Audit Metrics Dashboard**:
   - Real-time counters for redacted credentials (`API_KEY`, private keys, database passwords, JWTs, etc.).
   - Outbound DFA stream restoration counters.
   - Active memory vault entries count and persistent SQLite rows.
   - 0.5B model classification hits and cache metrics.
3. **⚙️ Custom Master Password & Secret List Guidance**:
   - Guidance for configuring custom master passphrase (`VAULT_PASSWORD`) using PBKDF2-HMAC-SHA256 to derive AES-256 keys.
   - Support for custom proprietary token lists via `CUSTOM_SECRETS` or `custom_secrets.txt`.
4. **🧪 Interactive Leak-Test Sandbox (Dry-Run Tester)**:
   - Built directly into the DSH Settings panel.
   - Paste any configuration or text with credentials to instantly preview redacted placeholders before actual LLM calls (100% local, zero WAN egress).
5. **🔑 Encryption key configuration (optional)**:
   - Choose between the generated key file and a custom passphrase; the passphrase is never echoed back.
   - Changing the key re-encrypts and verifies existing credentials first, rolls back on failure, and keeps older placeholders restorable.
6. **🔓 Exemption whitelist and in-page banner**:
   - The panel lists every term whose filtering is currently paused (scope, reason, actor, expiry, hits) and lets you **edit it line by line**: one term per line, removing a line revokes it.
   - When an exemption is added or revoked, an **in-page banner** (not a browser `alert`) reports which term, why, and who did it.
7. **🛡️ Credential-protected model entry**: copy an existing provider into a gateway-routed route in the model list while the original returns to the direct route.
8. **🚀 Deployment controls**: download and deploy the gateway or the model, start/stop/restart them, read their logs, and edit their addresses and ports — all from the panel.

---

## 🛡️ Credential-protected models (a second route in the model list)

The "Credential-protected models" card **copies an existing provider**, points its `baseURL` at the
local gateway and writes it into the model list in `~/.dsh/settings.yaml`, while moving the
**original provider back to the direct route**. The model list then carries both:

| Entry | Route | Use |
|---|---|---|
| `自建聚合` | direct backend `:8316` | no redaction wanted (fastest, no added latency) |
| `自建聚合(凭据保护)` | through the gateway `:8317` | redaction wanted |

**Selecting the entry marked "credential-protected" routes that model through the gateway.** No
restart is needed: `dsh-settings-file` watches the file with chokidar and publishes external edits
(a page refresh shows them).

The write loads the whole YAML document, changes only the provider block and writes it back, after
backing the file up as `settings.yaml.bak-plugin-*`; every other setting is verified unchanged.

---

## 🔓 Exemptions (allowlist)

**Default posture: everything is filtered.** An exemption pauses redaction for one exact literal term; it is not a global off switch, and the gateway enforces these constraints in code:

| Constraint | Detail |
|---|---|
| Reason | the agent entry point (CLI) requires a non-blank reason; the gateway HTTP API does not, so a human can set one without |
| Expiry | permanent by default, until revoked; pass `expires_at` only when a temporary exemption is wanted |
| Addressable by alias | `--term` accepts a vault alias such as `<SECRET_AWS_AKIA_1>`; the gateway resolves it, so the agent never handles plaintext |
| Scope | `layer0` (regex), `layer1` (0.5B residual classifier), or `all` |
| Audit trail | `add` / `revoke` / `expire` / `hit` all appended to `exemptions.jsonl` |
| Exact matching | boundary-matched against whole candidates, so allowlisting a short word never leaks a real key that contains it |
| Loopback only | the control API rejects any non-loopback request with 403 |

### Agent entry point

```bash
/root/privacy-gateway/scripts/privacy-exempt.sh allow  --term "<literal or vault alias>" --reason "<why it is safe>" [--scope all|layer0|layer1]
/root/privacy-gateway/scripts/privacy-exempt.sh revoke --term "<literal>" --reason "<why filtering can resume>"
/root/privacy-gateway/scripts/privacy-exempt.sh list
/root/privacy-gateway/scripts/privacy-exempt.sh audit
```

An agent that allowlists a term must also tell the user what it exempted and why; the plugin surfaces the same decision in the banner.

---

## 📦 Ecosystem Architecture

| Component | Role | Repository |
|---|---|---|
| **`dsh-privacy-guard`** (This Repo) | DSH Web plugin & dashboard (Node.js / React / Cordis) | [GitHub: amwangfan/dsh-privacy-guard](https://github.com/amwangfan/dsh-privacy-guard) |
| **`privacy-gateway`** | Local high-performance reverse proxy (Python / FastAPI / DFA) | [GitHub: amwangfan/privacy-gateway](https://github.com/amwangfan/privacy-gateway) |
| **`qwen2.5-0.5b-privacy`** | Lightweight edge model fine-tuned for credential classification | [HuggingFace: amwangfan/privacy-gateway-v4-qwen2.5-0.5b](https://huggingface.co/amwangfan/privacy-gateway-v4-qwen2.5-0.5b) |

---

## 🚀 Installation

```bash
# Add to your DSH web profile
dsh plugin --profile web add dsh-privacy-guard
```

Or install from local source (recommended while developing: rebuild and restart DSH to pick changes up):

```bash
cd /path/to/dsh-privacy-guard
npm run build                     # esbuild -> lib/index.js + lib/client.js
dsh plugin --profile web add link:$PWD
systemctl restart deepseek-harness.service
```

Open your DSH Web GUI -> **Settings** -> **Privacy Guard** to view the live dashboard,
the exemption list, and the in-page exemption banner.

Self-check:

```bash
./scripts/verify.sh
```

> DSH authenticates every `/api/*` route, so an unauthenticated probe only sees 401.
> Confirm the plugin really loaded via the Settings panel and
> `journalctl -u deepseek-harness.service | grep -i privacy`.

---

## 🏪 DSH Marketplace Entry (`community.json`)

```json
{
  "id": "dsh-privacy-guard",
  "name": "隐私脱密守护",
  "nameEn": "Privacy Guard",
  "author": "amwangfan",
  "description": "本地隐私脱敏防线看板：实时监控 API Token、私钥、数据库密码出网脱敏与流式还原状态，内置 Qwen2.5-0.5B 残差模型健康探针与在线泄密探测沙箱。",
  "descriptionEn": "Local privacy defense dashboard: monitors real-time credential redaction and DFA stream restoration, featuring local Qwen2.5-0.5B health probes and an interactive leak-test sandbox.",
  "repo": "https://github.com/amwangfan/dsh-privacy-guard",
  "npm": "dsh-privacy-guard",
  "category": "security",
  "subcategory": "dlp"
}
```

---

## 📄 License

Apache License 2.0
