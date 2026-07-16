# GPT-5.6 Model Selection Design

## Goal

Upgrade Supply Chain Hub so its active OpenAI model selector offers only GPT-5.6 Sol, GPT-5.6 Terra, and GPT-5.6 Luna, exposes every reasoning effort supported by those models, and defaults to GPT-5.6 Sol with high reasoning.

## Model and reasoning catalog

`lib/chat.ts` remains the single source of truth for model and reasoning choices. The active model catalog will contain, in this order:

- `gpt-5.6-sol` — GPT-5.6 Sol
- `gpt-5.6-terra` — GPT-5.6 Terra
- `gpt-5.6-luna` — GPT-5.6 Luna

The active reasoning catalog will contain `none`, `low`, `medium`, `high`, `xhigh`, and `max`. The existing UI label style will be retained, with human-readable labels such as “Extra high” and “Max.” The default model will be exported as `gpt-5.6-sol`, and the default reasoning effort will remain `high`.

The browser and server will both consume these exported defaults. Unsupported or legacy model identifiers will normalize to GPT-5.6 Sol, and unsupported reasoning values will normalize to high. No compatibility aliases will keep the old model identifiers active.

## Request flow

The settings panel will render the centralized catalogs without adding new controls or changing its layout. On initial render, the selector will show GPT-5.6 Sol and high reasoning. Chat requests will continue to send the selected model and reasoning effort to `POST /api/chat`; action requests will continue to send both values to `POST /api/actions`.

The chat route will pass the selected effort to the OpenAI Responses provider and retain detailed reasoning summaries. The action route will pass the normalized effort into `runActionAgentsWorkflow`, which will apply the same reasoning setting to its orchestrator and reviewer agents. This closes the current gap where action requests send a reasoning choice but the action-agent workflow ignores it.

## SDK compatibility

The installed Vercel AI SDK provider recognizes efforts through `xhigh`, while the current OpenAI GPT-5.6 documentation also exposes `max`. The installed OpenAI Agents SDK is older than the current release documented for GPT-5.6. The implementation will update the relevant AI SDK and Agents SDK packages to stable versions that accept GPT-5.6 and `max` natively, with any migration edits limited to the model and reasoning request paths.

If the latest stable Vercel provider still rejects `max`, implementation will stop and report the provider incompatibility instead of adding a request-rewriting hack or silently downgrading the selected effort.

## Scope

Legacy models will be removed from active application catalogs, defaults, API fixtures, and UI tests. Historical design documents and implementation plans will remain unchanged because they record earlier architecture decisions rather than configure runtime behavior.

No changes are planned for prompts, permissions, demo data, response rendering, reasoning-summary disclosure, Cloudflare deployment settings, or environment variables.

## Testing and verification

Tests will verify:

- the exact three-model catalog and the removal of legacy active choices;
- the exact six reasoning efforts, including `max`;
- normalization to GPT-5.6 Sol and high reasoning for unsupported inputs;
- GPT-5.6 Sol and high as the initial selector values;
- propagation of the selected model and reasoning effort through live chat requests;
- propagation of the selected reasoning effort into all action agents.

Implementation will follow test-driven development: each behavior change begins with a failing test, followed by the smallest production change that makes it pass. Final verification will run `npm test`, `npm run typecheck`, and `npm run build` in the isolated worktree.
