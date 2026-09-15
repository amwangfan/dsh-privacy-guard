# DSH Privacy Guard

DeepSeek Harness (DSH) Web plugin for real-time local privacy gateway monitoring, audit metrics dashboard, and interactive credential leak test sandbox.

Designed to accompany [amwangfan/privacy-gateway](https://github.com/amwangfan/privacy-gateway).

[中文文档 (Chinese Readme)](README.zh.md)

---

## 🌟 Features

1. **🛡️ Gateway & Model Health Probes**:
   - Live status of the local reverse proxy (`:8317`) and Qwen2.5-0.5B residual classifier (`:8319`).
2. **📊 Audit Metrics Dashboard**:
   - Real-time counters for redacted credentials (`API_KEY`, private keys, database passwords, JWTs, etc.).
   - Outbound DFA stream restoration counters.
   - Active memory vault entries count.
   - 0.5B model classification hits and cache metrics.
3. **🧪 Interactive Leak-Test Sandbox (Dry-Run Tester)**:
   - Built directly into the DSH Settings panel.
   - Paste any configuration or text with credentials to instantly preview redacted placeholders before actual LLM calls (100% local, zero WAN egress).

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

Or install from local source:

```bash
dsh plugin --profile web add link:/path/to/dsh-privacy-guard
```

Open your DSH Web GUI -> **Settings** -> **Privacy Guard** to view the live dashboard.

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
