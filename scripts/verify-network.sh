#!/usr/bin/env bash
# Verifies the network segmentation described in docs/DOCKER-SECURITY.md (OWASP Docker D03).
# Run from the repo root while the stack is up:  ./scripts/verify-network.sh
set -u

pass=0; fail=0
ok()   { echo "  PASS  $1"; pass=$((pass+1)); }
bad()  { echo "  FAIL  $1"; fail=$((fail+1)); }
# expect <description> <exit-code-wanted: 0|nonzero> <command...>
expect() {
  local desc=$1 want=$2; shift 2
  "$@" >/dev/null 2>&1; local rc=$?
  if { [ "$want" = 0 ] && [ $rc -eq 0 ]; } || { [ "$want" = nonzero ] && [ $rc -ne 0 ]; }; then ok "$desc"; else bad "$desc"; fi
}

DC="docker compose"
project=$($DC config --format json 2>/dev/null | sed -n 's/.*"name": *"\([^"]*\)".*/\1/p' | head -1)
project=${project:-portfolio}

echo "1) Networks: app and data must be internal (no route to the outside)"
for n in app data; do
  internal=$(docker network inspect "${project}_${n}" --format '{{.Internal}}' 2>/dev/null)
  [ "$internal" = "true" ] && ok "network ${n} is internal" || bad "network ${n} is internal (got: ${internal:-missing})"
done

echo "2) Published ports: only web:8080 may be published"
published=$($DC ps --format '{{.Service}} {{.Publishers}}' | grep -E '[0-9]+->[0-9]+' || true)
echo "$published" | sed 's/^/        /'
echo "$published" | grep -qE '^(api|mongo) ' && bad "api or mongo publishes a port" || ok "api and mongo publish no ports"

echo "3) From inside containers (assume the container is compromised)"
expect "api can reach mongo:27017"                     0       $DC exec -T api  sh -c 'nc -z -w 3 mongo 27017'
expect "web can reach api:3000"                        0       $DC exec -T web  sh -c 'nc -z -w 3 api 3000'
expect "web can NOT resolve or reach mongo"            nonzero $DC exec -T web  sh -c 'nc -z -w 3 mongo 27017'
expect "api has NO internet access"                    nonzero $DC exec -T api  sh -c 'nc -z -w 3 1.1.1.1 443'
expect "mongo has NO internet access"                  nonzero $DC exec -T mongo sh -c 'timeout 3 bash -c "echo > /dev/tcp/1.1.1.1/443"'

echo "4) Public API surface (through nginx): GET /api/content only"
base="http://127.0.0.1:${WEB_PORT:-8080}"
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
[ "$(code "$base/api/content")" = 200 ]                          && ok "GET /api/content -> 200"            || bad "GET /api/content -> 200"
[ "$(code -X PUT "$base/api/content/who" -d '{}')" != 200 ]      && ok "PUT /api/content/who is blocked"   || bad "PUT /api/content/who is blocked"
[ "$(code "$base/api/health")" = 404 ]                           && ok "GET /api/health -> 404 (not public)" || bad "GET /api/health -> 404"

echo
echo "Result: ${pass} passed, ${fail} failed"
echo "Also scan from another machine on your LAN:  nmap -sT -p1-65535 <host-ip>   (only 8080, or nothing if WEB_BIND=127.0.0.1)"
[ "$fail" -eq 0 ]
