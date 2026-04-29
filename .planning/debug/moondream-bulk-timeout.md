---
status: diagnosed
trigger: "Intermittent 'The request timed out' errors during bulk alt text generation"
created: 2026-04-08T00:00:00Z
updated: 2026-04-08T00:00:00Z
---

## Current Focus

hypothesis: wp_remote_post timeout of 15s is too short; when the URL-based API call fails (400/422 access_error), a second full API call is made via base64, doubling the latency window within the same 15s budget — causing intermittent timeouts under shared hosting conditions
test: trace the double-request fallback path in class-api.php
expecting: confirmed double-request latency as root cause
next_action: diagnosed — no further action (find_root_cause_only mode)

## Symptoms

expected: Bulk alt text generation completes successfully for all images
actual: Intermittent "The request timed out" errors; some images fail, some succeed
errors: "The request timed out"
reproduction: Intermittent — happens during bulk jobs, not consistently reproducible
started: Broke recently — was working before

## Eliminated

- hypothesis: Concurrent requests causing rate limiting or resource exhaustion
  evidence: moondream-bulk.js processSequentially() at line 341 uses async/await in a for-loop — images are processed strictly one at a time, not in parallel. No concurrency issue possible.
  timestamp: 2026-04-08

- hypothesis: Client-side JS fetch timeout
  evidence: moondream-bulk.js processOne() at line 310 uses a plain fetch() with no timeout option set. No AbortController or signal. The JS side has no timeout — it waits indefinitely for the PHP response.
  timestamp: 2026-04-08

- hypothesis: Retry handler retries the API call directly
  evidence: moondream-bulk.js line 166 — the retry button calls processOne(row), which re-fires the WordPress AJAX action (moondream_generate_bulk). It does NOT retry the Moondream API call directly; it re-runs the full PHP handler. So a retry will hit the same double-request path if the first URL attempt gets a 400/422.
  timestamp: 2026-04-08

## Evidence

- timestamp: 2026-04-08
  checked: class-api.php generate_alt_text() lines 46-51
  found: First attempt sends image_url to API. If response is WP_Error with code 'access_error' (triggered by HTTP 400 or 422 — see parse_response line 316), it immediately falls back to api_request_base64_from_url(). The base64 path fetches the image via wp_remote_get (timeout 15s) THEN makes a second wp_remote_post to the API (timeout 15s again). Total possible latency: 30s+ across two sequential network calls.
  implication: Under any condition that triggers a 400/422 on the first call, the handler makes two full external requests before returning.

- timestamp: 2026-04-08
  checked: class-api.php api_request() lines 215-225
  found: wp_remote_post timeout is hardcoded at 15 seconds. No retry logic within api_request() itself.
  implication: On shared hosting (Krystal), PHP execution time limits and network latency variance mean 15s can be marginal even for a single call, and definitely insufficient if two calls are made.

- timestamp: 2026-04-08
  checked: class-api.php parse_response() lines 289-292
  found: "The request timed out" string is produced when wp_remote_post returns a WP_Error whose message contains "timed out". This is a WordPress HTTP API timeout, not a Moondream API-level timeout. Confirms the timeout occurs server-side in PHP.
  implication: The error the user sees is definitively a PHP-side wp_remote_post timeout, not a JS fetch timeout or an API-side response.

- timestamp: 2026-04-08
  checked: class-api.php api_request_base64_from_url() lines 237-273
  found: wp_remote_get for the image also uses timeout 15. If the image fetch itself is slow (e.g., large image despite small file size, or shared host outbound connection queuing), this consumes time before the second API call even starts.
  implication: Three sequential network operations are possible in one AJAX request: (1) wp_remote_post URL attempt, (2) wp_remote_get image fetch, (3) wp_remote_post base64 attempt. All under a single 15s per-call budget but with additive wall-clock time.

## Resolution

root_cause: The "The request timed out" error is a PHP wp_remote_post timeout (hardcoded at 15s in class-api.php:218). The intermittency is explained by a silent fallback path: when the Moondream API returns HTTP 400 or 422 on the image_url attempt, parse_response() returns an 'access_error' WP_Error, triggering a second full API call via base64 (api_request_base64_from_url). This second path makes up to two additional wp_remote_* calls (image fetch + API post), each with their own 15s timeout. On Krystal shared hosting, cumulative network latency across these calls is intermittently exceeding the timeout — some images succeed on the first URL attempt (fast path), others hit the fallback (slow path) and time out.

fix: Increase wp_remote_post timeout in api_request() (class-api.php line 218) from 15 to at least 30 seconds. Optionally also increase the wp_remote_get timeout in api_request_base64_from_url() (line 239) from 15 to 20 seconds. No structural change needed — the fallback path is correct behaviour, just under-budgeted for time.

verification: not yet verified (diagnose-only mode)

files_changed: []
