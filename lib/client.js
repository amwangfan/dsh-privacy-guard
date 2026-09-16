// src/client.ts
import React, { useState, useEffect, useCallback } from "react";
var name = "dsh-privacy-guard-client";
function PrivacyGuardView() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputVal, setInputVal] = useState(
    '# \u6D4B\u8BD5\u654F\u611F\u51ED\u636E\u8131\u5BC6\uFF08\u652F\u6301\u6B63\u5219\u3001\u5343\u95EE0.5B\u6A21\u578B\u5224\u5B9A\u3001\u4EE5\u53CA\u81EA\u5B9A\u4E49\u5BC6\u7801\u5BC6\u94A5\uFF09\uFF1A\napi_key = "<SECRET_API_KEY_15>"\ndb_url = "postgres://root:<SECRET_DB_PASS_9>@db.internal:5432/main"\npassword = "<SECRET_LLM_SECRET_111>"\ncustom_token = "<SECRET_LLM_SECRET_263>"\nsafe_word = "hello world office-N100"'
  );
  const [dryRunRes, setDryRunRes] = useState(null);
  const [dryRunLoading, setDryRunLoading] = useState(false);
  const fetchStatus = useCallback(async () => {
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
  useEffect(() => {
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
  return React.createElement(
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
    React.createElement(
      "div",
      { style: { marginBottom: "24px", borderBottom: "1px solid var(--dsh-border, rgba(255,255,255,0.1))", paddingBottom: "16px" } },
      React.createElement("h2", { style: { margin: "0 0 8px 0", fontSize: "20px", fontWeight: 600 } }, "\u{1F6E1}\uFE0F DSH \u9690\u79C1\u8131\u5BC6\u7F51\u5173 (Privacy Guard)"),
      React.createElement(
        "p",
        { style: { margin: 0, fontSize: "13px", opacity: 0.75, lineHeight: "1.5" } },
        "\u5B9E\u65F6\u76D1\u63A7\u672C\u5730 Privacy Gateway (:8317)\u3001Qwen2.5-0.5B \u672C\u5730\u5C0F\u6A21\u578B (:8319) \u53CA AES-GCM \u672C\u5730\u52A0\u5BC6\u6301\u4E45\u5316\u5B58\u50A8\u72B6\u6001\u3002\u654F\u611F\u51ED\u636E\u5728\u79BB\u5F00\u5185\u7F51\u524D\u5F3A\u5236\u8131\u654F\uFF0C\u6D41\u5F0F\u56DE\u663E\u65E0\u611F\u8FD8\u539F\u3002"
      )
    ),
    // Status Badges Row (3 cards: Gateway, Classifier, Persistent Storage)
    React.createElement(
      "div",
      { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" } },
      // 1. Gateway Card
      React.createElement(
        "div",
        {
          style: {
            background: "var(--dsh-card-bg, rgba(255,255,255,0.03))",
            borderRadius: "10px",
            border: `1px solid ${gwOnline ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            padding: "16px"
          }
        },
        React.createElement(
          "div",
          { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } },
          React.createElement("span", { style: { fontSize: "14px", fontWeight: 600 } }, "\u7F51\u7EDC\u8131\u5BC6\u7F51\u5173 (:8317)"),
          React.createElement(
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
        React.createElement(
          "div",
          { style: { fontSize: "12px", opacity: 0.8, lineHeight: "1.8" } },
          React.createElement("div", null, `\u76D1\u542C\u5730\u5740: ${status?.gateway.url || "http://127.0.0.1:8317"}`),
          React.createElement("div", null, `\u5728\u7EBF\u65F6\u957F: ${stats ? `${Math.floor(stats.uptime_seconds / 60)} \u5206\u949F` : "--"}`),
          React.createElement("div", null, `\u5360\u4F4D\u7B26\u89C4\u8303: ${stats?.placeholder_prefix || "<SECRET_"}*`)
        )
      ),
      // 2. Classifier Card
      React.createElement(
        "div",
        {
          style: {
            background: "var(--dsh-card-bg, rgba(255,255,255,0.03))",
            borderRadius: "10px",
            border: `1px solid ${cfOnline ? "rgba(59,130,246,0.3)" : "rgba(156,163,175,0.3)"}`,
            padding: "16px"
          }
        },
        React.createElement(
          "div",
          { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } },
          React.createElement("span", { style: { fontSize: "14px", fontWeight: 600 } }, "\u5343\u95EE 0.5B \u6B8B\u5DEE\u6A21\u578B (:8319)"),
          React.createElement(
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
        React.createElement(
          "div",
          { style: { fontSize: "12px", opacity: 0.8, lineHeight: "1.8" } },
          React.createElement("div", null, `\u63A8\u7406\u7AEF\u70B9: ${status?.classifier.url || "http://127.0.0.1:8319"}`),
          React.createElement("div", null, `\u5E76\u53D1\u6A21\u5F0F: 2 \u69FD\u4F4D\u5E76\u884C (Parallel)`),
          React.createElement("div", null, `Layer 1 \u7F13\u5B58: ${stats?.layer1.cache_size ?? "--"} \u6761`)
        )
      ),
      // 3. Persistent Vault Card
      React.createElement(
        "div",
        {
          style: {
            background: "var(--dsh-card-bg, rgba(255,255,255,0.03))",
            borderRadius: "10px",
            border: `1px solid ${persist?.enabled ? "rgba(168,85,247,0.3)" : "rgba(156,163,175,0.3)"}`,
            padding: "16px"
          }
        },
        React.createElement(
          "div",
          { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } },
          React.createElement("span", { style: { fontSize: "14px", fontWeight: 600 } }, "\u672C\u5730\u52A0\u5BC6\u6301\u4E45\u5316 (SQLite)"),
          React.createElement(
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
        React.createElement(
          "div",
          { style: { fontSize: "12px", opacity: 0.8, lineHeight: "1.8" } },
          React.createElement("div", null, `\u843D\u76D8\u51ED\u636E: ${persist?.vault_rows ?? "--"} \u6761`),
          React.createElement("div", null, `\u6A21\u578B\u7F13\u5B58: ${persist?.layer1_rows ?? "--"} \u6761`),
          React.createElement("div", null, `\u5BC6\u94A5\u6765\u6E90: ${persist?.key_source === "password" ? "\u{1F511} \u7528\u6237\u81EA\u5B9A\u4E49\u5BC6\u7801 (PBKDF2)" : "\u{1F4C4} \u7CFB\u7EDF\u4E3B\u5BC6\u94A5\u6587\u4EF6"}`)
        )
      )
    ),
    // Metrics Counters
    React.createElement(
      "div",
      { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" } },
      [
        { label: "\u7D2F\u8BA1\u62E6\u622A\u8131\u654F", value: stats?.total_redacted_secrets ?? 0, color: "#38bdf8" },
        { label: "\u51FA\u7F51\u6D41\u5F0F\u8FD8\u539F", value: stats?.total_restored_secrets ?? 0, color: "#34d399" },
        { label: "Vault \u51ED\u636E\u603B\u5E93", value: persist?.vault_rows ?? (stats?.active_vault_mappings ?? 0), color: "#fbbf24" },
        { label: "0.5B \u6A21\u578B\u5206\u7C7B\u547D\u4E2D", value: stats?.layer1.hits ?? 0, color: "#a78bfa" }
      ].map(
        (item, idx) => React.createElement(
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
          React.createElement("div", { style: { fontSize: "11px", opacity: 0.7, marginBottom: "6px" } }, item.label),
          React.createElement("div", { style: { fontSize: "22px", fontWeight: 700, color: item.color } }, item.value)
        )
      )
    ),
    // User Configuration & Custom Secrets Guide
    React.createElement(
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
      React.createElement("div", { style: { fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "#60a5fa" } }, "\u2699\uFE0F \u7528\u6237\u81EA\u5B9A\u4E49\u5BC6\u7801\u5BC6\u94A5\u4E0E\u89C4\u5219\u914D\u7F6E\u6307\u5F15"),
      React.createElement(
        "div",
        { style: { opacity: 0.85 } },
        React.createElement("div", null, "\u2022 ", React.createElement("b", null, "\u81EA\u5B9A\u4E49\u5B58\u50A8\u4E3B\u5BC6\u7801 (Vault Password): "), "\u53EF\u901A\u8FC7\u73AF\u5883\u53D8\u91CF ", React.createElement("code", null, 'VAULT_PASSWORD="\u4F60\u7684\u5F3A\u53E3\u4EE4"'), " \u81EA\u5B9A\u4E49\u6301\u4E45\u5316\u6570\u636E\u5E93\u7684 AES-256 \u52A0\u5BC6\u5BC6\u94A5\uFF08\u91C7\u7528 PBKDF2-HMAC-SHA256 \u6D3E\u751F\uFF09\uFF0C\u4E0D\u518D\u53D7\u9650\u4E8E\u5355\u673A\u968F\u673A\u6587\u4EF6\u3002"),
        React.createElement("div", null, "\u2022 ", React.createElement("b", null, "\u81EA\u5B9A\u4E49\u654F\u611F\u51ED\u636E\u8BCD\u8868 (Custom Secrets): "), "\u53EF\u901A\u8FC7\u73AF\u5883\u53D8\u91CF ", React.createElement("code", null, 'CUSTOM_SECRETS="token1,password2"'), " \u6216\u5C06\u654F\u611F\u8BCD\u5199\u5165 ", React.createElement("code", null, "/etc/privacy-gateway/custom_secrets.txt"), "\u3002\u5217\u8868\u5185\u7684\u654F\u611F\u8BCD\u5C06\u4F5C\u4E3A Layer 0 \u6700\u9AD8\u4F18\u5148\u7EA7\u5F3A\u5236\u8131\u5BC6\uFF0C\u96F6\u63A8\u7406\u5EF6\u8FDF\u3002")
      )
    ),
    // Interactive Dry-run Sandbox
    React.createElement(
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
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" } },
        React.createElement("span", { style: { fontSize: "14px", fontWeight: 600 } }, "\u{1F9EA} \u5728\u7EBF\u6CC4\u5BC6\u63A2\u6D4B\u6C99\u7BB1 (Dry-Run Tester)"),
        React.createElement(
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
      React.createElement(
        "div",
        { style: { fontSize: "12px", opacity: 0.7, marginBottom: "10px" } },
        "\u5728\u4E0B\u65B9\u8D34\u5165\u4EFB\u610F\u5305\u542B\u53E3\u4EE4\u3001Token\u3001\u79C1\u94A5\u6216\u914D\u7F6E\u6587\u672C\uFF0C\u6D4B\u8BD5\u7F51\u5173\u4E24\u5C42\u89C4\u5219\uFF08Layer 0 \u6B63\u5219 + Layer 1 0.5B \u5224\u5B9A + \u7528\u6237\u81EA\u5B9A\u4E49\u5BC6\u94A5\uFF09\u7684\u8131\u654F\u66FF\u6362\u6548\u679C\uFF08\u7EAF\u672C\u5730\u4EFF\u771F\uFF0C\u4E0D\u51FA\u7F51\uFF09\uFF1A"
      ),
      React.createElement("textarea", {
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
      dryRunRes && React.createElement(
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
        React.createElement(
          "div",
          { style: { display: "flex", justifyContent: "space-between", marginBottom: "8px", fontWeight: 600 } },
          React.createElement("span", { style: { color: dryRunRes.ok ? "#4ade80" : "#f87171" } }, dryRunRes.ok ? "\u2713 \u8131\u5BC6\u6210\u529F (\u51FA\u7F51\u6587\u672C\u5DF2\u5360\u4F4D\u7B26\u5316)" : "\u2717 \u6D4B\u8BD5\u5931\u8D25"),
          dryRunRes.layer1_applied && React.createElement("span", { style: { fontSize: "11px", color: "#93c5fd" } }, "\u2605 \u89E6\u53D1\u4E86 0.5B \u672C\u5730\u6A21\u578B\u5224\u5B9A")
        ),
        React.createElement(
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
    React.createElement(
      "div",
      { style: { fontSize: "12px", opacity: 0.65, display: "flex", justifyContent: "space-between" } },
      React.createElement(
        "span",
        null,
        "\u5F00\u6E90\u9879\u76EE: ",
        React.createElement("a", { href: "https://github.com/amwangfan/privacy-gateway", target: "_blank", rel: "noreferrer", style: { color: "#60a5fa", textDecoration: "none" } }, "privacy-gateway (GitHub)")
      ),
      React.createElement(
        "span",
        null,
        "\u6A21\u578B\u6743\u91CD: ",
        React.createElement("a", { href: "https://huggingface.co/amwangfan/<SECRET_LLM_SECRET_89>.5-0.5b", target: "_blank", rel: "noreferrer", style: { color: "#60a5fa", textDecoration: "none" } }, "Qwen2.5-0.5B v4 (Hugging Face)")
      )
    )
  );
}
function apply(ctx) {
  if (ctx.slots?.inject) {
    ctx.slots.inject("settings.section", () => {
      try {
        return ctx.slots.register(
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
  }
}
export {
  PrivacyGuardView,
  apply,
  name
};
