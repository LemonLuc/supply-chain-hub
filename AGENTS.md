# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js App Router project written in TypeScript. Routes and UI live in `app/`, with the main interface in `app/supply-chain-app.tsx` and chat endpoint in `app/api/chat/route.ts`. Shared logic, demo data, authorization, and chat helpers live in `lib/`. Static assets are under `public/`, currently `public/avatars/`. Tests are colocated as `*.test.ts` or `*.test.tsx`. Design notes and plans are kept in `docs/superpowers/`; demo collateral is in `talking-tracks-30min.md` and `executive-presentation.md`.

## Build, Test, and Development Commands

- `npm run dev`: start the local Next.js development server.
- `npm test`: run the Vitest suite once.
- `npm run typecheck`: run `tsc --noEmit` with strict TypeScript settings.
- `npm run build`: build the Next.js app.
- `npm run preview`: build with OpenNext and preview in the Cloudflare Workers runtime.
- `npm run deploy`: build, sanitize generated environment fallbacks, and deploy with Wrangler.

## SDKs, APIs, and Packages

Core packages are Next.js, React, TypeScript, and the Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`). `app/api/chat/route.ts` uses the OpenAI Responses API when `OPENAI_API_KEY` is set, with deterministic demo streams as fallback. `app/api/actions/route.ts` uses the OpenAI Agents SDK (`@openai/agents`) for action orchestration, local tool execution, approval handoff setup, and trace flushing; deterministic action results remain the fallback when no live API key is configured. Markdown uses `react-markdown` and `remark-gfm`; icons use `lucide-react`. Cloudflare deployment uses `@opennextjs/cloudflare`, `wrangler`, `open-next.config.ts`, and `wrangler.jsonc`.

## Coding Style & Naming Conventions

Use strict TypeScript and React function components. Follow existing two-space indentation, double quotes, multiline trailing commas, and `@/` root imports. Name components in `PascalCase`, helpers and variables in `camelCase`, and test files after the unit under test, such as `permissions.test.ts`. Keep trust decisions in `lib/auth.ts`, `lib/permissions.ts`, or API routes.

## Testing Guidelines

Vitest is configured with `jsdom`, globals, React Testing Library, and `vitest.setup.ts`. Add or update colocated tests for permissions, chat routing, UI workflows, and API changes. Prefer user-visible Testing Library queries. Run `npm test` and `npm run typecheck` before submitting; run `npm run build` when changing routing, deployment config, or server/client boundaries.

## Commit & Pull Request Guidelines

Recent commits use short imperative summaries, for example `Refactor supply chain hub data flows and UI`. Keep subjects specific and under roughly 72 characters. Pull requests should include a problem/solution summary, tests run, linked issue or plan, and screenshots for visible UI changes. Call out permissions, environment, or Cloudflare deployment changes.

## Security & Configuration Tips

Copy `.env.example` to `.env.local`. Never commit real secrets; set production `OPENAI_API_KEY` through Wrangler or the Cloudflare dashboard. Treat browser-selected demo roles as presentation-only and keep production identity and authorization server-side.
