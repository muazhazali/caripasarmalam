# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Report privately
using GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability):
go to the repository's **Security** tab and choose **Report a vulnerability**.

If you cannot use that, email the maintainer listed in the repository profile.
Include what you found, how to reproduce it, and the impact you think it has.

Please allow time for a fix before public disclosure. We will credit reporters in
the fix unless you prefer otherwise.

## Supported versions

This project deploys continuously from `main`; only the latest state of `main` is
supported. There are no maintained release branches.

## Scope

Useful reports include, but are not limited to:

- Authentication flaws in the admin session (JWT verification, cookie handling,
  password comparison)
- Access-control gaps: reaching admin actions or `/admin/*` without a session, or
  reading suggestion data (`submitter_email`) without authorization
- Injection through query parameters, including the public API filters and the
  public suggestion form
- Rate-limiting bypasses that enable abuse of the API, the suggestion form, or
  login
- Exposure of secrets or personal data in the repository or in responses

## Security model (what is by design)

Understanding the intended design saves time for both sides:

- **Public reads are open by design.** `/api/v1/*` is a keyless, CORS-`*` read
  API. Missing API keys are not a vulnerability.
- **Single admin account.** There is one admin identity, identified by
  `ADMIN_PASSWORD`, protected by a rate-limited login and an HttpOnly `admin_session`
  JWT. There are no user accounts or roles.
- **Enforcement lives in code, not the database.** D1 has no row-level security.
  Reads happen server-side through the D1 binding, and writes exist only in server
  actions guarded by `requireAdmin()`. Please report anything that breaks this
  boundary.
- **`market_suggestions` is private.** The table holds submitter emails and has no
  public read path. Any route, action, or API response that exposes it is a bug.

## Handling secrets

Never commit real credentials. `ADMIN_PASSWORD` and `JWT_SECRET` belong in `.env`
locally (gitignored) and in Worker secrets in production
(`wrangler secret put`). If you discover a committed secret, report it privately
as above rather than opening a pull request that removes it, and rotate the value.
