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
4. **🔓 豁免名单与页内横幅提醒**：
   - 面板实时列出「暂停过滤」的词：范围、理由、操作者、剩余有效期、命中次数。
   - 一旦 AI 新增/撤销豁免，页面顶部弹出**页内横幅**（非浏览器 `alert`），写明「哪个词 + 什么理由 + 谁放的 + 多久后失效」。

---

## 🔓 豁免（Allowlist）机制

**默认姿态：全量过滤。** 豁免是「对某一个词暂停脱敏」，不是全局开关，并且由网关在代码层强制约束：

| 约束 | 说明 |
|---|---|
| 必填理由 | `reason` 至少 8 字符；新增和撤销都必填，没有跳过参数 |
| 强制过期 | 每条豁免都带 `expires_at`（默认 24 小时，硬上限 7 天），到期后过滤自动恢复 |
| 作用范围 | `layer0`（正则层）/ `layer1`（0.5B 残差判定层）/ `all` |
| 审计留痕 | `add` / `revoke` / `expire` / `hit` 全部追加到 `exemptions.jsonl` |
| 精确匹配 | 按完整候选词做边界匹配，不会因为放行一个短词而放过包含它的真实密钥 |
| 仅本机 | 豁免接口只接受 loopback 请求，经 Tailscale/局域网访问一律 403 |

### 给 AI 的命令入口

```bash
/root/privacy-gateway/scripts/privacy-exempt.sh allow  --term "<要放行的词>" --reason "<为什么它不敏感>" [--scope all|layer0|layer1] [--ttl 3600]
/root/privacy-gateway/scripts/privacy-exempt.sh revoke --term "<词>" --reason "<为什么可以恢复过滤>"
/root/privacy-gateway/scripts/privacy-exempt.sh list
/root/privacy-gateway/scripts/privacy-exempt.sh audit
```

AI 在放行某个词之后，**必须在回复中向用户说明放行了什么、为什么**；插件会用页内横幅把这次变更同步显示出来。

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

或者本地源码链接安装（开发时推荐，改完 `npm run build` 重启 DSH 即生效）：

```bash
cd /path/to/dsh-privacy-guard
npm run build                     # 用 esbuild 产出 lib/index.js 与 lib/client.js
dsh plugin --profile web add link:$PWD
```

### 2. 启动或重启 DSH Web

```bash
systemctl restart deepseek-harness.service   # 会短暂断开当前页面，刷新即恢复
```

重启后打开浏览器控制台：
- 侧边栏底部点击 **设置 (Settings)**。
- 在左侧菜单中即可看到 **「隐私脱密 (Privacy Guard)」** 专属面板。
- 面板内在「豁免名单」卡片可看到当前放行状态；有豁免变更时页面顶部出现横幅提醒。

### 3. 自检

```bash
./scripts/verify.sh           # 探测 Host 半注册的 4 条路由
```

> 注意：DSH 对所有 `/api/*` 路由都要求登录态，未认证探测只能看到 401。判断插件是否真的加载，以设置面板是否出现、以及 `journalctl -u deepseek-harness.service | grep -i privacy` 为准。

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
