# DSH Privacy Guard

DeepSeek Harness (DSH) 隐私脱密守护插件 —— 为 DSH Web 控制台提供本地脱敏网关状态监控、实时审计指标看板与在线泄密探测沙箱。

配合 [amwangfan/privacy-gateway](https://github.com/amwangfan/privacy-gateway) 使用。

---

## 🌟 核心功能

1. **🛡️ 状态一览与健康探针**：
   - 实时探测本地脱密网关（`:8317`）与千问 Qwen2.5-0.5B 本地小模型服务（`:8319`）的健康状况与在线时长。
2. **📊 实时审计指标看板**：
   - 累计拦截脱密凭据数（`API_KEY`、私钥、数据库密码、JWT、Token 等）。
   - 出网流式还原数（DFA 还原计数）。
   - 内存 Vault 活跃凭据数。
   - 0.5B 本地小模型残差判定命中数与缓存命中情况。
3. **🧪 在线泄密探测沙箱 (Dry-Run Tester)**：
   - 在 DSH 设置页面内直接内置交互式测试沙箱。
   - 贴入任意包含 Token、私钥或配置文本，纯本地调用网关仿真接口，毫秒级可视化查看出网时的占位符化结果，验证规则生效情况（完全不出网，安全可控）。

---

## 📦 生态与架构关系

| 组件 | 角色与定位 | 开源仓库 |
|---|---|---|
| **`dsh-privacy-guard`** (本仓库) | DSH Web 客户端管理与监控插件 (Node.js / React / Cordis) | [GitHub: amwangfan/dsh-privacy-guard](https://github.com/amwangfan/dsh-privacy-guard) |
| **`privacy-gateway`** | 本地高性能出网脱敏网关核心 (Python / FastAPI / DFA) | [GitHub: amwangfan/privacy-gateway](https://github.com/amwangfan/privacy-gateway) |
| **`qwen2.5-0.5b-privacy`** | 专为本地凭据判别微调的轻量级小模型 (LoRA + GGUF) | [HuggingFace: amwangfan/privacy-gateway-v4-qwen2.5-0.5b](https://huggingface.co/amwangfan/privacy-gateway-v4-qwen2.5-0.5b) |

---

## 🚀 安装与使用

### 1. 安装插件到 DSH Profile

```bash
# 进入你的 DSH 环境
dsh plugin --profile web add dsh-privacy-guard
```

或者本地源码链接安装：

```bash
dsh plugin --profile web add link:/path/to/dsh-privacy-guard
```

### 2. 启动或重启 DSH Web

重启 DSH Web 实例后，打开浏览器控制台：
- 侧边栏底部点击 **设置 (Settings)**。
- 在左侧菜单中即可看到 **「隐私脱密 (Privacy Guard)」** 专属面板。

---

## 🏪 DSH 社区市场登记信息 (`community.json`)

若向 DSH 官方社区市场提交收录申请，直接使用如下元数据条目：

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

## 📄 许可证

Apache License 2.0
