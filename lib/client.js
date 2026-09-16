window.__ModuleLoader__.load({
	id: "dsh-privacy-guard",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.ts
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  name: () => name
});
module.exports = __toCommonJS(client_exports);
var import_react = __toESM(require("react"), 1);
var name = "dsh-privacy-guard-client";
var NS = "dsh-privacy-guard";
var PKG = "dsh-privacy-guard";
var POLL_MS = 4e3;
var DICT = {
  zh: {
    "section.label": "\u9690\u79C1\u8131\u5BC6",
    "panel.title": "\u9690\u79C1\u8131\u5BC6",
    "gateway.card": "\u8131\u5BC6\u7F51\u5173 :8317",
    "gateway.active": "\u6B63\u5728\u4FDD\u62A4",
    "gateway.offline": "\u672A\u8FDE\u63A5",
    "classifier.card": "\u6B8B\u5DEE\u6A21\u578B :8319",
    "classifier.online": "\u5728\u7EBF",
    "classifier.offline": "\u672A\u52A0\u8F7D",
    "vault.card": "\u52A0\u5BC6\u6301\u4E45\u5316",
    "vault.enabled": "\u5DF2\u542F\u7528",
    "vault.memory": "\u7EAF\u5185\u5B58",
    "metric.redacted": "\u7D2F\u8BA1\u8131\u654F",
    "metric.restored": "\u6D41\u5F0F\u8FD8\u539F",
    "metric.vault": "\u51ED\u636E\u603B\u5E93",
    "metric.hits": "\u6A21\u578B\u547D\u4E2D",
    "exempt.title": "\u8C41\u514D\u540D\u5355",
    "exempt.active": "{count} \u6761\u751F\u6548",
    "exempt.allFiltered": "\u5168\u90E8\u8FC7\u6EE4\u4E2D",
    "exempt.apiDown": "\u63A5\u53E3\u4E0D\u53EF\u7528",
    "exempt.scope": "\u8303\u56F4",
    "exempt.actor": "\u64CD\u4F5C\u8005",
    "exempt.hits": "\u547D\u4E2D",
    "exempt.reason": "\u7406\u7531",
    "exempt.noReason": "\u672A\u586B\u5199",
    "exempt.permanent": "\u957F\u671F\u6709\u6548",
    "exempt.until": "\u81F3 {time}",
    "exempt.empty": "\u6682\u65E0\u8C41\u514D\uFF0C\u6240\u6709\u6D41\u91CF\u90FD\u5728\u8FC7\u6EE4",
    "exempt.apiDownHint": "\u7F51\u5173\u672A\u8FD0\u884C\u542B\u8C41\u514D\u529F\u80FD\u7684\u7248\u672C",
    "exempt.bannerAdded": "\u5DF2\u653E\u884C\uFF1A{term}",
    "exempt.bannerRemoved": "\u5DF2\u6062\u590D\u8FC7\u6EE4\uFF1A{term}",
    "exempt.bannerReason": "\u7406\u7531",
    "exempt.bannerBy": "\u64CD\u4F5C\u8005",
    "exempt.bannerMore": "\u672C\u6B21\u5171 {count} \u6761\u53D8\u66F4",
    "exempt.bannerDismiss": "\u5173\u95ED",
    "sandbox.title": "\u6CC4\u5BC6\u63A2\u6D4B\u6C99\u7BB1",
    "sandbox.run": "\u6D4B\u8BD5",
    "sandbox.running": "\u6D4B\u8BD5\u4E2D\u2026",
    "sandbox.ok": "\u8131\u654F\u751F\u6548",
    "sandbox.fail": "\u8C03\u7528\u5931\u8D25",
    "sandbox.hitLayer1": "\u6A21\u578B\u5224\u5B9A\u547D\u4E2D",
    "sandbox.exempted": "{count} \u5904\u8C41\u514D\u672A\u8131\u654F",
    "error.noGateway": "\u65E0\u6CD5\u8FDE\u63A5\u9690\u79C1\u7F51\u5173"
  },
  en: {
    "section.label": "Privacy Guard",
    "panel.title": "Privacy Guard",
    "gateway.card": "Gateway :8317",
    "gateway.active": "Protecting",
    "gateway.offline": "Offline",
    "classifier.card": "Classifier :8319",
    "classifier.online": "Online",
    "classifier.offline": "Not loaded",
    "vault.card": "Encrypted store",
    "vault.enabled": "Enabled",
    "vault.memory": "Memory only",
    "metric.redacted": "Redacted",
    "metric.restored": "Restored",
    "metric.vault": "In vault",
    "metric.hits": "Model hits",
    "exempt.title": "Exemptions",
    "exempt.active": "{count} active",
    "exempt.allFiltered": "Everything filtered",
    "exempt.apiDown": "API unavailable",
    "exempt.scope": "Scope",
    "exempt.actor": "By",
    "exempt.hits": "Hits",
    "exempt.reason": "Reason",
    "exempt.noReason": "not given",
    "exempt.permanent": "no expiry",
    "exempt.until": "until {time}",
    "exempt.empty": "No exemptions \u2014 all traffic is filtered",
    "exempt.apiDownHint": "The gateway is not running a build that has exemptions",
    "exempt.bannerAdded": "Allowed through: {term}",
    "exempt.bannerRemoved": "Filtering restored: {term}",
    "exempt.bannerReason": "Reason",
    "exempt.bannerBy": "By",
    "exempt.bannerMore": "{count} changes in this batch",
    "exempt.bannerDismiss": "Dismiss",
    "sandbox.title": "Leak-test sandbox",
    "sandbox.run": "Test",
    "sandbox.running": "Testing\u2026",
    "sandbox.ok": "Redaction applied",
    "sandbox.fail": "Request failed",
    "sandbox.hitLayer1": "residual model flagged it",
    "sandbox.exempted": "{count} exempted spans left as-is",
    "error.noGateway": "Cannot reach the privacy gateway"
  }
};
function makeT(translate) {
  return (key, params) => {
    let text = key;
    try {
      const out = translate(key);
      if (typeof out === "string") text = out;
    } catch {
      text = key;
    }
    if (params) {
      for (const [k, v] of Object.entries(params)) text = text.split(`{${k}}`).join(String(v));
    }
    return text;
  };
}
function clock(epoch) {
  if (!epoch) return "-";
  const d = new Date(epoch * 1e3);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function useExemptions() {
  const [list, setList] = (0, import_react.useState)(null);
  const [fresh, setFresh] = (0, import_react.useState)([]);
  const [online, setOnline] = (0, import_react.useState)(true);
  const cursor = (0, import_react.useRef)(0);
  const primed = (0, import_react.useRef)(false);
  (0, import_react.useEffect)(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await fetch(`/api/${PKG}/exemptions`);
        if (!r.ok) throw new Error(String(r.status));
        const data = await r.json();
        if (!cancelled) {
          setList(data);
          setOnline(true);
        }
      } catch {
        if (!cancelled) setOnline(false);
      }
      try {
        const r = await fetch(`/api/${PKG}/exemptions/audit?since=${cursor.current}&limit=40`);
        if (!r.ok) return;
        const data = await r.json();
        const records = data?.records || [];
        if (records.length) {
          cursor.current = Math.max(...records.map((x) => x.ts || 0), cursor.current);
          if (primed.current && !cancelled) {
            const decisions = records.filter((x) => x.action === "add" || x.action === "revoke");
            if (decisions.length) setFresh(decisions);
          }
        }
        primed.current = true;
      } catch {
      }
    };
    tick();
    const timer = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);
  return { list, fresh, online, clear: () => setFresh([]) };
}
var card = {
  background: "var(--dsh-card-bg, rgba(255,255,255,0.03))",
  borderRadius: "10px",
  padding: "14px",
  border: "1px solid rgba(255,255,255,0.12)"
};
var dim = { fontSize: "12px", opacity: 0.7 };
function StatusCard(props) {
  return import_react.default.createElement(
    "div",
    { style: { ...card, borderColor: props.tone } },
    import_react.default.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" } },
      import_react.default.createElement("span", { style: { fontSize: "13px", fontWeight: 600 } }, props.title),
      import_react.default.createElement("span", { style: { fontSize: "11px", fontWeight: 600, color: props.tone } }, props.badge)
    ),
    import_react.default.createElement(
      "div",
      { style: { fontSize: "12px", opacity: 0.8, lineHeight: "1.7" } },
      props.rows.map((row, i) => import_react.default.createElement("div", { key: i }, row))
    )
  );
}
function ExemptionBanner(props) {
  const { t } = props;
  const { fresh, clear } = useExemptions();
  if (!fresh.length) return null;
  const primary = fresh[0];
  const isAdd = primary.action === "add";
  const accent = isAdd ? "#f59e0b" : "#22c55e";
  return import_react.default.createElement(
    "div",
    {
      role: "status",
      style: {
        position: "fixed",
        top: "12px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9e3,
        pointerEvents: "auto",
        width: "min(620px, calc(100vw - 32px))",
        background: "rgba(20,20,24,0.97)",
        border: `1px solid ${accent}`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: "10px",
        padding: "12px 14px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        color: "#f1f5f9",
        fontSize: "13px",
        lineHeight: "1.55",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }
    },
    import_react.default.createElement(
      "div",
      { style: { display: "flex", alignItems: "flex-start", gap: "10px" } },
      import_react.default.createElement("span", null, isAdd ? "\u26A0\uFE0F" : "\u2705"),
      import_react.default.createElement(
        "div",
        { style: { flex: 1, minWidth: 0 } },
        import_react.default.createElement(
          "div",
          { style: { fontWeight: 700, color: accent, marginBottom: "2px", wordBreak: "break-all" } },
          t(isAdd ? "exempt.bannerAdded" : "exempt.bannerRemoved", { term: primary.term })
        ),
        primary.reason ? import_react.default.createElement(
          "div",
          { style: { opacity: 0.9 } },
          `${t("exempt.bannerReason")}: ${primary.reason}`
        ) : null,
        import_react.default.createElement(
          "div",
          { style: { opacity: 0.6, fontSize: "12px" } },
          `${t("exempt.bannerBy")}: ${primary.actor || "-"}` + (fresh.length > 1 ? ` \xB7 ${t("exempt.bannerMore", { count: fresh.length })}` : "")
        )
      ),
      import_react.default.createElement(
        "button",
        {
          onClick: clear,
          title: t("exempt.bannerDismiss"),
          style: {
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: "15px",
            lineHeight: 1,
            padding: "2px 4px"
          }
        },
        "\u2715"
      )
    )
  );
}
function ExemptionCard(props) {
  const { t } = props;
  const { list, online } = useExemptions();
  const entries = list?.entries || [];
  const stats = list?.stats;
  const tone = !online ? "#9ca3af" : entries.length ? "#fbbf24" : "#4ade80";
  return import_react.default.createElement(
    "div",
    {
      style: {
        ...card,
        borderColor: entries.length ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.12)"
      }
    },
    import_react.default.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } },
      import_react.default.createElement("span", { style: { fontSize: "13px", fontWeight: 600 } }, t("exempt.title")),
      import_react.default.createElement(
        "span",
        { style: { fontSize: "11px", fontWeight: 600, color: tone } },
        !online ? t("exempt.apiDown") : entries.length ? t("exempt.active", { count: entries.length }) : t("exempt.allFiltered")
      )
    ),
    !online && import_react.default.createElement("div", { style: { ...dim, color: "#fbbf24" } }, t("exempt.apiDownHint")),
    online && !entries.length && import_react.default.createElement("div", { style: dim }, t("exempt.empty")),
    entries.map(
      (e, i) => import_react.default.createElement(
        "div",
        {
          key: i,
          style: {
            padding: "8px 10px",
            borderRadius: "8px",
            background: "rgba(0,0,0,0.18)",
            marginBottom: "6px"
          }
        },
        import_react.default.createElement(
          "div",
          { style: { display: "flex", justifyContent: "space-between", gap: "8px" } },
          import_react.default.createElement(
            "code",
            { style: { fontSize: "12px", wordBreak: "break-all", color: "#fde68a" } },
            e.term
          ),
          import_react.default.createElement(
            "span",
            { style: { fontSize: "11px", opacity: 0.75, whiteSpace: "nowrap" } },
            e.permanent ? t("exempt.permanent") : t("exempt.until", { time: clock(e.expires_at) })
          )
        ),
        import_react.default.createElement(
          "div",
          { style: { fontSize: "11px", opacity: 0.7, marginTop: "3px" } },
          `${t("exempt.reason")}: ${e.reason || t("exempt.noReason")}`
        ),
        import_react.default.createElement(
          "div",
          { style: { fontSize: "11px", opacity: 0.55, marginTop: "2px" } },
          `${t("exempt.scope")} ${e.scope} \xB7 ${t("exempt.actor")} ${e.actor} \xB7 ${t("exempt.hits")} ${e.hits}`
        )
      )
    ),
    entries.length ? import_react.default.createElement(
      "div",
      { style: { fontSize: "11px", opacity: 0.45, marginTop: "4px" } },
      `adds ${stats?.adds ?? 0} \xB7 revokes ${stats?.revokes ?? 0} \xB7 hits ${stats?.session_hits ?? 0}`
    ) : null
  );
}
function Panel(props) {
  const { t } = props;
  const [status, setStatus] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)(null);
  const [input, setInput] = (0, import_react.useState)(
    'api_key = "sk-proj-abcdefghijklmnopqrstuvwxyz123456"\ndb_url = "postgres://root:SuperSecret123@db.internal:5432/main"\nsafe_word = "office-N100"'
  );
  const [result, setResult] = (0, import_react.useState)(null);
  const [running, setRunning] = (0, import_react.useState)(false);
  const refresh = (0, import_react.useCallback)(async () => {
    try {
      const r = await fetch(`/api/${PKG}/status`);
      if (!r.ok) throw new Error(String(r.status));
      setStatus(await r.json());
      setError(null);
    } catch (e) {
      setError(e?.message || t("error.noGateway"));
    }
  }, [t]);
  (0, import_react.useEffect)(() => {
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);
  const run = async () => {
    if (!input.trim()) return;
    setRunning(true);
    try {
      const r = await fetch(`/api/${PKG}/dry-run`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: input })
      });
      setResult(await r.json());
    } catch (e) {
      setResult({ ok: false, error: e?.message || t("sandbox.fail") });
    } finally {
      setRunning(false);
    }
  };
  const gw = status?.gateway;
  const stats = gw?.stats;
  const persist = stats?.persist;
  return import_react.default.createElement(
    "div",
    {
      style: {
        padding: "20px",
        maxWidth: "960px",
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "var(--dsh-text, #e2e8f0)"
      }
    },
    import_react.default.createElement(
      "h2",
      { style: { margin: "0 0 16px", fontSize: "18px", fontWeight: 600 } },
      t("panel.title")
    ),
    import_react.default.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "12px",
          marginBottom: "16px"
        }
      },
      import_react.default.createElement(StatusCard, {
        title: t("gateway.card"),
        badge: gw?.online ? t("gateway.active") : t("gateway.offline"),
        tone: gw?.online ? "#4ade80" : "#f87171",
        rows: [String(gw?.url || ""), String(stats?.active_vault_mappings ?? 0)]
      }),
      import_react.default.createElement(StatusCard, {
        title: t("classifier.card"),
        badge: status?.classifier.online ? t("classifier.online") : t("classifier.offline"),
        tone: status?.classifier.online ? "#60a5fa" : "#9ca3af",
        rows: [String(status?.classifier.url || ""), String(status?.classifier.modelAlias || "")]
      }),
      import_react.default.createElement(StatusCard, {
        title: t("vault.card"),
        badge: persist?.enabled ? t("vault.enabled") : t("vault.memory"),
        tone: persist?.enabled ? "#c084fc" : "#9ca3af",
        rows: [String(persist?.vault_rows ?? 0), String(persist?.key_source === "password" ? "PBKDF2" : "key file")]
      })
    ),
    import_react.default.createElement(
      "div",
      { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "16px" } },
      [
        { label: t("metric.redacted"), value: stats?.total_redacted_secrets ?? 0, color: "#38bdf8" },
        { label: t("metric.restored"), value: stats?.total_restored_secrets ?? 0, color: "#34d399" },
        { label: t("metric.vault"), value: persist?.vault_rows ?? stats?.active_vault_mappings ?? 0, color: "#fbbf24" },
        { label: t("metric.hits"), value: stats?.layer1.hits ?? 0, color: "#a78bfa" }
      ].map(
        (m, i) => import_react.default.createElement(
          "div",
          { key: i, style: { ...card, padding: "10px", textAlign: "center" } },
          import_react.default.createElement("div", { style: { fontSize: "11px", opacity: 0.6 } }, m.label),
          import_react.default.createElement("div", { style: { fontSize: "20px", fontWeight: 700, color: m.color } }, m.value)
        )
      )
    ),
    import_react.default.createElement(ExemptionCard, { t }),
    import_react.default.createElement(
      "div",
      { style: { ...card, marginTop: "16px" } },
      import_react.default.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } },
        import_react.default.createElement("span", { style: { fontSize: "13px", fontWeight: 600 } }, t("sandbox.title")),
        import_react.default.createElement(
          "button",
          {
            onClick: run,
            disabled: running || !gw?.online,
            style: {
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              background: "var(--dsh-primary, #3b82f6)",
              color: "#fff",
              border: "none",
              cursor: running || !gw?.online ? "not-allowed" : "pointer",
              opacity: running || !gw?.online ? 0.6 : 1
            }
          },
          running ? t("sandbox.running") : t("sandbox.run")
        )
      ),
      import_react.default.createElement("textarea", {
        value: input,
        onChange: (e) => setInput(e.target.value),
        rows: 4,
        style: {
          width: "100%",
          boxSizing: "border-box",
          background: "rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "6px",
          color: "inherit",
          padding: "8px",
          fontSize: "12px",
          fontFamily: "monospace"
        }
      }),
      result && import_react.default.createElement(
        "div",
        { style: { marginTop: "10px", fontSize: "12px" } },
        import_react.default.createElement(
          "div",
          { style: { color: result.ok ? "#4ade80" : "#f87171", marginBottom: "6px" } },
          result.ok ? t("sandbox.ok") : t("sandbox.fail"),
          result.ok && result.layer1_applied ? ` \xB7 ${t("sandbox.hitLayer1")}` : "",
          result.ok && result.exempt_spans ? ` \xB7 ${t("sandbox.exempted", { count: result.exempt_spans })}` : ""
        ),
        import_react.default.createElement(
          "pre",
          {
            style: {
              margin: 0,
              padding: "8px",
              background: "rgba(0,0,0,0.3)",
              borderRadius: "4px",
              overflowX: "auto",
              fontSize: "11px",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap"
            }
          },
          result.ok ? typeof result.redacted === "object" ? JSON.stringify(result.redacted, null, 2) : String(result.redacted) : result.error
        )
      )
    ),
    error ? import_react.default.createElement("div", { style: { ...dim, marginTop: "10px", color: "#f87171" } }, error) : null
  );
}
function apply(ctx) {
  const slots = ctx.get ? ctx.get("slots") : ctx.slots;
  if (!slots) return;
  let translate = null;
  const locale = ctx.get ? ctx.get("locale") : void 0;
  if (locale?.register) {
    try {
      locale.register(NS, DICT);
    } catch {
    }
  }
  if (locale?.bind) {
    try {
      translate = locale.bind(NS);
    } catch {
      translate = null;
    }
  }
  const fallback = (key) => DICT.en[key] ?? key;
  const t = makeT((key) => translate ? translate(key) : fallback(key));
  slots.inject("settings.section", () => {
    try {
      return slots.register(
        {
          name: "settings.section",
          id: NS,
          order: 85,
          label: () => t("section.label")
        },
        () => import_react.default.createElement(Panel, { t })
      );
    } catch {
      return () => {
      };
    }
  });
  slots.inject("shell.overlay", () => {
    try {
      return slots.register(
        { name: "shell.overlay", id: "privacy-guard-exemption-banner", order: 60 },
        () => import_react.default.createElement(ExemptionBanner, { t })
      );
    } catch {
      return () => {
      };
    }
  });
}

		return module.exports;
	}
});
