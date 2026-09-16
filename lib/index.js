// src/index.ts
var name = "dsh-privacy-guard";
var inject = ["webServer"];
var DEFAULT_GATEWAY_URL = "http://127.0.0.1:8317";
var DEFAULT_CLASSIFIER_URL = "http://127.0.0.1:8319";
var PROMPT_SECTION_ORDER = 2250;
var PROMPT_TEXT = `# \u51FA\u7F51\u8131\u654F
\u672C\u673A\u51FA\u7F51\u8BF7\u6C42\u7ECF\u8131\u5BC6\u7F51\u5173\uFF1A\u51ED\u636E\u88AB\u66FF\u6362\u4E3A <SECRET_\u7C7B\u578B_\u5E8F\u53F7>\uFF0C\u56DE\u7A0B\u81EA\u52A8\u8FD8\u539F\u3002
- \u628A <SECRET_...> \u5F53\u4F5C\u5B83\u6240\u4EE3\u8868\u7684\u51ED\u636E\u672C\u8EAB\uFF1A\u9700\u8981\u65F6\u76F4\u63A5\u539F\u6837\u53D1\u51FA\uFF0C\u4E0D\u8981\u89E3\u91CA\u6216\u731C\u6D4B\u5185\u5BB9\uFF0C\u4E5F\u4E0D\u8981\u6539\u5199\u5360\u4F4D\u7B26\u3002
- \u9700\u8981\u8BA9\u67D0\u975E\u51ED\u636E\u8BCD\u539F\u6837\u51FA\u7F51\uFF1Aprivacy-exempt.sh allow --term "<\u8BCD\u6216\u4EE3\u53F7>" --reason "<\u7B80\u77ED\u7406\u7531>"\uFF1B\u7406\u7531\u5FC5\u586B\uFF0C\u5E76\u5728\u56DE\u590D\u4E2D\u8BF4\u660E\u653E\u884C\u4E86\u4EC0\u4E48\u3001\u4E3A\u4EC0\u4E48\u3002revoke \u6062\u590D\u8FC7\u6EE4\u3002
- \u62FF\u4E0D\u51C6\u662F\u5426\u662F\u51ED\u636E\u5C31\u4FDD\u6301\u8FC7\u6EE4\uFF0C\u4E0D\u8981\u4E3A\u4E86\u901A\u8FC7\u6821\u9A8C\u4E3B\u52A8\u5173\u8131\u654F\u3002`;
function writeJson(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(json),
    "cache-control": "no-store"
  });
  res.end(json);
}
async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}
var PrivacyGuardService = class {
  gatewayUrl;
  classifierUrl;
  constructor(config) {
    this.gatewayUrl = (config?.gatewayUrl || DEFAULT_GATEWAY_URL).replace(/\/+$/, "");
    this.classifierUrl = (config?.classifierUrl || DEFAULT_CLASSIFIER_URL).replace(/\/+$/, "");
  }
  async getHealth() {
    try {
      const resp = await fetch(`${this.gatewayUrl}/privacy/health`, { signal: AbortSignal.timeout(3e3) });
      if (!resp.ok) return null;
      return await resp.json();
    } catch {
      return null;
    }
  }
  async checkClassifier() {
    try {
      const resp = await fetch(`${this.classifierUrl}/health`, { signal: AbortSignal.timeout(2e3) });
      return resp.ok;
    } catch {
      return false;
    }
  }
  async getStatus() {
    const [health, classifierOnline] = await Promise.all([this.getHealth(), this.checkClassifier()]);
    return {
      gateway: {
        online: health !== null,
        url: this.gatewayUrl,
        stats: health ?? void 0,
        error: health === null ? "Cannot connect to Privacy Gateway on :8317" : void 0
      },
      classifier: {
        online: classifierOnline,
        url: this.classifierUrl,
        modelAlias: "qwen25-05b-privacy"
      }
    };
  }
  async dryRun(req) {
    let payload = req.json_payload;
    if (!payload && req.text) {
      payload = {
        input: [
          {
            type: "message",
            role: "user",
            content: [{ type: "input_text", text: req.text }]
          }
        ]
      };
    }
    if (!payload) {
      return { ok: false, error: "Empty test content" };
    }
    try {
      const resp = await fetch(`${this.gatewayUrl}/privacy/dry-run`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(1e4)
      });
      if (!resp.ok) {
        return { ok: false, error: `Gateway returned HTTP ${resp.status}` };
      }
      const data = await resp.json();
      return {
        ok: true,
        redacted: data.redacted,
        vault_active: data.vault_active,
        layer1_applied: data.layer1_applied,
        exempt_spans: data.exempt_spans,
        exempt_terms: data.exempt_terms
      };
    } catch (err) {
      return { ok: false, error: err?.message || "Failed to call /privacy/dry-run" };
    }
  }
  /**
   * Active exemption list. This runs in the Host, not the browser, so the page
   * never talks to the gateway directly (the control plane is loopback-only).
   */
  async getExemptions() {
    try {
      const resp = await fetch(`${this.gatewayUrl}/privacy/exemptions`, {
        signal: AbortSignal.timeout(4e3)
      });
      if (!resp.ok) return null;
      return await resp.json();
    } catch {
      return null;
    }
  }
  /** Vault key configuration. Never contains the passphrase itself. */
  async getKeyConfig() {
    try {
      const resp = await fetch(`${this.gatewayUrl}/privacy/key`, { signal: AbortSignal.timeout(4e3) });
      if (!resp.ok) return null;
      const data = await resp.json();
      return data?.config ?? null;
    } catch {
      return null;
    }
  }
  /** Switch the vault key source. The gateway re-encrypts before it restarts. */
  async setKeyConfig(body) {
    try {
      const resp = await fetch(`${this.gatewayUrl}/privacy/key`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(19e4)
      });
      return await resp.json();
    } catch (err) {
      return { ok: false, error: err?.message || "Failed to reach /privacy/key" };
    }
  }
  /** Add one exemption (used by the panel's whitelist editor). */
  async addExemption(term, scope, reason, actor) {
    try {
      const resp = await fetch(`${this.gatewayUrl}/privacy/exemptions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ term, scope: scope || "all", reason: reason || "", actor: actor || "human:panel" }),
        signal: AbortSignal.timeout(1e4)
      });
      return await resp.json();
    } catch (err) {
      return { ok: false, error: err?.message || "Failed to add the exemption" };
    }
  }
  /** Revoke one exemption. The gateway also accepts it as a query parameter. */
  async revokeExemption(term, reason, actor) {
    try {
      const resp = await fetch(`${this.gatewayUrl}/privacy/exemptions`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ term, reason: reason || "", actor: actor || "human:panel" }),
        signal: AbortSignal.timeout(1e4)
      });
      return await resp.json();
    } catch (err) {
      return { ok: false, error: err?.message || "Failed to revoke the exemption" };
    }
  }
  /** Append-only audit trail of allow / revoke / expire / hit decisions. */
  async getExemptionAudit(since = 0, limit = 40) {
    try {
      const url = `${this.gatewayUrl}/privacy/exemptions/audit?since=${encodeURIComponent(
        String(since)
      )}&limit=${encodeURIComponent(String(limit))}`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(4e3) });
      if (!resp.ok) return null;
      return await resp.json();
    } catch {
      return null;
    }
  }
};
function apply(ctx, config) {
  const service = new PrivacyGuardService(config);
  const routes = [
    {
      kind: "exact",
      path: "/api/dsh-privacy-guard/status",
      handler: async (_req, res) => {
        const status = await service.getStatus();
        writeJson(res, 200, status);
      }
    },
    {
      kind: "exact",
      path: "/api/dsh-privacy-guard/health",
      handler: async (_req, res) => {
        const health = await service.getHealth();
        if (!health) {
          writeJson(res, 503, { ok: false, error: "Privacy Gateway offline" });
          return;
        }
        writeJson(res, 200, health);
      }
    },
    {
      kind: "exact",
      path: "/api/dsh-privacy-guard/key",
      handler: async (req, res) => {
        if (req.method === "POST") {
          try {
            const raw = await readBody(req);
            const body = JSON.parse(raw);
            const result = await service.setKeyConfig(body);
            writeJson(res, result.ok ? 200 : 400, result);
          } catch (err) {
            writeJson(res, 400, { ok: false, error: err?.message || "Invalid JSON body" });
          }
          return;
        }
        const config2 = await service.getKeyConfig();
        if (!config2) {
          writeJson(res, 503, { ok: false, error: "Privacy Gateway offline" });
          return;
        }
        writeJson(res, 200, { ok: true, config: config2 });
      }
    },
    {
      kind: "exact",
      path: "/api/dsh-privacy-guard/exemptions",
      handler: async (req, res) => {
        if (req.method === "POST" || req.method === "DELETE") {
          try {
            const raw = await readBody(req);
            const body = JSON.parse(raw || "{}");
            if (!body.term) {
              writeJson(res, 400, { ok: false, error: "term is required" });
              return;
            }
            const result = req.method === "DELETE" ? await service.revokeExemption(body.term, body.reason, body.actor) : await service.addExemption(body.term, body.scope, body.reason, body.actor);
            writeJson(res, result.ok ? 200 : 400, result);
          } catch (err) {
            writeJson(res, 400, { ok: false, error: err?.message || "Invalid JSON body" });
          }
          return;
        }
        const list = await service.getExemptions();
        if (!list) {
          writeJson(res, 503, {
            ok: false,
            error: "Privacy Gateway offline or exemption API unavailable (restart the gateway after upgrading)",
            count: 0,
            entries: []
          });
          return;
        }
        writeJson(res, 200, list);
      }
    },
    {
      kind: "exact",
      path: "/api/dsh-privacy-guard/exemptions/audit",
      handler: async (req, res) => {
        const url = new URL(req.url || "/", "http://127.0.0.1");
        const since = Number(url.searchParams.get("since") || 0) || 0;
        const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") || 40) || 40));
        const audit = await service.getExemptionAudit(since, limit);
        if (!audit) {
          writeJson(res, 503, { ok: false, error: "Privacy Gateway offline", count: 0, records: [] });
          return;
        }
        writeJson(res, 200, audit);
      }
    },
    {
      kind: "exact",
      path: "/api/dsh-privacy-guard/dry-run",
      handler: async (req, res) => {
        if (req.method !== "POST") {
          writeJson(res, 405, { ok: false, error: "Method Not Allowed" });
          return;
        }
        try {
          const raw = await readBody(req);
          const body = JSON.parse(raw);
          const result = await service.dryRun(body);
          writeJson(res, result.ok ? 200 : 400, result);
        } catch (err) {
          writeJson(res, 400, { ok: false, error: err?.message || "Invalid JSON body" });
        }
      }
    }
  ];
  const webServer = ctx.webServer;
  if (typeof webServer?.register !== "function") {
    throw new Error(
      "dsh-privacy-guard: the webServer service has no register(route); cannot serve the panel API"
    );
  }
  const disposers = [];
  for (const r of routes) {
    const dispose = webServer.register(r);
    if (typeof dispose === "function") disposers.push(dispose);
  }
  if (typeof ctx.effect === "function") {
    ctx.effect(() => () => {
      for (const dispose of disposers) {
        try {
          dispose();
        } catch {
        }
      }
    });
  }
  registerPromptSection(ctx);
}
function registerPromptSection(ctx) {
  const systemPrompt = ctx.get ? ctx.get("systemPrompt") : void 0;
  if (!systemPrompt || typeof systemPrompt.section !== "function") return;
  const section = {
    name: "dsh-privacy-guard/redaction",
    order: PROMPT_SECTION_ORDER,
    text: PROMPT_TEXT
  };
  if (typeof ctx.effect === "function") {
    ctx.effect(() => systemPrompt.section(section));
  } else {
    systemPrompt.section(section);
  }
}
export {
  PrivacyGuardService,
  apply,
  inject,
  name
};
