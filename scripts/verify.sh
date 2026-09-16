#!/usr/bin/env bash
# verify.sh — smoke-test the DSH routes registered by dsh-privacy-guard.
#
#   ./scripts/verify.sh [base-url]        # default http://127.0.0.1:3080
#
# Every route is served by the DSH web server's Host half, so DSH must have been
# restarted after installing the plugin. Before that restart these return 401/404.
set -uo pipefail

BASE="${1:-http://127.0.0.1:3080}"
PASS=0
FAIL=0

check() {
  local name="$1" path="$2" expect="$3" method="${4:-GET}" body="${5:-}"
  local args=(-sS --noproxy '*' --max-time 10 -o /tmp/verify-body.json -w '%{http_code}' -X "$method" "$BASE$path")
  [ -n "$body" ] && args+=(-H 'content-type: application/json' -d "$body")
  local code
  code=$(curl "${args[@]}" 2>/dev/null || echo "000")
  if [ "$code" = "$expect" ]; then
    printf '  \033[32mPASS\033[0m  %-34s %s -> %s\n' "$name" "$path" "$code"
    PASS=$((PASS + 1))
  else
    printf '  \033[31mFAIL\033[0m  %-34s %s -> %s (want %s)\n' "$name" "$path" "$code" "$expect"
    head -c 200 /tmp/verify-body.json 2>/dev/null; echo
    FAIL=$((FAIL + 1))
  fi
}

echo "verifying dsh-privacy-guard routes on $BASE"
check "status"            "/api/dsh-privacy-guard/status"            200
check "health"            "/api/dsh-privacy-guard/health"            200
check "exemptions"        "/api/dsh-privacy-guard/exemptions"        200
check "exemptions/audit"  "/api/dsh-privacy-guard/exemptions/audit"  200
check "dry-run"           "/api/dsh-privacy-guard/dry-run"           200 POST \
  '{"text":"key = \"sk-proj-abcdefghijklmnopqrstuvwxyz123456\""}'

echo
echo "passed $PASS, failed $FAIL"
[ "$FAIL" -eq 0 ] || {
  cat <<'EOF'
hint: DSH authenticates every /api/* route, so an unauthenticated probe cannot
      distinguish "plugin not loaded" from "login required" over HTTP.
      Confirm the plugin actually loaded by:
        1. browser  : 设置 → 隐私脱密 (Privacy Guard) 面板是否存在
        2. host log : journalctl -u deepseek-harness.service | grep -i privacy
      If the panel is missing, DSH has not reloaded the profile yet:
        systemctl restart deepseek-harness.service
EOF
  exit 1
}
