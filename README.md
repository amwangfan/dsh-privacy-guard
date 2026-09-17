# DSH 隐私保护 (Privacy Protection)

**简体中文** | [English](README.en.md)

DeepSeek Harness (DSH) 隐私保护插件 —— 本地凭据脱敏网关的状态监控、审计看板、豁免白名单、加密密钥管理、凭据保护模型入口与部署控制。

> 后续计划加入语义敏感信息过滤，因此命名为「隐私保护」而非「脱密」。

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
4. **🔑 加密密钥配置（可选）**：
   - 面板可选择用「自动生成的密钥文件」或「自定义口令」加密持久化数据；口令不回显、只提交一次。
   - 更换密钥时会先重新加密已有凭据并校验，成功后才切换；失败自动回滚，旧对话里的占位符仍可还原。
5. **🔓 豁免白名单与页内横幅提醒**：
   - 面板实时列出「暂停过滤」的词（范围/理由/操作者/有效期/命中次数），并可**逐行编辑**：一行一个词，删行即撤销、加行即放行。
   - 一旦新增/撤销豁免，页面顶部弹出**页内横幅**（非浏览器 `alert`），写明「哪个词 + 什么理由 + 谁放的」。
6. **🛡️ 凭据保护模型入口**：
   - 一键把现有 provider 复制成一条经网关的链路写进模型列表，原 provider 回到直连；在模型选择里选带「凭据保护」的条目即走网关。
   - **内置 DeepSeek（官方 API）**：内置 provider 是单例、不能复制，所以由代码读取它自己的配置，**自动新增**一条指向网关 `/deepseek` 前缀的 OpenAI 兼容 provider（沿用 `DEEPSEEK_API_KEY`），原文直连链路保留。
7. **🚀 部署控制**：
   - 面板内直接下载并部署网关 / 小模型、启动停止重启、查看日志，并可修改两者的地址与端口。

---

## 🛡️ 凭据保护模型（模型列表里的第二条链路）

面板的「凭据保护模型」卡片会**复制一份现有 provider**、把 `baseURL` 指向本地网关、写进
`~/.dsh/settings.yaml` 的模型列表；同时把**原 provider 改回直连**。于是模型列表里同时存在两条链路：

| 条目 | 走向 | 用途 |
|---|---|---|
| `自建聚合` | 直连后端 `:8316` | 不需要脱敏时（最快，无额外延迟） |
| `自建聚合(凭据保护)` | 经网关 `:8317` | 需要凭据脱敏时 |
| `DeepSeek 官方`（内置） | 直连 `api.deepseek.com` | 官方 API 直连 |
| `DeepSeek 官方(凭据保护)` | 经网关 `:8317/deepseek` | 官方 API + 凭据脱敏 |

**在模型选择里选带「凭据保护」的条目，就用上了网关。** 写入后无需重启：DSH 的
`dsh-settings-file` 用 chokidar 监视该文件，外部编辑会自动重载并发布（刷新页面即可看到）。

写法是整份 YAML 读入→只改 provider 块→写回，写前自动备份为 `settings.yaml.bak-plugin-*`；
未涉及的其他设置逐项校验后保持完全一致。

---

## 🔓 豁免（Allowlist）机制

**默认姿态：全量过滤。** 豁免是「对某一个词暂停脱敏」，不是全局开关，并且由网关在代码层强制约束：

| 约束 | 说明 |
|---|---|
| 理由 | AI 入口（CLI）强制要求非空理由；人工直接调网关接口可以不写 |
| 有效期 | 默认长期有效，直到被撤销；需要临时豁免时可显式传 `expires_at` |
| 可用代号 | `--term` 可传 vault 代号（如 `<SECRET_AWS_AKIA_1>`），网关自行解析，AI 不必接触明文 |
| 作用范围 | `layer0`（正则层）/ `layer1`（0.5B 残差判定层）/ `all` |
| 审计留痕 | `add` / `revoke` / `expire` / `hit` 全部追加到 `exemptions.jsonl` |
| 精确匹配 | 按完整候选词做边界匹配，不会因为放行一个短词而放过包含它的真实密钥 |
| 仅本机 | 豁免接口只接受 loopback 请求，经 Tailscale/局域网访问一律 403 |

### 给 AI 的命令入口

```bash
/root/privacy-gateway/scripts/privacy-exempt.sh allow  --term "<要放行的词或 vault 代号>" --reason "<为什么它不敏感>" [--scope all|layer0|layer1]
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
| **`qwen2.5-0.5b-privacy`** | 本地凭据残差判别（step-220 LoRA + F16/Q8 GGUF；网关探针只卡 FPR，弱口令交给 Layer 0） | [HuggingFace: amwangfan/privacy-gateway-v4-qwen2.5-0.5b](https://huggingface.co/amwangfan/privacy-gateway-v4-qwen2.5-0.5b) |

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
- 在左侧菜单中即可看到 **「隐私保护 (Privacy Protection)」** 专属面板。
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
  "name": "隐私保护",
  "nameEn": "Privacy Protection",
  "author": "amwangfan",
  "description": "DSH 隐私保护插件：本地网关凭据脱敏与流式还原，豁免白名单（一行一词、可编辑），加密密钥管理，凭据保护模型入口，以及网关/小模型的下载部署与链接配置。",
  "descriptionEn": "Privacy protection plugin for DSH: credential redaction and stream restoration through a local gateway, an editable exemption whitelist, encrypted key management, credential-protected model entries, and download/deploy plus link configuration for the gateway and local model.",
  "repo": "https://github.com/amwangfan/dsh-privacy-guard",
  "npm": "dsh-privacy-guard",
  "category": "security",
  "subcategory": "dlp"
}
```

---

## 📄 许可证

Apache License 2.0
