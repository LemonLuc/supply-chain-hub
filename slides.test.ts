import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const deck = readFileSync(resolve(process.cwd(), "slides.md"), "utf8");
const styles = readFileSync(resolve(process.cwd(), "style.css"), "utf8");
const runbook = readFileSync(resolve(process.cwd(), "executive-presentation.md"), "utf8");
const packageFile = readFileSync(resolve(process.cwd(), "package.json"), "utf8");

function numberedSlide(number: string) {
  const marker = `<span class="slide-number">${number}</span>`;
  const start = deck.indexOf(marker);
  const end = deck.indexOf("\n---", start);

  expect(start).toBeGreaterThanOrEqual(0);
  return deck.slice(start, end === -1 ? undefined : end);
}

describe("approved ROI, deployment, and evaluation deck content", () => {
  it("keeps the existing numbered-slide sequence", () => {
    const numbers = [...deck.matchAll(/<span class="slide-number">(\d{2})<\/span>/g)].map(
      ([, number]) => number,
    );

    expect(numbers).toEqual(["02", "03", "04", "05", "06", "08", "09", "11"]);
  });

  it("frames slide 03 as three hypotheses from the technical discovery", () => {
    const slide = numberedSlide("03");

    expect(slide).toContain("Hypotheses from the technical discovery");
    expect(slide).toContain("Time to decision:");
    expect(slide).toContain("reconciling conflicting SAP, supplier, logistics and workbook updates");
    expect(slide).toContain("Data confidence:");
    expect(slide).toContain("current, permitted and backed by traceable evidence");
    expect(slide).toContain("Governed action:");
    expect(slide).toContain("ownership and approval paths are unclear");
    expect(slide).toContain("customer-delivery risk");
    expect(slide).not.toContain("Working pain hypothesis from technical discovery");
  });

  it("keeps slide 06 deployment constraints concise", () => {
    const slide = numberedSlide("06");

    expect(slide).toContain("Deployment constraints to validate");
    expect(slide).toContain("Data &amp; privacy");
    expect(slide).toContain("Identity &amp; governance");
    expect(slide).toContain("Operations &amp; adoption");
    expect(slide).toContain(
      "Fail-closed fallback, designated process owner, training, feedback and security checkpoints.",
    );
    expect(slide).not.toContain("masking and");
    expect(slide).not.toContain("works-council checkpoints");
    expect(slide).not.toContain("OpenAI data control");
    expect(slide).not.toContain("API data is not used for model training");
  });

  it("scopes slide 08 value to one workflow without visible formulas", () => {
    const slide = numberedSlide("08");

    expect(slide).toContain("Validate value and control before scaling one workflow");
    expect(slide).toContain("Annual value hypothesis · one workflow");
    expect(slide).toContain("€0.2M–€0.3M");
    expect(slide).toContain("Faster risk review");
    expect(slide).toContain("Fewer urgent expedites");
    expect(slide).toContain("Lower disruption exposure");
    expect(slide).not.toContain("ZEISS confirms the baseline, attribution and annual run cost");
    expect(slide).not.toMatch(/€180K–€310K|€15K–€25K|€101K–€151K|€65K–€130K/);
    expect(slide).not.toContain("Net ROI =");
    expect(slide).not.toContain("× €");
    expect(slide).not.toContain("$");
  });

  it("shows four measurable qualitative and quantitative POC success criteria", () => {
    const slide = numberedSlide("08");

    expect(slide).toContain("POC success criteria");
    expect(slide).toContain(
      "Test routine cases, high-impact exceptions and permission boundaries",
    );
    expect(slide).toContain("Process value");
    expect(slide).toContain("≥25% faster review · ≥80% useful");
    expect(slide).toContain("Compare timestamped case duration and collect a post-case user rating.");
    expect(slide).toContain("Decision quality");
    expect(slide).toContain("≥90% source-backed · &lt;5% serious risks missed");
    expect(slide).toContain("Review outputs against expert-approved scenarios and source evidence.");
    expect(slide).toContain("Technical reliability");
    expect(slide).toContain("≥95% correct approved system and workflow");
    expect(slide).toContain("Inspect tool-call and trace logs across the scenario set.");
    expect(slide).toContain("Governance");
    expect(slide).toContain("100% human review for high-impact actions");
    expect(slide).toContain("Verify every required approval in the audit log.");
    expect(slide.match(/How measured/g)).toHaveLength(4);
  });

  it("describes the actual application and OpenAI solution stack on slide 11", () => {
    const slide = numberedSlide("11");

    expect(slide).toContain("Actual Supply Chain Hub solution stack");
    expect(slide).toContain("Next.js App Router, React and strict TypeScript");
    expect(slide).toContain("OpenAI Responses API");
    expect(slide).toContain("OpenAI Agents SDK");
    expect(slide).toContain("gpt-5.4-nano");
    expect(slide).toContain("fail closed");
    expect(slide).toContain("OpenAI image generation");
    expect(slide).toContain("only when no trusted chart fits");
    expect(slide).toContain("OpenNext and Wrangler");
    expect(slide).not.toContain("Microsoft 365 grouping");
  });

  it("disables and removes Slidev recording-only controls", () => {
    expect(deck).toContain("record: false");
    expect(deck).not.toContain("record: true");
    expect(packageFile).not.toContain("patch-slidev-recording-audio");
    expect(existsSync(resolve(process.cwd(), "custom-nav-controls.vue"))).toBe(false);
    expect(
      existsSync(resolve(process.cwd(), "scripts/patch-slidev-recording-audio.mjs")),
    ).toBe(false);
  });

  it("removes the closing filler from slide 09", () => {
    const slide = numberedSlide("09");

    expect(slide).toContain("After the POC");
    expect(slide).toContain("How OpenAI can support adoption");
    expect(slide).not.toContain("Looking forward to shaping the collaboration");
    expect(slide).not.toContain("Lean customer core");
  });

  it("includes scoped styling hooks for the revised layouts", () => {
    expect(styles).toContain(".deployment-constraints");
    expect(styles).toContain(".roi-panel");
    expect(styles).toContain(".value-levers");
    expect(styles).toContain(".decision-gates");
    expect(styles).toMatch(
      /\.nutshell-cards p\s*\{[^}]*font-size: 12\.3px;/,
    );
    expect(styles).toMatch(
      /\.poc-slide \.validation-layout\s*\{[^}]*grid-template-columns: 0\.82fr 1\.18fr;[^}]*width: min\(100%, 940px\);/,
    );
    expect(styles).toMatch(/\.value-levers\s*\{[^}]*grid-template-rows: repeat\(3, minmax\(0, 1fr\)\);/);
    expect(styles).toMatch(/\.decision-gates\s*\{[^}]*grid-template-columns: 1fr;[^}]*grid-template-rows: repeat\(4, minmax\(0, 1fr\)\);/);
    expect(styles).toMatch(/\.decision-gates > div\s*\{[^}]*grid-template-columns: 120px 1fr;/);
    expect(styles).toMatch(/\.poc-slide \.slide-number\s*\{[^}]*bottom: 12px;/);
    expect(styles).toMatch(
      /\.decision-gates\s*\{[^}]*border-top: 0;[^}]*padding: 0;/,
    );
    expect(styles).toMatch(/\.proof-slide \.timeline div\s*\{[^}]*height: 136px;[^}]*min-height: 136px;/);
    expect(styles).toMatch(/\.proof-slide \.post-poc-panel\s*\{[^}]*margin-top: -6px;/);
    expect(styles).toMatch(/\.adoption-path h2,\s*\.adoption-support h2\s*\{[^}]*font-size: 13\.5px;/);
    expect(styles).toMatch(/\.adoption-path b,\s*\.adoption-support b\s*\{[^}]*font-size: 11px;/);
    expect(styles).toMatch(/\.adoption-path p,\s*\.adoption-support p\s*\{[^}]*font-size: 10\.2px;/);
    expect(styles).not.toContain(".proof-steps");
    expect(styles).not.toContain(".buyer-gates");
    expect(styles).not.toContain(".openai-data-note");
  });

  it("keeps slide 08 arithmetic in the presenter talking track", () => {
    expect(runbook).toContain("600–1,000 reviews × 20 minutes saved × €75 per hour");
    expect(runbook).toContain("12–18 avoided cases × €8,400");
    expect(runbook).toContain(
      "0.35–0.70 probability-weighted events × €185,000",
    );
    expect(runbook).toContain("€181K–€306K");
    expect(runbook).toContain("one repeatable workflow");
    expect(runbook).toContain("not enterprise-wide ZEISS value");
    expect(runbook).toContain("Compare timestamped case duration with the agreed baseline");
    expect(runbook).toContain("expert-reviewed benchmark scenarios");
    expect(runbook).toContain("Inspect tool-call and trace logs");
    expect(runbook).toContain("Verify required human approvals in the audit log");
  });

  it("explains the actual slide 11 stack in the presenter track", () => {
    expect(runbook).toContain("Responses API streams the grounded chat experience");
    expect(runbook).toContain("Agents SDK runs role-aware tools and reviewer handoffs");
    expect(runbook).toContain("gpt-5.4-nano classifier");
    expect(runbook).toContain("Image generation is conditional");
    expect(runbook).toContain("no trusted quantitative chart fits");
  });
});
