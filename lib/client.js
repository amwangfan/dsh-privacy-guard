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
    "section.label": "\u9690\u79C1\u4FDD\u62A4",
    "panel.title": "\u9690\u79C1\u4FDD\u62A4",
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
    "key.title": "\u52A0\u5BC6\u5BC6\u94A5",
    "key.mode.file": "\u5BC6\u94A5\u6587\u4EF6",
    "key.mode.password": "\u81EA\u5B9A\u4E49\u53E3\u4EE4",
    "key.current": "\u6765\u6E90",
    "key.vaultRows": "\u843D\u76D8\u51ED\u636E",
    "key.customLabel": "\u81EA\u5B9A\u4E49\u53E3\u4EE4\uFF08\u53EF\u9009\uFF09",
    "key.customHint": "\u8BBE\u7F6E\u540E\u7528\u4E8E\u52A0\u5BC6\u6301\u4E45\u5316\u6570\u636E\uFF1B\u7559\u7A7A\u5219\u4F7F\u7528\u81EA\u52A8\u751F\u6210\u7684\u5BC6\u94A5\u6587\u4EF6\u3002",
    "key.passwordPlaceholder": "\u81F3\u5C11 8 \u4F4D\uFF0C\u4E0D\u4F1A\u56DE\u663E",
    "key.confirmPlaceholder": "\u518D\u8F93\u5165\u4E00\u6B21",
    "key.save": "\u4FDD\u5B58",
    "key.saving": "\u6B63\u5728\u91CD\u65B0\u52A0\u5BC6\u2026",
    "key.clear": "\u6539\u56DE\u5BC6\u94A5\u6587\u4EF6",
    "key.notSet": "\u672A\u8BBE\u7F6E",
    "key.mismatch": "\u4E24\u6B21\u8F93\u5165\u4E0D\u4E00\u81F4",
    "key.tooShort": "\u53E3\u4EE4\u81F3\u5C11 8 \u4F4D",
    "key.rotated": "\u5DF2\u91CD\u65B0\u52A0\u5BC6 {count} \u6761\u51ED\u636E",
    "key.rotatedClear": "\u5DF2\u6539\u56DE\u5BC6\u94A5\u6587\u4EF6",
    "key.restartHint": "\u6539\u52A8\u5DF2\u4FDD\u5B58\uFF0C\u53EF\u91CD\u542F DSH \u5237\u65B0\u663E\u793A",
    "key.warn": "\u66F4\u6362\u5BC6\u94A5\u4F1A\u91CD\u65B0\u52A0\u5BC6\u5DF2\u6709\u51ED\u636E\uFF1B\u65E7\u5BF9\u8BDD\u91CC\u7684\u5360\u4F4D\u7B26\u4ECD\u53EF\u6B63\u5E38\u8FD8\u539F\u3002",
    "exempt.edit": "\u7F16\u8F91",
    "exempt.editing": "\u7F16\u8F91\u767D\u540D\u5355",
    "exempt.editHint": "\u6BCF\u884C\u4E00\u4E2A\u8BCD\uFF1B\u5220\u9664\u67D0\u884C\u5373\u64A4\u9500\u8BE5\u8C41\u514D\u3002",
    "exempt.save": "\u4FDD\u5B58",
    "exempt.saving": "\u4FDD\u5B58\u4E2D\u2026",
    "exempt.cancel": "\u53D6\u6D88",
    "exempt.applied": "\u767D\u540D\u5355\u5DF2\u66F4\u65B0\uFF08\u65B0\u589E {added}\uFF0C\u64A4\u9500 {removed}\uFF09",
    "exempt.addedByPanel": "\u5728\u63D2\u4EF6\u9762\u677F\u4E2D\u4EBA\u5DE5\u6DFB\u52A0",
    "protect.title": "\u51ED\u636E\u4FDD\u62A4\u6A21\u578B",
    "protect.hint": "\u590D\u5236\u4E00\u4EFD\u73B0\u6709 provider\uFF0C\u6307\u5411\u7F51\u5173\uFF0C\u5199\u8FDB\u6A21\u578B\u5217\u8868\uFF1B\u539F provider \u56DE\u5230\u76F4\u8FDE\uFF0C\u4E24\u6761\u94FE\u8DEF\u5E76\u5B58\u3002",
    "protect.apply": "\u5199\u5165\u6A21\u578B\u5217\u8868",
    "protect.applying": "\u5199\u5165\u4E2D\u2026",
    "protect.created": "\u5DF2\u521B\u5EFA {name}\uFF08{models} \u4E2A\u6A21\u578B\uFF09",
    "protect.updated": "\u5DF2\u66F4\u65B0 {name}",
    "protect.noop": "\u5DF2\u662F\u6700\u65B0\uFF0C\u65E0\u9700\u6539\u52A8",
    "protect.flipped": "\u539F provider \u5DF2\u6539\u56DE\u76F4\u8FDE {url}",
    "protect.source": "\u6E90 provider",
    "protect.gatewayUrl": "\u7F51\u5173\u5730\u5740\uFF08\u4FDD\u62A4\u94FE\u8DEF\uFF09",
    "protect.directUrl": "\u76F4\u8FDE\u5730\u5740\uFF08\u539F\u94FE\u8DEF\uFF09",
    "protect.selected": "\u5728\u6A21\u578B\u5217\u8868\u91CC\u9009\u5E26\u300C\u51ED\u636E\u4FDD\u62A4\u300D\u7684\u6761\u76EE\u5373\u8D70\u7F51\u5173",
    "deploy.title": "\u7F51\u5173\u4E0E\u6A21\u578B\u90E8\u7F72",
    "deploy.installing": "\u5B89\u88C5\u4E2D\u2026",
    "deploy.install": "\u4E0B\u8F7D\u5E76\u90E8\u7F72",
    "deploy.installBoth": "\u4E0B\u8F7D\u5E76\u90E8\u7F72\u7F3A\u5931\u90E8\u5206",
    "deploy.start": "\u542F\u52A8",
    "deploy.stop": "\u505C\u6B62",
    "deploy.restart": "\u91CD\u542F",
    "deploy.running": "\u8FD0\u884C\u4E2D",
    "deploy.stopped": "\u672A\u8FD0\u884C",
    "deploy.missing": "\u672A\u5B89\u88C5",
    "deploy.ready": "\u5DF2\u5C31\u7EEA",
    "deploy.gateway": "\u8131\u5BC6\u7F51\u5173",
    "deploy.model": "\u5C0F\u6A21\u578B",
    "deploy.settings": "\u94FE\u63A5\u4E0E\u7AEF\u53E3",
    "deploy.save": "\u4FDD\u5B58\u5E76\u91CD\u542F",
    "deploy.saving": "\u5E94\u7528\u4E2D\u2026",
    "deploy.saved": "\u5DF2\u5E94\u7528\uFF08\u91CD\u542F\uFF1A{parts}\uFF09",
    "deploy.nothingToDo": "\u65E0\u9700\u6539\u52A8",
    "deploy.log": "\u67E5\u770B\u65E5\u5FD7",
    "deploy.hideLog": "\u6536\u8D77\u65E5\u5FD7",
    "deploy.linkHint": "\u6A21\u578B\u53EF\u72EC\u7ACB\u4E8E\u7F51\u5173\u8FD0\u884C\uFF1B\u82E5\u6A21\u578B\u5728\u522B\u5904\uFF0C\u628A\u6A21\u578B\u5730\u5740\u6307\u5411\u90A3\u53F0\u673A\u5668\u5373\u53EF\uFF0C\u672C\u5730\u6A21\u578B\u65E0\u9700\u542F\u52A8\u3002",
    "deploy.installingHint": "\u6B63\u5728\u540E\u53F0\u4E0B\u8F7D\u6216\u90E8\u7F72\uFF0C\u53EF\u7EE7\u7EED\u64CD\u4F5C\uFF0C\u7A0D\u540E\u5237\u65B0\u67E5\u770B\u8FDB\u5EA6\u3002",
    "deploy.weights": "\u6743\u91CD",
    "banner.dismiss": "\u5173\u95ED",
    "error.noGateway": "\u65E0\u6CD5\u8FDE\u63A5\u9690\u79C1\u7F51\u5173"
  },
  en: {
    "section.label": "Privacy Protection",
    "panel.title": "Privacy Protection",
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
    "key.title": "Encryption key",
    "key.mode.file": "Key file",
    "key.mode.password": "Custom passphrase",
    "key.current": "Source",
    "key.vaultRows": "Stored credentials",
    "key.customLabel": "Custom passphrase (optional)",
    "key.customHint": "Used to encrypt persisted data. Leave empty to keep the generated key file.",
    "key.passwordPlaceholder": "At least 8 characters, never echoed back",
    "key.confirmPlaceholder": "Repeat the passphrase",
    "key.save": "Save",
    "key.saving": "Re-encrypting\u2026",
    "key.clear": "Use the key file",
    "key.notSet": "not set",
    "key.mismatch": "The two entries differ",
    "key.tooShort": "Use at least 8 characters",
    "key.rotated": "Re-encrypted {count} credential(s)",
    "key.rotatedClear": "Switched back to the key file",
    "key.restartHint": "Saved. Restart DSH to refresh this panel.",
    "key.warn": "Changing the key re-encrypts stored credentials; placeholders in older chats stay restorable.",
    "exempt.edit": "Edit",
    "exempt.editing": "Edit whitelist",
    "exempt.editHint": "One term per line; removing a line revokes that exemption.",
    "exempt.save": "Save",
    "exempt.saving": "Saving\u2026",
    "exempt.cancel": "Cancel",
    "exempt.applied": "Whitelist updated (+{added}, -{removed})",
    "exempt.addedByPanel": "added by hand in the panel",
    "protect.title": "Credential-protected models",
    "protect.hint": "Copies an existing provider, points it at the gateway and writes it into the model list; the original goes back to the direct route so both remain available.",
    "protect.apply": "Add to model list",
    "protect.applying": "Writing\u2026",
    "protect.created": "Created {name} ({models} models)",
    "protect.updated": "Updated {name}",
    "protect.noop": "Already current",
    "protect.flipped": "Original provider moved back to the direct route {url}",
    "protect.source": "Source provider",
    "protect.gatewayUrl": "Gateway URL (protected route)",
    "protect.directUrl": "Direct URL (original route)",
    "protect.selected": 'Pick the entry marked "credential-protected" in the model list to go through the gateway',
    "deploy.title": "Gateway & model deployment",
    "deploy.installing": "Installing\u2026",
    "deploy.install": "Download & deploy",
    "deploy.installBoth": "Download & deploy what is missing",
    "deploy.start": "Start",
    "deploy.stop": "Stop",
    "deploy.restart": "Restart",
    "deploy.running": "running",
    "deploy.stopped": "stopped",
    "deploy.missing": "not installed",
    "deploy.ready": "ready",
    "deploy.gateway": "Gateway",
    "deploy.model": "Model",
    "deploy.settings": "Links and ports",
    "deploy.save": "Save and restart",
    "deploy.saving": "Applying\u2026",
    "deploy.saved": "Applied (restarted: {parts})",
    "deploy.nothingToDo": "nothing to change",
    "deploy.log": "Show log",
    "deploy.hideLog": "Hide log",
    "deploy.linkHint": "The model runs independently of the gateway. If it lives elsewhere, point the model URL at that host and the local model need not run.",
    "deploy.installingHint": "Downloading or deploying in the background; keep working and refresh for progress.",
    "deploy.weights": "weights",
    "banner.dismiss": "Dismiss",
    "error.noGateway": "Cannot reach the privacy gateway"
  }
};
function interpolate(text, params) {
  if (!params) return text;
  let out = text;
  for (const [k, v] of Object.entries(params)) out = out.split(`{${k}}`).join(String(v));
  return out;
}
function bindTranslator(ctx) {
  try {
    const locale = ctx && ctx.get ? ctx.get("locale") : void 0;
    if (locale && typeof locale.bind === "function") return locale.bind(NS);
  } catch {
  }
  return null;
}
function documentLocale() {
  try {
    const lang = String(globalThis.document?.documentElement?.lang || "").toLowerCase();
    if (lang) return lang;
    const nav = String(globalThis.navigator?.language || "").toLowerCase();
    return nav;
  } catch {
    return "";
  }
}
function makeT(ctx) {
  let bound = null;
  return (key, params) => {
    if (bound === null) bound = bindTranslator(ctx) || false;
    if (bound) {
      try {
        const out = bound(key);
        if (typeof out === "string" && out !== key) return interpolate(out, params);
      } catch {
      }
    }
    const lang = documentLocale();
    const dict = lang.startsWith("zh") ? DICT.zh : DICT.en;
    const text = dict[key] ?? DICT.en[key] ?? key;
    return interpolate(text, params);
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
  const tickRef = (0, import_react.useRef)(async () => {
  });
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
    tickRef.current = tick;
    tick();
    const timer = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);
  return { list, fresh, online, clear: () => setFresh([]), refresh: () => tickRef.current() };
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
function NotificationBanner(props) {
  const { t } = props;
  const [item, setItem] = (0, import_react.useState)(null);
  const cursor = (0, import_react.useRef)(0);
  const primed = (0, import_react.useRef)(false);
  (0, import_react.useEffect)(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await fetch(`/api/${PKG}/health`);
        if (!r.ok) return;
        const data = await r.json();
        const notes = data?.notifications;
        if (!notes || !Array.isArray(notes.items)) return;
        const at = Number(notes.changed_at || 0);
        if (primed.current && at > cursor.current) {
          const newest = notes.items[notes.items.length - 1];
          if (newest && !cancelled) setItem(newest);
        }
        cursor.current = Math.max(cursor.current, at);
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
  if (!item) return null;
  const added = item.kind === "add";
  const accent = added ? "#f59e0b" : item.kind === "key-change" ? "#a78bfa" : "#22c55e";
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
      import_react.default.createElement("span", null, added ? "\u26A0\uFE0F" : item.kind === "key-change" ? "\u{1F511}" : "\u2705"),
      import_react.default.createElement(
        "div",
        { style: { flex: 1, minWidth: 0 } },
        import_react.default.createElement(
          "div",
          { style: { fontWeight: 700, color: accent, marginBottom: "2px", wordBreak: "break-all" } },
          item.title || item.dedupe_key
        ),
        item.detail ? import_react.default.createElement("div", { style: { opacity: 0.9 } }, item.detail) : null,
        import_react.default.createElement(
          "div",
          { style: { opacity: 0.6, fontSize: "12px" } },
          `${t("exempt.bannerBy")}: ${item.actor || "-"}`
        )
      ),
      import_react.default.createElement(
        "button",
        {
          onClick: () => setItem(null),
          title: t("banner.dismiss"),
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
function DeployCard(props) {
  const { t } = props;
  const [st, setSt] = (0, import_react.useState)(null);
  const [busy, setBusy] = (0, import_react.useState)(null);
  const [note, setNote] = (0, import_react.useState)(null);
  const [showSettings, setShowSettings] = (0, import_react.useState)(false);
  const [showLog, setShowLog] = (0, import_react.useState)(null);
  const [logText, setLogText] = (0, import_react.useState)("");
  const [form, setForm] = (0, import_react.useState)({});
  const load = (0, import_react.useCallback)(async () => {
    try {
      const r = await fetch(`/api/${PKG}/deploy`);
      const d = await r.json();
      setSt(d);
      setForm((prev) => {
        if (Object.keys(prev).length) return prev;
        const c = d.config || {};
        return {
          model_url: String(c.model_url ?? ""),
          backend_url: String(c.backend_url ?? ""),
          gateway_port: String(c.gateway_port ?? ""),
          model_port: String(c.model_port ?? ""),
          model_gguf_url: String(c.model_gguf_url ?? ""),
          model_binary_url: String(c.model_binary_url ?? "")
        };
      });
    } catch {
      setSt(null);
    }
  }, []);
  (0, import_react.useEffect)(() => {
    load();
    const timer = setInterval(load, st?.installing ? 3e3 : 8e3);
    return () => clearInterval(timer);
  }, [load, st?.installing]);
  const act = async (action, part = "all", values) => {
    setBusy(action);
    setNote(null);
    try {
      const r = await fetch(`/api/${PKG}/deploy`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, part, values })
      });
      const d = await r.json();
      if (!d.ok) {
        setNote({ ok: false, text: d.error || t("sandbox.fail") });
        return;
      }
      if (action === "config") {
        const parts = (d.restarted || []).join(", ");
        setNote({ ok: true, text: t("deploy.saved", { parts: parts || t("deploy.nothingToDo") }) });
      } else if (action === "install") {
        setNote({ ok: true, text: d.detail || t("deploy.installingHint") });
      }
      await load();
    } catch (e) {
      setNote({ ok: false, text: e?.message || t("sandbox.fail") });
    } finally {
      setBusy(null);
    }
  };
  const openLog = async (part) => {
    if (showLog === part) {
      setShowLog(null);
      return;
    }
    setShowLog(part);
    setLogText("\u2026");
    try {
      const r = await fetch(`/api/${PKG}/deploy/logs?part=${part}&lines=120`);
      const d = await r.json();
      setLogText(d.text || "(empty)");
    } catch {
      setLogText("(unavailable)");
    }
  };
  const row = (label, part, info) => {
    if (!info) return null;
    const running = info.active === "active";
    const tone = running ? "#4ade80" : info.ready ? "#fbbf24" : "#f87171";
    const state = running ? t("deploy.running") : info.ready ? t("deploy.stopped") : t("deploy.missing");
    return import_react.default.createElement(
      "div",
      { style: { padding: "8px 10px", borderRadius: "8px", background: "rgba(0,0,0,0.18)", marginBottom: "6px" } },
      import_react.default.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" } },
        import_react.default.createElement("span", { style: { fontSize: "12px", fontWeight: 600 } }, label),
        import_react.default.createElement("span", { style: { fontSize: "11px", fontWeight: 600, color: tone } }, `\u25CF ${state}`)
      ),
      import_react.default.createElement(
        "div",
        { style: { fontSize: "11px", opacity: 0.6, marginTop: "3px", wordBreak: "break-all" } },
        info.url + (part === "model" ? ` \xB7 ${t("deploy.weights")} ${Math.round((info.weights_bytes || 0) / 1048576)} MiB` : "")
      ),
      !info.ready && info.needs?.length ? import_react.default.createElement(
        "div",
        { style: { fontSize: "11px", color: "#f87171", marginTop: "2px" } },
        `${t("deploy.missing")}: ${info.needs.join(", ")}`
      ) : null,
      import_react.default.createElement(
        "div",
        { style: { display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" } },
        !info.ready ? button(t("deploy.install"), () => act("install", part), busy === "install") : null,
        running ? button(t("deploy.stop"), () => act("stop", part), busy === "stop") : button(t("deploy.start"), () => act("start", part), busy === "start"),
        running ? button(t("deploy.restart"), () => act("restart", part), busy === "restart") : null,
        button(showLog === part ? t("deploy.hideLog") : t("deploy.log"), () => openLog(part), false)
      )
    );
  };
  const button = (label, onClick, disabled) => import_react.default.createElement(
    "button",
    {
      onClick,
      disabled,
      style: {
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "11px",
        background: "transparent",
        color: "inherit",
        border: "1px solid rgba(255,255,255,0.18)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1
      }
    },
    label
  );
  const field = (key, label, placeholder = "") => import_react.default.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: "3px", flex: "1 1 240px" } },
    import_react.default.createElement("label", { style: { fontSize: "11px", opacity: 0.7 } }, label),
    import_react.default.createElement("input", {
      value: form[key] ?? "",
      placeholder,
      spellCheck: false,
      onChange: (e) => setForm({ ...form, [key]: e.target.value }),
      style: {
        background: "rgba(0,0,0,0.25)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "6px",
        color: "inherit",
        padding: "5px 8px",
        fontSize: "11px",
        fontFamily: "monospace"
      }
    })
  );
  return import_react.default.createElement(
    "div",
    { style: { ...card, marginTop: "16px" } },
    import_react.default.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } },
      import_react.default.createElement("span", { style: { fontSize: "13px", fontWeight: 600 } }, t("deploy.title")),
      st?.installing ? import_react.default.createElement("span", { style: { fontSize: "11px", fontWeight: 600, color: "#fbbf24" } }, t("deploy.installing")) : import_react.default.createElement(
        "button",
        {
          onClick: () => setShowSettings(!showSettings),
          style: {
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "6px",
            color: "inherit",
            fontSize: "11px",
            padding: "2px 8px",
            cursor: "pointer"
          }
        },
        t("deploy.settings")
      )
    ),
    !st && import_react.default.createElement("div", { style: dim }, t("exempt.apiDownHint")),
    st && row(t("deploy.gateway"), "gateway", st.gateway),
    st && row(t("deploy.model"), "model", st.model),
    st && (!st.gateway?.ready || !st.model?.ready) ? import_react.default.createElement(
      "div",
      { style: { marginTop: "4px" } },
      button(t("deploy.installBoth"), () => act("install", "auto"), busy === "install")
    ) : null,
    showLog && import_react.default.createElement(
      "pre",
      {
        style: {
          marginTop: "8px",
          maxHeight: "180px",
          overflow: "auto",
          background: "rgba(0,0,0,0.3)",
          borderRadius: "6px",
          padding: "8px",
          fontSize: "10px",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap"
        }
      },
      logText
    ),
    showSettings ? import_react.default.createElement(
      "div",
      { style: { marginTop: "10px" } },
      import_react.default.createElement("div", { style: { ...dim, marginBottom: "6px" } }, t("deploy.linkHint")),
      import_react.default.createElement(
        "div",
        { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" } },
        field("model_url", "LAYER1_URL", "http://127.0.0.1:8319"),
        field("backend_url", "BACKEND_URL", "http://127.0.0.1:8316")
      ),
      import_react.default.createElement(
        "div",
        { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" } },
        field("gateway_port", "GATEWAY_PORT", "8317"),
        field("model_port", "MODEL_PORT", "8319")
      ),
      import_react.default.createElement(
        "div",
        { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" } },
        field("model_gguf_url", "MODEL_GGUF_URL")
      ),
      import_react.default.createElement(
        "div",
        { style: { display: "flex", gap: "8px", flexWrap: "wrap" } },
        field("model_binary_url", "MODEL_BINARY_URL")
      ),
      import_react.default.createElement(
        "div",
        { style: { marginTop: "8px" } },
        button(busy === "config" ? t("deploy.saving") : t("deploy.save"), () => act("config", "all", form), busy === "config")
      )
    ) : null,
    note ? import_react.default.createElement(
      "div",
      { style: { fontSize: "12px", marginTop: "8px", color: note.ok ? "#4ade80" : "#f87171" } },
      note.text
    ) : null
  );
}
function ProtectCard(props) {
  const { t } = props;
  const [info, setInfo] = (0, import_react.useState)(null);
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [note, setNote] = (0, import_react.useState)(null);
  const [form, setForm] = (0, import_react.useState)({ source: "", gateway: "", direct: "" });
  const [touched, setTouched] = (0, import_react.useState)(false);
  const load = (0, import_react.useCallback)(async () => {
    try {
      const [p, d] = await Promise.all([
        fetch(`/api/${PKG}/protect`).then((r) => r.json()),
        fetch(`/api/${PKG}/deploy`).then((r) => r.json())
      ]);
      setInfo(p);
      setForm((prev) => {
        if (touched) return prev;
        const found2 = p.gateway_providers || [];
        const rows = p.providers || [];
        const c = d.config || {};
        const twin = rows.find((r) => r.managed && r.source);
        const sourceName = found2.length === 1 && found2[0].name || twin && twin.source || prev.source || "";
        const sourceRow = rows.find((r) => r.name === sourceName);
        const gatewayUrl = found2.length === 1 && found2[0].baseURL || twin && twin.baseURL || prev.gateway || "";
        return {
          source: sourceName,
          gateway: gatewayUrl,
          direct: prev.direct || String(c.direct_base_url || sourceRow?.baseURL || "")
        };
      });
    } catch {
      setInfo(null);
    }
  }, [touched]);
  (0, import_react.useEffect)(() => {
    load();
  }, [load]);
  const apply2 = async () => {
    setBusy(true);
    setNote(null);
    try {
      const r = await fetch(`/api/${PKG}/protect`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "apply",
          source: form.source,
          gateway_base_url: form.gateway,
          direct_base_url: form.direct
        })
      });
      const d = await r.json();
      if (!d.ok) {
        setNote({ ok: false, text: d.error || t("sandbox.fail") });
        return;
      }
      const text = d.action === "noop" ? t("protect.noop") : d.action === "created" ? t("protect.created", { name: d.display_name || d.provider, models: d.models ?? 0 }) : t("protect.updated", { name: d.display_name || d.provider });
      const flipped = d.source_flipped_direct ? ` \xB7 ${t("protect.flipped", { url: d.source_base_url || "" })}` : "";
      setNote({ ok: true, text: text + flipped });
      await load();
    } catch (e) {
      setNote({ ok: false, text: e?.message || t("sandbox.fail") });
    } finally {
      setBusy(false);
    }
  };
  const input = (key, label, ph = "") => import_react.default.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: "3px", flex: "1 1 240px" } },
    import_react.default.createElement("label", { style: { fontSize: "11px", opacity: 0.7 } }, label),
    import_react.default.createElement("input", {
      value: form[key],
      placeholder: ph,
      spellCheck: false,
      onChange: (e) => {
        setTouched(true);
        setForm({ ...form, [key]: e.target.value });
      },
      style: {
        background: "rgba(0,0,0,0.25)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "6px",
        color: "inherit",
        padding: "5px 8px",
        fontSize: "11px",
        fontFamily: "monospace"
      }
    })
  );
  const found = info?.gateway_providers || [];
  return import_react.default.createElement(
    "div",
    { style: { ...card, marginTop: "16px" } },
    import_react.default.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" } },
      import_react.default.createElement("span", { style: { fontSize: "13px", fontWeight: 600 } }, t("protect.title")),
      import_react.default.createElement(
        "span",
        { style: { fontSize: "11px", opacity: 0.6 } },
        found.length ? found.map((f) => f.name).join(", ") : t("deploy.missing")
      )
    ),
    import_react.default.createElement("div", { style: { ...dim, marginBottom: "8px" } }, t("protect.hint")),
    import_react.default.createElement(
      "div",
      { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" } },
      input("source", t("protect.source"), "ccswitch-aggregator"),
      input("gateway", t("protect.gatewayUrl"), "http://100.114.93.90:8317/v1"),
      input("direct", t("protect.directUrl"), "http://100.114.93.90:8316/v1")
    ),
    import_react.default.createElement(
      "div",
      { style: { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" } },
      import_react.default.createElement(
        "button",
        {
          onClick: apply2,
          disabled: busy,
          style: {
            padding: "5px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            background: "var(--dsh-primary, #3b82f6)",
            color: "#fff",
            border: "none",
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.6 : 1
          }
        },
        busy ? t("protect.applying") : t("protect.apply")
      ),
      import_react.default.createElement("span", { style: { fontSize: "11px", opacity: 0.55 } }, t("protect.selected"))
    ),
    note ? import_react.default.createElement(
      "div",
      { style: { fontSize: "12px", marginTop: "8px", color: note.ok ? "#4ade80" : "#f87171", wordBreak: "break-word" } },
      note.text
    ) : null
  );
}
function ExemptionCard(props) {
  const { t } = props;
  const { list, online, refresh } = useExemptions();
  const entries = list?.entries || [];
  const stats = list?.stats;
  const tone = !online ? "#9ca3af" : entries.length ? "#fbbf24" : "#4ade80";
  const [editing, setEditing] = (0, import_react.useState)(false);
  const [draft, setDraft] = (0, import_react.useState)("");
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [note, setNote] = (0, import_react.useState)(null);
  const beginEdit = () => {
    setDraft(entries.map((e) => e.term).join("\n"));
    setNote(null);
    setEditing(true);
  };
  const save = async () => {
    const next = new Set(
      draft.split("\n").map((line) => line.trim()).filter((line) => line.length > 0)
    );
    const current = new Map(entries.map((e) => [e.term, e]));
    const added = [...next].filter((term) => !current.has(term));
    const removed = [...current.keys()].filter((term) => !next.has(term));
    if (!added.length && !removed.length) {
      setEditing(false);
      return;
    }
    setBusy(true);
    try {
      for (const term of removed) {
        await fetch(`/api/${PKG}/exemptions`, {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ term, reason: t("exempt.addedByPanel"), actor: "human:panel" })
        });
      }
      for (const term of added) {
        const r = await fetch(`/api/${PKG}/exemptions`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ term, reason: t("exempt.addedByPanel"), actor: "human:panel" })
        });
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          setNote(d.error || t("sandbox.fail"));
          setBusy(false);
          return;
        }
      }
      setNote(t("exempt.applied", { added: added.length, removed: removed.length }));
      setEditing(false);
      await refresh();
    } catch (e) {
      setNote(e?.message || t("sandbox.fail"));
    } finally {
      setBusy(false);
    }
  };
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
        { style: { display: "flex", gap: "10px", alignItems: "center" } },
        import_react.default.createElement(
          "span",
          { style: { fontSize: "11px", fontWeight: 600, color: tone } },
          !online ? t("exempt.apiDown") : entries.length ? t("exempt.active", { count: entries.length }) : t("exempt.allFiltered")
        ),
        online && !editing ? import_react.default.createElement(
          "button",
          {
            onClick: beginEdit,
            style: {
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: "6px",
              color: "inherit",
              fontSize: "11px",
              padding: "2px 8px",
              cursor: "pointer"
            }
          },
          t("exempt.edit")
        ) : null
      )
    ),
    !online && import_react.default.createElement("div", { style: { ...dim, color: "#fbbf24" } }, t("exempt.apiDownHint")),
    editing ? import_react.default.createElement(
      "div",
      null,
      import_react.default.createElement("div", { style: { ...dim, marginBottom: "6px" } }, t("exempt.editHint")),
      import_react.default.createElement("textarea", {
        value: draft,
        onChange: (e) => setDraft(e.target.value),
        rows: Math.max(4, entries.length + 2),
        spellCheck: false,
        style: {
          width: "100%",
          boxSizing: "border-box",
          background: "rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "6px",
          color: "inherit",
          padding: "8px",
          fontSize: "12px",
          fontFamily: "monospace",
          lineHeight: "1.6"
        }
      }),
      import_react.default.createElement(
        "div",
        { style: { display: "flex", gap: "8px", marginTop: "8px" } },
        import_react.default.createElement(
          "button",
          {
            onClick: save,
            disabled: busy,
            style: {
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              background: "var(--dsh-primary, #3b82f6)",
              color: "#fff",
              border: "none",
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.6 : 1
            }
          },
          busy ? t("exempt.saving") : t("exempt.save")
        ),
        import_react.default.createElement(
          "button",
          {
            onClick: () => setEditing(false),
            disabled: busy,
            style: {
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              background: "transparent",
              color: "inherit",
              border: "1px solid rgba(255,255,255,0.18)",
              cursor: busy ? "not-allowed" : "pointer"
            }
          },
          t("exempt.cancel")
        )
      )
    ) : import_react.default.createElement(
      "div",
      null,
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
      entries.length && stats ? import_react.default.createElement(
        "div",
        { style: { fontSize: "11px", opacity: 0.45, marginTop: "4px" } },
        `adds ${stats.adds} \xB7 revokes ${stats.revokes} \xB7 hits ${stats.session_hits}`
      ) : null
    ),
    note ? import_react.default.createElement(
      "div",
      { style: { fontSize: "12px", marginTop: "8px", color: note.includes(t("sandbox.fail")) ? "#f87171" : "#4ade80" } },
      note
    ) : null
  );
}
function KeyConfigCard(props) {
  const { t } = props;
  const [cfg, setCfg] = (0, import_react.useState)(null);
  const [pw, setPw] = (0, import_react.useState)("");
  const [pw2, setPw2] = (0, import_react.useState)("");
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [msg, setMsg] = (0, import_react.useState)(null);
  const load = (0, import_react.useCallback)(async () => {
    try {
      const r = await fetch(`/api/${PKG}/key`);
      if (!r.ok) throw new Error(String(r.status));
      const d = await r.json();
      setCfg(d.config);
    } catch {
      setCfg(null);
    }
  }, []);
  (0, import_react.useEffect)(() => {
    load();
  }, [load]);
  const submit = async (mode) => {
    setMsg(null);
    if (mode === "password") {
      if (pw.length < 8) {
        setMsg({ ok: false, text: t("key.tooShort") });
        return;
      }
      if (pw !== pw2) {
        setMsg({ ok: false, text: t("key.mismatch") });
        return;
      }
    }
    setBusy(true);
    try {
      const r = await fetch(`/api/${PKG}/key`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode, password: mode === "password" ? pw : void 0, actor: "human:panel" })
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setMsg({ ok: false, text: d.error || t("sandbox.fail") });
        return;
      }
      const count = d.result?.reencrypted ?? 0;
      setMsg({
        ok: true,
        text: mode === "password" ? t("key.rotated", { count }) : t("key.rotatedClear")
      });
      setPw("");
      setPw2("");
      await load();
    } catch (e) {
      setMsg({ ok: false, text: e?.message || t("sandbox.fail") });
    } finally {
      setBusy(false);
    }
  };
  const isPassword = cfg?.mode === "password";
  return import_react.default.createElement(
    "div",
    { style: { ...card, marginTop: "16px" } },
    import_react.default.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } },
      import_react.default.createElement("span", { style: { fontSize: "13px", fontWeight: 600 } }, t("key.title")),
      import_react.default.createElement(
        "span",
        { style: { fontSize: "11px", fontWeight: 600, color: isPassword ? "#c084fc" : "#9ca3af" } },
        isPassword ? t("key.mode.password") : t("key.mode.file")
      )
    ),
    cfg ? import_react.default.createElement(
      "div",
      { style: { fontSize: "11px", opacity: 0.6, marginBottom: "10px" } },
      `${t("key.current")}: ${cfg.effective_source} \xB7 ${t("key.vaultRows")}: ${cfg.vault_rows}` + (isPassword && cfg.password_set ? "" : "")
    ) : import_react.default.createElement("div", { style: dim }, t("exempt.apiDownHint")),
    import_react.default.createElement("div", { style: { ...dim, marginBottom: "10px" } }, t("key.warn")),
    import_react.default.createElement(
      "div",
      { style: { display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" } },
      import_react.default.createElement("input", {
        type: "password",
        value: pw,
        placeholder: t("key.passwordPlaceholder"),
        onChange: (e) => setPw(e.target.value),
        style: {
          flex: "1 1 200px",
          background: "rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "6px",
          color: "inherit",
          padding: "6px 8px",
          fontSize: "12px"
        }
      }),
      import_react.default.createElement("input", {
        type: "password",
        value: pw2,
        placeholder: t("key.confirmPlaceholder"),
        onChange: (e) => setPw2(e.target.value),
        style: {
          flex: "1 1 200px",
          background: "rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "6px",
          color: "inherit",
          padding: "6px 8px",
          fontSize: "12px"
        }
      }),
      import_react.default.createElement(
        "button",
        {
          onClick: () => submit("password"),
          disabled: busy,
          style: {
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            background: "var(--dsh-primary, #3b82f6)",
            color: "#fff",
            border: "none",
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.6 : 1
          }
        },
        busy ? t("key.saving") : t("key.save")
      ),
      isPassword ? import_react.default.createElement(
        "button",
        {
          onClick: () => submit("file"),
          disabled: busy,
          style: {
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            background: "transparent",
            color: "inherit",
            border: "1px solid rgba(255,255,255,0.18)",
            cursor: busy ? "not-allowed" : "pointer"
          }
        },
        t("key.clear")
      ) : null
    ),
    msg ? import_react.default.createElement(
      "div",
      { style: { fontSize: "12px", marginTop: "8px", color: msg.ok ? "#4ade80" : "#f87171" } },
      msg.text,
      msg.ok ? ` \xB7 ${t("key.restartHint")}` : ""
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
    import_react.default.createElement(KeyConfigCard, { t }),
    import_react.default.createElement(DeployCard, { t }),
    import_react.default.createElement(ProtectCard, { t }),
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
  try {
    const locale = ctx.get ? ctx.get("locale") : void 0;
    if (locale && typeof locale.register === "function") locale.register(NS, DICT);
  } catch {
  }
  const t = makeT(ctx);
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
        () => import_react.default.createElement(NotificationBanner, { t })
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
