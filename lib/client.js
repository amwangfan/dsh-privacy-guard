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
  PrivacyGuardView: () => PrivacyGuardView,
  apply: () => apply,
  name: () => name
});
module.exports = __toCommonJS(client_exports);
var import_react = __toESM(require("react"), 1);
var name = "dsh-privacy-guard-client";
var EXEMPTION_POLL_MS = 4e3;
function formatRemaining(seconds) {
  if (!seconds || seconds <= 0) return "\u5DF2\u8FC7\u671F";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} \u5206 ${seconds % 60} \u79D2`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} \u5C0F\u65F6 ${Math.floor(seconds % 3600 / 60)} \u5206`;
  return `${Math.floor(seconds / 86400)} \u5929 ${Math.floor(seconds % 86400 / 3600)} \u5C0F\u65F6`;
}
function formatClock(epoch) {
  if (!epoch) return "--";
  const d = new Date(epoch * 1e3);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function useExemptions() {
  const [list, setList] = (0, import_react.useState)(null);
  const [freshRecords, setFreshRecords] = (0, import_react.useState)([]);
  const [online, setOnline] = (0, import_react.useState)(true);
  const cursor = (0, import_react.useRef)(0);
  const primed = (0, import_react.useRef)(false);
  (0, import_react.useEffect)(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await fetch("/api/dsh-privacy-guard/exemptions");
        if (r.ok) {
          const data = await r.json();
          if (!cancelled) {
            setList(data);
            setOnline(true);
          }
        } else if (!cancelled) {
          setOnline(false);
        }
      } catch {
        if (!cancelled) setOnline(false);
      }
      try {
        const r = await fetch(
          `/api/dsh-privacy-guard/exemptions/audit?since=${cursor.current}&limit=40`
        );
        if (r.ok) {
          const data = await r.json();
          const records = data?.records || [];
          if (records.length) {
            cursor.current = Math.max(...records.map((rec) => rec.ts || 0), cursor.current);
            if (primed.current && !cancelled) {
              const decisions = records.filter((rec) => rec.action === "add" || rec.action === "revoke");
              if (decisions.length) setFreshRecords(decisions);
            }
          }
          primed.current = true;
        }
      } catch {
      }
    };
    tick();
    const timer = setInterval(tick, EXEMPTION_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);
  return { list, freshRecords, online, dismissFresh: () => setFreshRecords([]) };
}
function ExemptionBanner() {
  const { freshRecords, dismissFresh } = useExemptions();
  if (!freshRecords.length) return null;
  const primary = freshRecords[0];
  const isAdd = primary.action === "add";
  const accent = isAdd ? "#f59e0b" : "#22c55e";
  const title = isAdd ? `\u8FC7\u6EE4\u5DF2\u6682\u505C\uFF1A${primary.term}` : `\u8FC7\u6EE4\u5DF2\u6062\u590D\uFF1A${primary.term}`;
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
        width: "min(720px, calc(100vw - 32px))",
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
      import_react.default.createElement("span", { style: { fontSize: "16px", lineHeight: "1.2" } }, isAdd ? "\u26A0\uFE0F" : "\u2705"),
      import_react.default.createElement(
        "div",
        { style: { flex: 1, minWidth: 0 } },
        import_react.default.createElement(
          "div",
          { style: { fontWeight: 700, color: accent, marginBottom: "4px" } },
          title
        ),
        import_react.default.createElement(
          "div",
          { style: { opacity: 0.9 } },
          import_react.default.createElement("span", { style: { opacity: 0.7 } }, "\u539F\u56E0\uFF1A"),
          primary.reason || "(\u672A\u8BB0\u5F55)"
        ),
        import_react.default.createElement(
          "div",
          { style: { opacity: 0.65, fontSize: "12px", marginTop: "2px" } },
          `\u64CD\u4F5C\u8005\uFF1A${primary.actor || "unknown"}` + (freshRecords.length > 1 ? ` \xB7 \u672C\u6B21\u5171 ${freshRecords.length} \u6761\u8C41\u514D\u53D8\u66F4` : "")
        ),
        isAdd && import_react.default.createElement(
          "div",
          { style: { opacity: 0.6, fontSize: "11px", marginTop: "4px" } },
          "\u8BE5\u8BCD\u5728\u6709\u6548\u671F\u7ED3\u675F\u540E\u81EA\u52A8\u6062\u590D\u8FC7\u6EE4\uFF1B\u5176\u4F59\u654F\u611F\u4FE1\u606F\u4ECD\u5728\u8131\u654F\u3002"
        )
      ),
      import_react.default.createElement(
        "button",
        {
          onClick: dismissFresh,
          title: "\u5173\u95ED\u63D0\u9192",
          style: {
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: "16px",
            lineHeight: 1,
            padding: "2px 4px"
          }
        },
        "\u2715"
      )
    )
  );
}
function ExemptionCard() {
  const { list, online } = useExemptions();
  const stats = list?.stats;
  const entries = list?.entries || [];
  return import_react.default.createElement(
    "div",
    {
      style: {
        background: entries.length ? "rgba(245,158,11,0.06)" : "var(--dsh-card-bg, rgba(255,255,255,0.02))",
        borderRadius: "10px",
        border: `1px solid ${entries.length ? "rgba(245,158,11,0.35)" : "var(--dsh-border, rgba(255,255,255,0.08))"}`,
        padding: "16px",
        marginBottom: "24px"
      }
    },
    import_react.default.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" } },
      import_react.default.createElement("span", { style: { fontSize: "14px", fontWeight: 600 } }, "\u{1F513} \u8C41\u514D\u540D\u5355\uFF08\u6682\u505C\u8FC7\u6EE4\u7684\u8BCD\uFF09"),
      import_react.default.createElement(
        "span",
        {
          style: {
            fontSize: "11px",
            padding: "2px 8px",
            borderRadius: "12px",
            fontWeight: 600,
            background: !online ? "rgba(156,163,175,0.2)" : entries.length ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.2)",
            color: !online ? "#9ca3af" : entries.length ? "#fbbf24" : "#4ade80"
          }
        },
        !online ? "\u25CB \u7F51\u5173\u8C41\u514D\u63A5\u53E3\u4E0D\u53EF\u7528" : entries.length ? `\u25CF ${entries.length} \u6761\u751F\u6548\u4E2D` : "\u25CF \u5168\u91CF\u8FC7\u6EE4\u4E2D"
      )
    ),
    import_react.default.createElement(
      "div",
      { style: { fontSize: "12px", opacity: 0.75, lineHeight: "1.6", marginBottom: entries.length ? "12px" : 0 } },
      "\u9ED8\u8BA4\u5BF9\u5168\u90E8\u6D41\u91CF\u8FC7\u6EE4\uFF1B\u88AB\u8C41\u514D\u7684\u8BCD\u53EA\u5728\u6709\u6548\u671F\u5185\u8DF3\u8FC7\u8131\u654F\uFF0C\u5230\u671F\u81EA\u52A8\u6062\u590D\u3002\u6BCF\u6761\u8C41\u514D\u90FD\u5FC5\u987B\u5199\u660E\u7406\u7531\uFF0C\u4E14\u90FD\u4F1A\u5199\u5165\u5BA1\u8BA1\u65E5\u5FD7\u3002"
    ),
    !online && import_react.default.createElement(
      "div",
      { style: { fontSize: "12px", color: "#fbbf24", lineHeight: "1.6" } },
      "\u65E0\u6CD5\u8BFB\u53D6\u7F51\u5173\u8C41\u514D\u5217\u8868\uFF1A\u786E\u8BA4 privacy-gateway \u5DF2\u52A0\u8F7D\u542B\u8C41\u514D\u529F\u80FD\u7684\u65B0\u7248\u672C\uFF08systemctl restart privacy-gateway\uFF09\u3002"
    ),
    entries.map(
      (entry, idx) => import_react.default.createElement(
        "div",
        {
          key: idx,
          style: {
            padding: "10px 12px",
            borderRadius: "8px",
            background: "rgba(0,0,0,0.18)",
            border: "1px solid rgba(245,158,11,0.18)",
            marginBottom: "8px"
          }
        },
        import_react.default.createElement(
          "div",
          { style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "baseline" } },
          import_react.default.createElement(
            "code",
            { style: { fontSize: "12px", wordBreak: "break-all", color: "#fde68a" } },
            entry.term
          ),
          import_react.default.createElement(
            "span",
            { style: { fontSize: "11px", opacity: 0.8, whiteSpace: "nowrap" } },
            `\u5269\u4F59 ${formatRemaining(entry.remaining_seconds)}`
          )
        ),
        import_react.default.createElement(
          "div",
          { style: { fontSize: "12px", opacity: 0.85, marginTop: "4px" } },
          import_react.default.createElement("span", { style: { opacity: 0.65 } }, "\u7406\u7531\uFF1A"),
          entry.reason
        ),
        import_react.default.createElement(
          "div",
          { style: { fontSize: "11px", opacity: 0.6, marginTop: "3px" } },
          `\u8303\u56F4 ${entry.scope} \xB7 \u64CD\u4F5C\u8005 ${entry.actor} \xB7 \u547D\u4E2D ${entry.hits} \u6B21 \xB7 \u5230\u671F ${formatClock(entry.expires_at)}`
        )
      )
    ),
    stats && import_react.default.createElement(
      "div",
      { style: { fontSize: "11px", opacity: 0.55, marginTop: "4px" } },
      `\u672C\u6B21\u8FDB\u7A0B\u7D2F\u8BA1\uFF1A\u65B0\u589E ${stats.adds} \xB7 \u64A4\u9500 ${stats.revokes} \xB7 \u547D\u4E2D ${stats.session_hits} \xB7 \u9ED8\u8BA4\u6709\u6548\u671F ${formatRemaining(stats.default_ttl_seconds)} \xB7 \u4E0A\u9650 ${formatRemaining(stats.max_ttl_seconds)}`
    )
  );
}
function ExemptionCliHint() {
  const command = "/root/privacy-gateway/scripts/privacy-exempt.sh";
  const lines = [
    `allow  --term "<\u8981\u653E\u884C\u7684\u8BCD>" --reason "<\u4E3A\u4EC0\u4E48\u5B83\u4E0D\u654F\u611F>" [--scope all|layer0|layer1] [--ttl 3600]`,
    `revoke --term "<\u8BCD>" --reason "<\u4E3A\u4EC0\u4E48\u53EF\u4EE5\u6062\u590D\u8FC7\u6EE4>"`,
    "list / audit / health"
  ];
  return import_react.default.createElement(
    "div",
    {
      style: {
        background: "var(--dsh-card-bg, rgba(255,255,255,0.02))",
        borderRadius: "10px",
        border: "1px solid var(--dsh-border, rgba(255,255,255,0.08))",
        padding: "16px",
        marginBottom: "24px",
        fontSize: "12px",
        lineHeight: "1.7"
      }
    },
    import_react.default.createElement(
      "div",
      { style: { fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "#60a5fa" } },
      "\u{1F916} AI \u5982\u4F55\u7533\u8BF7\u8C41\u514D\uFF08\u9ED8\u8BA4\u5168\u5F00\u8FC7\u6EE4\uFF0C\u8C41\u514D\u9700\u7406\u7531\u4E14\u4F1A\u81EA\u52A8\u8FC7\u671F\uFF09"
    ),
    import_react.default.createElement(
      "div",
      { style: { opacity: 0.85 } },
      import_react.default.createElement("div", null, "\u5F53\u67D0\u4E2A\u8BCD\u5FC5\u987B\u539F\u6837\u51FA\u73B0\u5728\u5916\u53D1\u5185\u5BB9\u91CC\uFF08\u4F8B\u5982\u8981\u8D34\u5230\u516C\u5F00\u5DE5\u5355\u4E0A\u7684\u94FE\u63A5\u7247\u6BB5\uFF09\uFF0CAI \u7528\u4E0B\u9762\u8FD9\u6761\u547D\u4EE4\u7533\u8BF7\u653E\u884C\uFF0C\u5E76\u5FC5\u987B\u5728\u56DE\u590D\u4E2D\u8BF4\u660E\u7406\u7531\uFF1A"),
      import_react.default.createElement(
        "pre",
        {
          style: {
            margin: "8px 0",
            padding: "10px",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "6px",
            overflowX: "auto",
            fontSize: "11px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap"
          }
        },
        `${command} ${lines[0]}
${command} ${lines[1]}
${command} ${lines[2]}`
      ),
      import_react.default.createElement("div", null, "\u7F3A --reason\u3001\u7406\u7531\u8FC7\u77ED\u3001\u6216\u6709\u6548\u671F\u8D85\u8FC7 7 \u5929\u90FD\u4F1A\u88AB\u7F51\u5173\u76F4\u63A5\u62D2\u7EDD\uFF1B\u8C41\u514D\u5230\u671F\u540E\u8FC7\u6EE4\u81EA\u52A8\u6062\u590D\u3002")
    )
  );
}
function PrivacyGuardView() {
  const [status, setStatus] = (0, import_react.useState)(null);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)(null);
  const [inputVal, setInputVal] = (0, import_react.useState)(
    '# \u6D4B\u8BD5\u654F\u611F\u51ED\u636E\u8131\u5BC6\uFF08\u652F\u6301\u6B63\u5219\u3001\u5343\u95EE0.5B\u6A21\u578B\u5224\u5B9A\u3001\u4EE5\u53CA\u81EA\u5B9A\u4E49\u5BC6\u7801\u5BC6\u94A5\uFF09\uFF1A\napi_key = "sk-proj-abcdefghijklmnopqrstuvwxyz123456"\ndb_url = "postgres://root:SuperSecret123@db.internal:5432/main"\npassword = "my_private_db_password_2026"\ncustom_token = "Zx7Qm2Vt9Lp4Kd8Wn3Rf"\nsafe_word = "hello world office-N100"'
  );
  const [dryRunRes, setDryRunRes] = (0, import_react.useState)(null);
  const [dryRunLoading, setDryRunLoading] = (0, import_react.useState)(false);
  const fetchStatus = (0, import_react.useCallback)(async () => {
    try {
      const r = await fetch("/api/dsh-privacy-guard/status");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setStatus(data);
      setError(null);
    } catch (e) {
      setError(e.message || "\u65E0\u6CD5\u8FDE\u63A5\u5230\u9690\u79C1\u7F51\u5173");
    } finally {
      setLoading(false);
    }
  }, []);
  (0, import_react.useEffect)(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 4e3);
    return () => clearInterval(timer);
  }, [fetchStatus]);
  const handleDryRun = async () => {
    if (!inputVal.trim()) return;
    setDryRunLoading(true);
    try {
      const r = await fetch("/api/dsh-privacy-guard/dry-run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: inputVal })
      });
      const data = await r.json();
      setDryRunRes(data);
    } catch (e) {
      setDryRunRes({ ok: false, error: e?.message || "\u6D4B\u8BD5\u8C03\u7528\u5931\u8D25" });
    } finally {
      setDryRunLoading(false);
    }
  };
  const gwOnline = status?.gateway.online ?? false;
  const cfOnline = status?.classifier.online ?? false;
  const stats = status?.gateway.stats;
  const persist = stats?.persist;
  return import_react.default.createElement(
    "div",
    {
      style: {
        padding: "24px",
        maxWidth: "1000px",
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "var(--dsh-text, #e2e8f0)"
      }
    },
    // Header
    import_react.default.createElement(
      "div",
      { style: { marginBottom: "24px", borderBottom: "1px solid var(--dsh-border, rgba(255,255,255,0.1))", paddingBottom: "16px" } },
      import_react.default.createElement("h2", { style: { margin: "0 0 8px 0", fontSize: "20px", fontWeight: 600 } }, "\u{1F6E1}\uFE0F DSH \u9690\u79C1\u8131\u5BC6\u7F51\u5173 (Privacy Guard)"),
      import_react.default.createElement(
        "p",
        { style: { margin: 0, fontSize: "13px", opacity: 0.75, lineHeight: "1.5" } },
        "\u5B9E\u65F6\u76D1\u63A7\u672C\u5730 Privacy Gateway (:8317)\u3001Qwen2.5-0.5B \u672C\u5730\u5C0F\u6A21\u578B (:8319) \u53CA AES-GCM \u672C\u5730\u52A0\u5BC6\u6301\u4E45\u5316\u5B58\u50A8\u72B6\u6001\u3002\u654F\u611F\u51ED\u636E\u5728\u79BB\u5F00\u5185\u7F51\u524D\u5F3A\u5236\u8131\u654F\uFF0C\u6D41\u5F0F\u56DE\u663E\u65E0\u611F\u8FD8\u539F\u3002"
      )
    ),
    // Status Badges Row (3 cards: Gateway, Classifier, Persistent Storage)
    import_react.default.createElement(
      "div",
      { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" } },
      // 1. Gateway Card
      import_react.default.createElement(
        "div",
        {
          style: {
            background: "var(--dsh-card-bg, rgba(255,255,255,0.03))",
            borderRadius: "10px",
            border: `1px solid ${gwOnline ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            padding: "16px"
          }
        },
        import_react.default.createElement(
          "div",
          { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } },
          import_react.default.createElement("span", { style: { fontSize: "14px", fontWeight: 600 } }, "\u7F51\u7EDC\u8131\u5BC6\u7F51\u5173 (:8317)"),
          import_react.default.createElement(
            "span",
            {
              style: {
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "12px",
                background: gwOnline ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                color: gwOnline ? "#4ade80" : "#f87171",
                fontWeight: 600
              }
            },
            gwOnline ? "\u25CF \u6B63\u5728\u4FDD\u62A4 (Active)" : "\u25CB \u672A\u8FDE\u63A5 (Offline)"
          )
        ),
        import_react.default.createElement(
          "div",
          { style: { fontSize: "12px", opacity: 0.8, lineHeight: "1.8" } },
          import_react.default.createElement("div", null, `\u76D1\u542C\u5730\u5740: ${status?.gateway.url || "http://127.0.0.1:8317"}`),
          import_react.default.createElement("div", null, `\u5728\u7EBF\u65F6\u957F: ${stats ? `${Math.floor(stats.uptime_seconds / 60)} \u5206\u949F` : "--"}`),
          import_react.default.createElement("div", null, `\u5360\u4F4D\u7B26\u89C4\u8303: ${stats?.placeholder_prefix || "<SECRET_"}*`)
        )
      ),
      // 2. Classifier Card
      import_react.default.createElement(
        "div",
        {
          style: {
            background: "var(--dsh-card-bg, rgba(255,255,255,0.03))",
            borderRadius: "10px",
            border: `1px solid ${cfOnline ? "rgba(59,130,246,0.3)" : "rgba(156,163,175,0.3)"}`,
            padding: "16px"
          }
        },
        import_react.default.createElement(
          "div",
          { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } },
          import_react.default.createElement("span", { style: { fontSize: "14px", fontWeight: 600 } }, "\u5343\u95EE 0.5B \u6B8B\u5DEE\u6A21\u578B (:8319)"),
          import_react.default.createElement(
            "span",
            {
              style: {
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "12px",
                background: cfOnline ? "rgba(59,130,246,0.2)" : "rgba(156,163,175,0.2)",
                color: cfOnline ? "#60a5fa" : "#9ca3af",
                fontWeight: 600
              }
            },
            cfOnline ? "\u25CF \u5728\u7EBF (Qwen2.5-0.5B)" : "\u25CB \u672A\u52A0\u8F7D (Offline)"
          )
        ),
        import_react.default.createElement(
          "div",
          { style: { fontSize: "12px", opacity: 0.8, lineHeight: "1.8" } },
          import_react.default.createElement("div", null, `\u63A8\u7406\u7AEF\u70B9: ${status?.classifier.url || "http://127.0.0.1:8319"}`),
          import_react.default.createElement("div", null, `\u5E76\u53D1\u6A21\u5F0F: 2 \u69FD\u4F4D\u5E76\u884C (Parallel)`),
          import_react.default.createElement("div", null, `Layer 1 \u7F13\u5B58: ${stats?.layer1.cache_size ?? "--"} \u6761`)
        )
      ),
      // 3. Persistent Vault Card
      import_react.default.createElement(
        "div",
        {
          style: {
            background: "var(--dsh-card-bg, rgba(255,255,255,0.03))",
            borderRadius: "10px",
            border: `1px solid ${persist?.enabled ? "rgba(168,85,247,0.3)" : "rgba(156,163,175,0.3)"}`,
            padding: "16px"
          }
        },
        import_react.default.createElement(
          "div",
          { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } },
          import_react.default.createElement("span", { style: { fontSize: "14px", fontWeight: 600 } }, "\u672C\u5730\u52A0\u5BC6\u6301\u4E45\u5316 (SQLite)"),
          import_react.default.createElement(
            "span",
            {
              style: {
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "12px",
                background: persist?.enabled ? "rgba(168,85,247,0.2)" : "rgba(156,163,175,0.2)",
                color: persist?.enabled ? "#c084fc" : "#9ca3af",
                fontWeight: 600
              }
            },
            persist?.enabled ? "\u25CF \u5DF2\u542F\u7528 (AES-GCM)" : "\u25CB \u7EAF\u5185\u5B58 (Memory)"
          )
        ),
        import_react.default.createElement(
          "div",
          { style: { fontSize: "12px", opacity: 0.8, lineHeight: "1.8" } },
          import_react.default.createElement("div", null, `\u843D\u76D8\u51ED\u636E: ${persist?.vault_rows ?? "--"} \u6761`),
          import_react.default.createElement("div", null, `\u6A21\u578B\u7F13\u5B58: ${persist?.layer1_rows ?? "--"} \u6761`),
          import_react.default.createElement("div", null, `\u5BC6\u94A5\u6765\u6E90: ${persist?.key_source === "password" ? "\u{1F511} \u7528\u6237\u81EA\u5B9A\u4E49\u5BC6\u7801 (PBKDF2)" : "\u{1F4C4} \u7CFB\u7EDF\u4E3B\u5BC6\u94A5\u6587\u4EF6"}`)
        )
      )
    ),
    // Metrics Counters
    import_react.default.createElement(
      "div",
      { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" } },
      [
        { label: "\u7D2F\u8BA1\u62E6\u622A\u8131\u654F", value: stats?.total_redacted_secrets ?? 0, color: "#38bdf8" },
        { label: "\u51FA\u7F51\u6D41\u5F0F\u8FD8\u539F", value: stats?.total_restored_secrets ?? 0, color: "#34d399" },
        { label: "Vault \u51ED\u636E\u603B\u5E93", value: persist?.vault_rows ?? (stats?.active_vault_mappings ?? 0), color: "#fbbf24" },
        { label: "0.5B \u6A21\u578B\u5206\u7C7B\u547D\u4E2D", value: stats?.layer1.hits ?? 0, color: "#a78bfa" }
      ].map(
        (item, idx) => import_react.default.createElement(
          "div",
          {
            key: idx,
            style: {
              background: "var(--dsh-card-bg, rgba(255,255,255,0.02))",
              borderRadius: "8px",
              border: "1px solid var(--dsh-border, rgba(255,255,255,0.06))",
              padding: "12px 14px",
              textAlign: "center"
            }
          },
          import_react.default.createElement("div", { style: { fontSize: "11px", opacity: 0.7, marginBottom: "6px" } }, item.label),
          import_react.default.createElement("div", { style: { fontSize: "22px", fontWeight: 700, color: item.color } }, item.value)
        )
      )
    ),
    // Active exemption list (redaction paused for these exact terms)
    import_react.default.createElement(ExemptionCard),
    // How an AI asks for an exemption
    import_react.default.createElement(ExemptionCliHint),
    // User Configuration & Custom Secrets Guide
    import_react.default.createElement(
      "div",
      {
        style: {
          background: "var(--dsh-card-bg, rgba(255,255,255,0.02))",
          borderRadius: "10px",
          border: "1px solid var(--dsh-border, rgba(255,255,255,0.08))",
          padding: "16px",
          marginBottom: "24px",
          fontSize: "12px",
          lineHeight: "1.7"
        }
      },
      import_react.default.createElement("div", { style: { fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "#60a5fa" } }, "\u2699\uFE0F \u7528\u6237\u81EA\u5B9A\u4E49\u5BC6\u7801\u5BC6\u94A5\u4E0E\u89C4\u5219\u914D\u7F6E\u6307\u5F15"),
      import_react.default.createElement(
        "div",
        { style: { opacity: 0.85 } },
        import_react.default.createElement("div", null, "\u2022 ", import_react.default.createElement("b", null, "\u81EA\u5B9A\u4E49\u5B58\u50A8\u4E3B\u5BC6\u7801 (Vault Password): "), "\u53EF\u901A\u8FC7\u73AF\u5883\u53D8\u91CF ", import_react.default.createElement("code", null, 'VAULT_PASSWORD="\u4F60\u7684\u5F3A\u53E3\u4EE4"'), " \u81EA\u5B9A\u4E49\u6301\u4E45\u5316\u6570\u636E\u5E93\u7684 AES-256 \u52A0\u5BC6\u5BC6\u94A5\uFF08\u91C7\u7528 PBKDF2-HMAC-SHA256 \u6D3E\u751F\uFF09\uFF0C\u4E0D\u518D\u53D7\u9650\u4E8E\u5355\u673A\u968F\u673A\u6587\u4EF6\u3002"),
        import_react.default.createElement("div", null, "\u2022 ", import_react.default.createElement("b", null, "\u81EA\u5B9A\u4E49\u654F\u611F\u51ED\u636E\u8BCD\u8868 (Custom Secrets): "), "\u53EF\u901A\u8FC7\u73AF\u5883\u53D8\u91CF ", import_react.default.createElement("code", null, 'CUSTOM_SECRETS="token1,password2"'), " \u6216\u5C06\u654F\u611F\u8BCD\u5199\u5165 ", import_react.default.createElement("code", null, "/etc/privacy-gateway/custom_secrets.txt"), "\u3002\u5217\u8868\u5185\u7684\u654F\u611F\u8BCD\u5C06\u4F5C\u4E3A Layer 0 \u6700\u9AD8\u4F18\u5148\u7EA7\u5F3A\u5236\u8131\u5BC6\uFF0C\u96F6\u63A8\u7406\u5EF6\u8FDF\u3002")
      )
    ),
    // Interactive Dry-run Sandbox
    import_react.default.createElement(
      "div",
      {
        style: {
          background: "var(--dsh-card-bg, rgba(255,255,255,0.02))",
          borderRadius: "10px",
          border: "1px solid var(--dsh-border, rgba(255,255,255,0.08))",
          padding: "18px",
          marginBottom: "24px"
        }
      },
      import_react.default.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" } },
        import_react.default.createElement("span", { style: { fontSize: "14px", fontWeight: 600 } }, "\u{1F9EA} \u5728\u7EBF\u6CC4\u5BC6\u63A2\u6D4B\u6C99\u7BB1 (Dry-Run Tester)"),
        import_react.default.createElement(
          "button",
          {
            onClick: handleDryRun,
            disabled: dryRunLoading || !gwOnline,
            style: {
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              background: "var(--dsh-primary, #3b82f6)",
              color: "#fff",
              border: "none",
              cursor: dryRunLoading || !gwOnline ? "not-allowed" : "pointer",
              opacity: dryRunLoading || !gwOnline ? 0.6 : 1
            }
          },
          dryRunLoading ? "\u63A2\u6D4B\u4E2D..." : "\u25B6 \u6267\u884C\u8131\u5BC6\u6D4B\u8BD5 (Dry Run)"
        )
      ),
      import_react.default.createElement(
        "div",
        { style: { fontSize: "12px", opacity: 0.7, marginBottom: "10px" } },
        "\u5728\u4E0B\u65B9\u8D34\u5165\u4EFB\u610F\u5305\u542B\u53E3\u4EE4\u3001Token\u3001\u79C1\u94A5\u6216\u914D\u7F6E\u6587\u672C\uFF0C\u6D4B\u8BD5\u7F51\u5173\u4E24\u5C42\u89C4\u5219\uFF08Layer 0 \u6B63\u5219 + Layer 1 0.5B \u5224\u5B9A + \u7528\u6237\u81EA\u5B9A\u4E49\u5BC6\u94A5\uFF09\u7684\u8131\u654F\u66FF\u6362\u6548\u679C\uFF08\u7EAF\u672C\u5730\u4EFF\u771F\uFF0C\u4E0D\u51FA\u7F51\uFF09\uFF1A"
      ),
      import_react.default.createElement("textarea", {
        value: inputVal,
        onChange: (e) => setInputVal(e.target.value),
        rows: 4,
        style: {
          width: "100%",
          boxSizing: "border-box",
          background: "rgba(0,0,0,0.25)",
          border: "1px solid var(--dsh-border, rgba(255,255,255,0.1))",
          borderRadius: "6px",
          color: "var(--dsh-text, #f1f5f9)",
          padding: "10px",
          fontSize: "12px",
          fontFamily: "monospace",
          marginBottom: "12px"
        }
      }),
      dryRunRes && import_react.default.createElement(
        "div",
        {
          style: {
            padding: "12px",
            borderRadius: "6px",
            background: dryRunRes.ok ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${dryRunRes.ok ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
            fontSize: "12px"
          }
        },
        import_react.default.createElement(
          "div",
          { style: { display: "flex", justifyContent: "space-between", marginBottom: "8px", fontWeight: 600 } },
          import_react.default.createElement("span", { style: { color: dryRunRes.ok ? "#4ade80" : "#f87171" } }, dryRunRes.ok ? "\u2713 \u8131\u5BC6\u6210\u529F (\u51FA\u7F51\u6587\u672C\u5DF2\u5360\u4F4D\u7B26\u5316)" : "\u2717 \u6D4B\u8BD5\u5931\u8D25"),
          dryRunRes.layer1_applied && import_react.default.createElement("span", { style: { fontSize: "11px", color: "#93c5fd" } }, "\u2605 \u89E6\u53D1\u4E86 0.5B \u672C\u5730\u6A21\u578B\u5224\u5B9A")
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
              whiteSpace: "pre-wrap",
              color: "#e2e8f0"
            }
          },
          dryRunRes.ok ? typeof dryRunRes.redacted === "object" ? JSON.stringify(dryRunRes.redacted, null, 2) : String(dryRunRes.redacted) : dryRunRes.error
        )
      )
    ),
    // Footer Info
    import_react.default.createElement(
      "div",
      { style: { fontSize: "12px", opacity: 0.65, display: "flex", justifyContent: "space-between" } },
      import_react.default.createElement(
        "span",
        null,
        "\u5F00\u6E90\u9879\u76EE: ",
        import_react.default.createElement("a", { href: "https://github.com/amwangfan/privacy-gateway", target: "_blank", rel: "noreferrer", style: { color: "#60a5fa", textDecoration: "none" } }, "privacy-gateway (GitHub)")
      ),
      import_react.default.createElement(
        "span",
        null,
        "\u6A21\u578B\u6743\u91CD: ",
        import_react.default.createElement("a", { href: "https://huggingface.co/amwangfan/privacy-gateway-v4-qwen2.5-0.5b", target: "_blank", rel: "noreferrer", style: { color: "#60a5fa", textDecoration: "none" } }, "Qwen2.5-0.5B v4 (Hugging Face)")
      )
    )
  );
}
function apply(ctx) {
  const slots = ctx.get ? ctx.get("slots") : ctx.slots;
  if (!slots) return;
  if (slots.inject) {
    slots.inject("settings.section", () => {
      try {
        return slots.register(
          {
            name: "settings.section",
            id: "dsh-privacy-guard",
            order: 85,
            label: () => "\u9690\u79C1\u8131\u5BC6 (Privacy Guard)"
          },
          PrivacyGuardView
        );
      } catch {
        return () => {
        };
      }
    });
    try {
      slots.inject("shell.overlay", () => {
        try {
          return slots.register(
            { name: "shell.overlay", id: "privacy-guard-exemption-banner", order: 60 },
            ExemptionBanner
          );
        } catch {
          return () => {
          };
        }
      });
    } catch {
    }
  }
}

		return module.exports;
	}
});
