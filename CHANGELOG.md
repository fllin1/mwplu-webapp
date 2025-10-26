# Changelog

## 2025-06-02
- 2025-06-02T13:41:07+02:00 (Florent) ded9d0d - Initial commit
- 2025-06-02T13:23:02+00:00 (Florent) dc05ad7 - reafactor: 1.1  Project Setup
- 2025-06-02T13:48:39+00:00 (Florent) c2c2c32 - refactor: 1.2 Project Structure Setup
- 2025-06-02T15:43:15+00:00 (Florent) 82a43e7 - refactor: 1.3 Core Infrastructure

## 2025-06-08
- 2025-06-08T15:08:02+02:00 (fllin1) bc0cd77 - chore : enhancing refactor plan, backup before Phase 2

## 2025-06-11
- 2025-06-11T18:46:07+02:00 (fllin1) 9e3ec0b - refactor: 2.1, 2.2, 2.3, 2.5, 3.1, 3.2 Authentication system, Google Analytics, Layout Components. TODO : verify the auth and google analytics; improve the header display and components; add cookies banner
- 2025-06-11T19:46:02+02:00 (fllin1) 08a5eff - refactor: 4.1 Adding the city feature + Cookie Banner TODO : Verify the authentification
- 2025-06-11T19:46:45+02:00 (Florent) 7bcf18f - chore: Delete .env
- 2025-06-11T22:50:35+02:00 (fllin1) e52ec2d - chore: Google auth form functionnal, error messages color corrected, optionnal phone number added

## 2025-06-23
- 2025-06-23T22:23:14+02:00 (fllin1) 8724a0e - fix: auth pages UI, cleaned headers

## 2025-06-25
- 2025-06-25T21:23:03+02:00 (fllin1) 727de54 - chore: style improvement, photos added in about page

## 2025-06-28
- 2025-06-28T18:49:53+02:00 (fllin1) 967ab79 - feat[donation]: added the donation system (need to assert that it works), improve elements of the UI (policies pages, corrected modal, coming soon page), started the refactoring phase 4.2 (in progress...)
- 2025-06-28T21:35:33+02:00 (fllin1) 94665e2 - fix: improved breadcrumbs, refactor of the plu-synthesis pages' code + routing

## 2025-06-29
- 2025-06-29T12:18:09+02:00 (fllin1) 281bf7e - fix: improve authentication UX and error handling

## 2025-07-01
- 2025-07-01T21:47:19+02:00 (fllin1) 6fa868e - chore: UI and UX changes

## 2025-07-05
- 2025-07-05T21:17:09+02:00 (fllin1) 038178b - fix: comments and ratings finally working, with soft delete feature for comments + tracking of downloads

## 2025-07-27
- 2025-07-27T15:33:13+02:00 (fllin1) a379fd5 - fix: analytics, cookie banner still not operationnal on production (seems to work in dev environment)

## 2025-08-02
- 2025-08-02T21:33:42+02:00 (fllin1) 3879018 - fix[comments]: fixed soft delete, replaced by hard delete + backup, fixed issue where comments were not actually deleted.

## 2025-08-03
- 2025-08-03T17:03:18+02:00 (fllin1) 527cc88 - feat[dashboard+contact] : contact form connected to Discord channel + dashboard operational with history

## 2025-08-09
- 2025-08-09T15:42:29+02:00 (fllin1) 1afd275 - chore[cursor_rules]: Updated cursor rules w/ GPT5
- 2025-08-09T15:44:07+02:00 (fllin1) 88f3c96 - Merge branch 'main' of https://github.com/fllin1/mwplu_webapp
- 2025-08-09T22:57:07+02:00 (fllin1) 1396354 - feat[search-address]: added search feature on the home page.

## 2025-08-11
- 2025-08-11T11:35:40+02:00 (fllin1) 8b0665e - fix[cookie]: renaming cookie banner to privacy banner, bypassing Brave Shield blocker.

## 2025-08-12
- 2025-08-12T21:40:16+01:00 (fllin1) 8c6b083 - fix[search]: link the exact source to an approximation if it doesn't exist in the Database
- 2025-08-12T22:43:00+01:00 (fllin1) e2625fc - feat[dark-mode]: Adding the dark mode, with simple toogle in header, addaptative X and MWPLU logos.

## 2025-08-13
- 2025-08-13T10:22:14+01:00 (fllin1) 9c9a7a3 - feat[download-limit]: adding a download limit logic with supabase download credit

## 2025-08-19
- 2025-08-19T22:58:17+02:00 (fllin1) 742fa3d - feat[auth]: Reset password and signup confirmation feature functional
 
## 2025-10-25
- feat[chat]: migrate to conversations model; update webhook payload; add unit tests for chat store and `useAiChat`.
- fix[chat]: n8n webhook now targets `public.chat_conversations` (resolved "relation does not exist" error); single fetch-based path eliminates double webhook POSTs.
- chore[chat]: add webhook response logging; implement NDJSON streaming with temporary assistant message and sanitized Markdown in `AiChatMessage.vue`; add store helpers and tests.
- ui[chat]: smoother streaming UX (typing indicator/auto-scroll); hide inline chat bar while popup is open.

## 2025-10-26

- debug[chat]: comprehensive webhook response logging in `useAiChat.js` to inspect payload, headers, and parsed data.
- fix[chat]: NDJSON fallback parser for newline-delimited JSON responses; updated tests accordingly.
- feat[chat]: streaming effects via `useTextStream.js` and `ResponseStream.vue`; keep markdown rendering for completed messages; added tests.
- refactor[chat]: removed NDJSON streaming; switched to simple JSON with typewriter effect for newly received messages; introduced `isNewlyReceived`; updated tests.
- fix[chat]: resolved typewriter animation bug by correctly unwrapping reactive refs in `useTextStream.js`.
- docs[chat]: added `N8N_WEBHOOK_STREAMING_SETUP.md`; updated architecture and features status.
- docs[supabase]: updated architecture Supabase section to reflect current DB (chat tables, RLS, comments hard-delete with backup).
 - docs[supabase]: documented new analytics schema, materialized views, triggers, helper views, and pg_cron jobs in `.cursor/rules/architecture.mdc`.
- db[analytics]: created `analytics` schema on Supabase (project `mwplu`, eu-west-3) with core tables `chat_events`, `user_daily_usage`, `user_monthly_usage`, `document_usage`, `system_daily_metrics`; added indexes and RLS policies (including admin overrides via `public.profiles.is_admin`).
- db[analytics]: added materialized views `mv_user_monthly_summary` and `mv_document_popularity` with supporting indexes and `analytics.refresh_all_views()` function.
- db[analytics]: added triggers `trigger_update_daily_usage` and `trigger_update_monthly_usage` to maintain aggregates; created helper views `v_user_current_month` and `v_user_recent_activity`.
- ops[cron]: ensured `pg_cron` extension exists; scheduled hourly refresh for analytics materialized views and weekly cleanup of old events (idempotent job creation).
 - feat[chat]: include `message_id` (Supabase `chat_messages.id`) in webhook payload from `useAiChat.sendMessage`; added unit test asserting presence of `message_id`.

