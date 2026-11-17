# Docker security: network segmentation (OWASP Docker D03)

This documents how the optional self-hosted stack (`docker-compose.yml`) follows
[OWASP Docker Security D03: Network Segmentation and Firewalling](https://github.com/OWASP/Docker-Security/blob/main/D03%20-%20Network%20Segmentation%20and%20Firewalling.md).
GitHub Pages does not use any of this; it serves only the static `dist/` folder.

## Layout

```
internet --> [web] --- app (internal) --- [api] --- data (internal) --- [mongo]
```

| Network  | Members    | Internal? | Purpose                                       |
| -------- | ---------- | --------- | --------------------------------------------- |
| `public` | web        | no        | The only network with a route out; port 8080  |
| `app`    | web, api   | **yes**   | nginx to API. No internet egress              |
| `data`   | api, mongo | **yes**   | API to database. No egress; web cannot see it |

## What D03 asks for, and what is done

| D03 guidance                                                 | Control in this repo                                                                                                                                                                                                        |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Don't use one flat network; segment services                 | Three networks. Each container joins only the networks it needs.                                                                                                                                                            |
| Allow-list communication only; define paths in advance       | Allowed paths: web to api (`app`), api to mongo (`data`). Nothing else shares a network.                                                                                                                                    |
| Expose only the ports that are needed                        | Only `web` publishes a port, bound to `127.0.0.1` by default (`WEB_BIND`). `api` and `mongo` publish none.                                                                                                                  |
| Classic services (databases) not exposed in the LAN          | MongoDB has no `ports:` and sits on an internal network.                                                                                                                                                                    |
| Never expose management interfaces/APIs                      | The API's write route (`PUT /api/content/:key`) is not proxied by nginx. nginx exposes `GET /api/content` only; everything else under `/api/` is 404. Admin edits run inside the API container via `server/put-content.js`. |
| Proper egress policy; restrict outbound traffic              | `app` and `data` are `internal: true`, so `api` and `mongo` cannot reach the internet.                                                                                                                                      |
| Treat each permitted container-to-container path as a threat | Paths are minimal. nginx also rate-limits (`limit_req`, `limit_conn`) and caps request size and timeouts.                                                                                                                   |
| Don't share a network between tenants                        | Single tenant; the stack has its own networks, nothing is joined to the default bridge.                                                                                                                                     |

Related hardening in the same files (not D03, but it limits what a compromised container can do):
non-root users, `read_only` root filesystems, `cap_drop: [ALL]` on web and api,
`no-new-privileges`, secrets only through `.env` (git-ignored).

## Verify it (the D03 "verification" steps)

With the stack running:

```bash
./scripts/verify-network.sh
```

It checks that `app` and `data` are internal, that only `web` publishes a port, that `api` and
`mongo` cannot reach the internet, that `web` cannot reach `mongo`, and that writes to the API
are blocked at nginx. It follows D03's advice to assume a container is compromised and test
what it can reach.

By hand, as D03 describes:

```bash
# list and inspect networks
for n in $(docker network ls --format '{{.ID}}'); do docker inspect "$n"; done

# what can the (assumed compromised) api container reach?
docker compose exec api sh -c 'nc -zv -w 3 mongo 27017; nc -zv -w 3 1.1.1.1 443'

# scan from another machine on your LAN; expect only 8080 (or nothing with WEB_BIND=127.0.0.1)
nmap -sT -p1-65535 <host-ip>
```

## Limits and notes

- Written and syntax-checked (`docker compose config`) but **not run against a live Docker
  daemon** when it was prepared. Run `verify-network.sh` on your machine and treat any FAIL as a bug.
- `cap_drop: [ALL]` is not applied to the `mongo` image: its entrypoint needs a few capabilities
  to fix volume ownership, and that was not tested. Leave it alone unless you test it.
- Internal Docker networks block egress, but Docker does not give you a host firewall. If the
  machine has other services, add host rules in the `DOCKER-USER` iptables chain and keep
  `WEB_BIND=127.0.0.1` behind a TLS reverse proxy (for example Caddy).
- Never expose the Docker socket or the Docker daemon's TCP port. Neither is used here.
