# Optional visitor statistics

This Worker supplies real server-side unique-IP counts for the existing GitHub Pages site. The site stays on GitHub Pages. These files do not create an account, deploy a service, or enable tracking. The frontend remains disabled until its endpoint is configured.

## Verify locally

Use Node 22.13 or newer with the built-in `node:sqlite` module. Tests need no package installation, credentials, database files, or network access.

```sh
cd ai-safety-index/services/visitor-stats
node --check worker.mjs
node --test worker.test.mjs
```

The tests execute the production SQL against real in-memory SQLite through a small D1-compatible adapter. They cover cross-day deduplication, country consistency, IPv6 normalization, request validation, privacy, and transactional rollback. They do not verify a deployed Cloudflare account or its configuration. `wrangler dev` requests intentionally fail the production edge checks; the local test harness supplies explicit runtime metadata without adding a development bypass to the Worker.

## Deploy when ready

Use your own Cloudflare account and a current Wrangler CLI. Review the account's Worker and D1 limits before enabling the service. Run these commands manually only when deployment is intended.

```sh
cd ai-safety-index/services/visitor-stats
npx wrangler login
npx wrangler d1 create ai-safety-visitor-stats
```

Copy the returned database ID into `wrangler.jsonc`. Set `ALLOWED_ORIGINS` to the exact HTTPS origin of the published site, without a path or trailing slash. Multiple origins may be comma-separated. Keep local preview origins excluded. Then create the schema and deploy.

```sh
npx wrangler d1 execute ai-safety-visitor-stats --remote --file=schema.sql
npx wrangler deploy
npx wrangler secret put IP_HASH_SECRET
```

At the secret prompt, provide a newly generated random secret with at least 32 bytes of entropy, for example a 64-character hexadecimal value from a password manager. Keep a secure backup. Do not place it in source code, Wrangler `vars`, frontend configuration, or Git. The first deployment returns `503` until this secret exists. `wrangler secret put` creates and deploys a new Worker version, as described in [Cloudflare's secrets documentation](https://developers.cloudflare.com/workers/configuration/secrets/).

Use the HTTPS `workers.dev` URL printed by Wrangler. Keep this endpoint directly on Cloudflare; do not place another Worker or proxy in front of it. For a custom domain, leave Pseudo IPv4 set to Off or Add Header and do not strip visitor IP headers. The service deliberately rejects requests missing trusted edge metadata or carrying Worker-subrequest indicators. Cloudflare documents the relevant [client IP header and subrequest behavior](https://developers.cloudflare.com/fundamentals/reference/http-headers/).

Check the read endpoint without adding a visit, replacing the example hostname with the deployed hostname.

```sh
curl -i -H 'Origin: https://gabrygao.github.io' \
  'https://ai-safety-visitor-stats.YOUR-SUBDOMAIN.workers.dev/stats'
```

The response should be JSON with zero counts and `since: null` before the first accepted visit. Set `endpoint` in `ai-safety-index/visitor-stats-config.js` to this HTTPS base URL, without `/stats` or `/visit`, and publish that frontend change. The frontend excludes local previews and skips recording when Do Not Track or Global Privacy Control is enabled. Setting the endpoint back to an empty string disables frontend requests; it does not delete existing server records.

## API and counting rules

Both routes require the exact allowed `Origin`, HTTPS, the Cloudflare runtime's `request.cf` metadata, and a valid edge-provided `CF-Connecting-IP`. CORS is restricted to the configured origins without credentials. No cookie or browser-generated visitor identifier is used. `X-Forwarded-For`, `X-Real-IP`, request-body IP fields, and country headers do not select the visitor identity or location.

`POST /visit` accepts JSON such as `{"path":"/ai-safety-index/index.html"}`. Only the 14 existing page paths and `/ai-safety-index/` are accepted. Queries, fragments, unknown paths, non-JSON bodies, and bodies over 512 bytes are rejected. Successful records and excluded bots return `204`; known bots are filtered by user agent and Cloudflare's verified-bot flag when available. The path is validated but not stored.

`GET /stats` returns the following shape. `?days=1` through `?days=90` are supported; the default is 30 UTC calendar dates including today. Dates are inclusive, not a rolling number of hours.

```json
{
  "since": null,
  "updated_at": "2026-11-10T12:00:00.000Z",
  "period": {"from": "2026-10-12", "to": "2026-11-10"},
  "today_unique_ips": 0,
  "period_unique_ips": 0,
  "total_unique_ips": 0,
  "countries": []
}
```

`since` is the UTC date of the earliest accepted visit, or `null` for an empty database. `updated_at` is response generation time. Each country entry is `{"code":"US","unique_ips":1}`. The country comes from Cloudflare's IP geolocation, and unrecognized values become `XX`. Each IP is assigned to its most recently observed country within the selected period, so country counts sum exactly to `period_unique_ips`. Period counts use distinct IP digests across the full window, never a sum of daily unique counts. Today, period, and lifetime counts are read in one database batch.

IPv4 and IPv6 addresses are canonicalized before HMAC-SHA-256 with `IP_HASH_SECRET`. Only the digest, first/last timestamps, daily dates, and validated country codes enter D1. Daily rows are removed after 90 UTC calendar dates by the configured cron; lifetime digests remain to preserve true lifetime deduplication. Both tables are written in one transaction using [D1 batch operations](https://developers.cloudflare.com/d1/worker-api/d1-database/). Keep the secret stable for this database. Changing it makes returning IPs appear new and requires an intentional reset or migration of the statistics.

IP counts measure network addresses, not people. Shared campus networks and NAT combine people, while dynamic addresses, IPv6 privacy addresses, and VPNs can split one person's visits. Geolocation describes an IP's inferred country. Ad blockers, disabled JavaScript, privacy preferences, failed requests, and some bots affect coverage. Origin checks are a browser access boundary, not authentication; a scripted client can imitate a browser request, so these counts are not fraud-proof. The Worker writes no raw IP or request logs, and Worker observability is disabled in the example configuration. Cloudflare still processes incoming network requests as the hosting provider.
