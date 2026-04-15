# Improvement Suggestions

## High Impact

- **Email notifications for suggestions** — Send confirmation email on submit, approval/rejection email with reason. Use Resend (free tier: 3k emails/month). Also notify admin when a new suggestion arrives instead of relying on the badge count.

- **Global error boundary** — Add `app/error.tsx` for graceful error handling. Currently falls back to Next.js default error page.

## Medium Impact

- **Real OG images for social sharing** — `app/markets/[id]/page.tsx` and `app/markets/page.tsx` use `/placeholder.jpg`. Use Next.js dynamic OG image generation (`app/opengraph-image.tsx`) so market links shared on WhatsApp/Twitter show a real image.

- **Better loading states** — `app/loading.tsx` returns `null`. Add skeleton UI for smoother perceived performance on slow connections.

- **Market photos** — No market has a photo. Add a Google Street View thumbnail or a community-submitted photo field to the market detail page.

- **Shareable filters / URL-synced search** — Homepage filters (state, day, amenities) are not reflected in the URL. Users can't share a filtered view like "all Saturday markets in Selangor".

## Lower Impact

- **Suggestion status page** — Add `/suggest/status?email=xxx` so submitters can check the status of their suggestions by entering their email.

- **Admin bulk actions** — Add "select all + bulk approve/reject" for when suggestions pile up.

- **Rate limiting with Redis** — Current in-process rate limiter resets on every deploy/restart and won't work on serverless (Vercel). Replace with Upstash Redis (free tier, ~10 min setup).

- **Contributor credit** — When an admin approves a suggestion, credit the submitter's name/email on the market detail page or a contributors list.
