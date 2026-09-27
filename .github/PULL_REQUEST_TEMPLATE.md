## What does this change?

<!-- One or two sentences on the problem and how this PR addresses it. -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Data correction or dataset change
- [ ] Documentation
- [ ] Refactor or maintenance (no behaviour change)

## How was it verified?

<!--
Check what you ran, and describe any manual testing. Reviewers rely on this to
know what is already covered.
-->

- [ ] `pnpm format:check`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm build`
- [ ] Manual check on `pnpm dev` or `pnpm preview` (describe below)

<!-- Details of manual verification, and any smoke checks from docs/cloudflare-preview.md -->

## Checklist

- [ ] Scope is focused: this PR addresses one concern
- [ ] New user-facing strings were added to `lib/i18n.ts` in **both** English and Malay
- [ ] Client components do not import `lib/d1.ts` or `lib/db.ts` directly
- [ ] Market writes keep `market_days` in sync with `schedule`
- [ ] Schema changes are a new file in `d1/migrations/` (no applied migration edited)
- [ ] No secrets or personal data are included (`.env`, `.dev.vars`, `docs/archive/supabase/`)
- [ ] `README.md` / `AGENTS.md` / `docs/` updated if behaviour or setup changed
- [ ] API changes are additive, or a new `/api/v2` was added instead of breaking v1

## Related issues

<!-- e.g. Closes #123 -->
