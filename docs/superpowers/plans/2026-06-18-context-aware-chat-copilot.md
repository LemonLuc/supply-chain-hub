# Context-Aware Chat Copilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the static supply-chain demo into a Next.js app with a context-aware OpenAI/Vercel AI SDK chat surface that works in mock mode until a real API key is supplied.

**Architecture:** Keep the existing dashboard behavior but move data and rendering into focused React modules. Put the OpenAI/Vercel AI SDK integration behind `app/api/chat/route.ts`, with deterministic mock streaming when `OPENAI_API_KEY` is missing or sample-valued.

**Tech Stack:** Next.js App Router, React, TypeScript, Vercel AI SDK, Vitest, Testing Library.

---

### Task 1: Project Scaffolding And Test Harness

**Files:**
- Create: `package.json`
- Create: `next.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: Write scaffolding files**

Create a Next.js package with scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "@ai-sdk/openai": "latest",
    "ai": "latest",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "@vitejs/plugin-react": "latest",
    "typescript": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`

Expected: dependency tree installs and `package-lock.json` is created.

- [ ] **Step 3: Run baseline tests**

Run: `npm test`

Expected: Vitest exits cleanly with no tests or with any initial scaffold test passing.

### Task 2: Demo Data And Context Builder

**Files:**
- Create: `lib/demo-data.ts`
- Create: `lib/context.ts`
- Create: `lib/context.test.ts`

- [ ] **Step 1: Write failing context tests**

Test that `buildAppContext("risks")` includes the workflow, visible answer, suppliers, highlights, and metrics. Test that an invalid key falls back to `risks`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/context.test.ts`

Expected: FAIL because `lib/context.ts` does not exist yet.

- [ ] **Step 3: Implement data and context builder**

Move the current supplier/workflow objects into `lib/demo-data.ts`. Add `buildAppContext(workflowKey)` in `lib/context.ts`, returning a serializable context payload for chat.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/context.test.ts`

Expected: PASS.

### Task 3: Chat API Route

**Files:**
- Create: `lib/chat-options.ts`
- Create: `lib/mock-chat.ts`
- Create: `lib/mock-chat.test.ts`
- Create: `app/api/chat/route.ts`

- [ ] **Step 1: Write failing mock chat tests**

Test that `isMockApiKey()` returns true for missing/sample keys and false for a real-looking key. Test that `buildMockReply()` mentions the selected workflow, model, thinking level, and a highlighted supplier.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/mock-chat.test.ts`

Expected: FAIL because `lib/mock-chat.ts` does not exist yet.

- [ ] **Step 3: Implement chat options and mock chat helpers**

Add allowed model and thinking values. Add helpers to sanitize incoming selections and produce a deterministic mock assistant response grounded in `appContext`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/mock-chat.test.ts`

Expected: PASS.

- [ ] **Step 5: Implement `/api/chat`**

Use Vercel AI SDK for real mode and a streamed `Response` for mock mode. Validate `model`, `thinking`, and `appContext` before use.

### Task 4: React Dashboard And Chat UI

**Files:**
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `components/CopilotChat.tsx`
- Create: `components/DemoDashboard.tsx`
- Create: `app/globals.css`
- Delete: `index.html`
- Delete: `styles.css`
- Delete: `app.js`

- [ ] **Step 1: Write failing UI tests**

Add a test that `DemoDashboard` renders the selected workflow and that `CopilotChat` exposes model and thinking selectors.

- [ ] **Step 2: Run UI tests to verify they fail**

Run: `npm test -- components`

Expected: FAIL because the React components do not exist yet.

- [ ] **Step 3: Implement layout, dashboard, chat, and CSS**

Port the existing HTML/CSS behavior into React components. Place `CopilotChat` above the answer grid. Use `useChat` against `/api/chat`, sending `model`, `thinking`, and `buildAppContext(selectedWorkflow)`.

- [ ] **Step 4: Run UI tests to verify they pass**

Run: `npm test -- components`

Expected: PASS.

### Task 5: Documentation And Final Verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README**

Document `npm install`, `npm run dev`, `.env.local`, `OPENAI_API_KEY`, mock mode, and the model/thinking selectors.

- [ ] **Step 2: Run full test suite**

Run: `npm test`

Expected: PASS.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 4: Start dev server**

Run: `npm run dev`

Expected: local Next.js URL is available.

- [ ] **Step 5: Browser smoke test**

Verify the page loads, the chat panel is at the top, selectors render, workflow changes update the dashboard, and mock chat responds without a real API key.

## Self-Review

The plan covers project migration, context-aware payload construction, mock and real chat paths, UI controls, documentation, and verification. No placeholder steps remain. Types introduced in tests match implementation file names and expected helper names.
