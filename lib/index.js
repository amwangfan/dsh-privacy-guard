// src/index.ts
var name = "dsh-privacy-guard";
var inject = ["webServer"];
var DEFAULT_GATEWAY_URL = "http://127.0.0.1:8317";
var DEFAULT_CLASSIFIER_URL = "http://127.0.0.1:8319";
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
      path: "/api/dsh-privacy-guard/exemptions",
      handler: async (_req, res) => {
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
  if (webServer?.addRoute) {
    for (const r of routes) {
      webServer.addRoute(r);
    }
  }
}
export {
  PrivacyGuardService,
  apply,
  inject,
  name
};
