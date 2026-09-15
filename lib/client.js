// src/client.ts
import React, { useState, useEffect, useCallback } from "react";
var name = "dsh-privacy-guard-client";
function PrivacyGuardView() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputVal, setInputVal] = useState(
    '# \u6D4B\u8BD5\u654F\u611F\u51ED\u636E\u6CC4\u6F0F\uFF1A\napi_key = "sk-proj-abcdefghijklmnopqrstuvwxyz123456"\ndb_url = "postgres://root:SuperSecret123@db.internal:5432/main"\npassword = "my_private_db_password_2026"\nsafe_word = "hello world office-N100"'
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
  return React.createElement(
    "div",
    {
      style: {
        padding: "24px",
        maxWidth: "960px",
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
        "\u76D1\u63A7\u672C\u5730 Privacy Gateway (:8317) \u4E0E Qwen2.5-0.5B \u672C\u5730\u5C0F\u6A21\u578B\u7684\u8131\u5BC6\u8FD0\u8F6C\u72B6\u6001\u3002\u6240\u6709\u654F\u611F API Token\u3001\u79C1\u94A5\u3001\u6570\u636E\u5E93\u5BC6\u7801\u5728\u79BB\u5F00\u5C40\u57DF\u7F51\u524D\u88AB\u5F3A\u5236\u8131\u654F\uFF0C\u6D41\u5F0F\u56DE\u663E\u65E0\u611F\u8FD8\u539F\u3002"
      )
    ),
    // Status Badges Row
    React.createElement(
      "div",
      { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" } },
      // Gateway Card
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
      // Classifier Card
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
          React.createElement("span", { style: { fontSize: "14px", fontWeight: 600 } }, "\u5343\u95EE 0.5B \u6B8B\u5DEE\u5206\u7C7B\u5668 (:8319)"),
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
            cfOnline ? "\u25CF \u5728\u7EBF (Qwen2.5-0.5B F16)" : "\u25CB \u672A\u52A0\u8F7D (Offline)"
          )
        ),
        React.createElement(
          "div",
          { style: { fontSize: "12px", opacity: 0.8, lineHeight: "1.8" } },
          React.createElement("div", null, `\u63A8\u7406\u7AEF\u70B9: ${status?.classifier.url || "http://127.0.0.1:8319"}`),
          React.createElement("div", null, `Layer 1 \u7F13\u5B58\u6761\u6570: ${stats?.layer1.cache_size ?? "--"}`),
          React.createElement("div", null, `\u6B8B\u5DEE\u8BC6\u522B\u547D\u4E2D\u6570: ${stats?.layer1.hits ?? "--"}`)
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
        { label: "\u5185\u5B58 Vault \u6D3B\u8DC3\u51ED\u636E", value: stats?.active_vault_mappings ?? 0, color: "#fbbf24" },
        { label: "0.5B \u6A21\u578B\u5206\u7C7B\u6B21\u6570", value: stats?.layer1.classified ?? 0, color: "#a78bfa" }
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
        "\u5728\u4E0B\u65B9\u8D34\u5165\u4EFB\u610F\u5305\u542B\u53E3\u4EE4\u3001Token\u3001\u79C1\u94A5\u6216\u914D\u7F6E\u6587\u672C\uFF0C\u6D4B\u8BD5\u7F51\u5173\u4E24\u5C42\u89C4\u5219\uFF08Layer 0 \u6B63\u5219 + Layer 1 0.5B \u5224\u5B9A\uFF09\u7684\u8131\u654F\u66FF\u6362\u6548\u679C\uFF08\u7EAF\u672C\u5730\u4EFF\u771F\uFF0C\u4E0D\u51FA\u7F51\uFF09\uFF1A"
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
        React.createElement("a", { href: "https://huggingface.co/amwangfan/privacy-gateway-v4-qwen2.5-0.5b", target: "_blank", rel: "noreferrer", style: { color: "#60a5fa", textDecoration: "none" } }, "Qwen2.5-0.5B v4 (Hugging Face)")
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
