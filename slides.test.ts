import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const deck = readFileSync(resolve(process.cwd(), "slides.md"), "utf8");
const styles = readFileSync(resolve(process.cwd(), "style.css"), "utf8");
const runbook = readFileSync(resolve(process.cwd(), "executive-presentation.md"), "utf8");

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

  it("turns slide 03 discovery into a tangible working pain hypothesis", () => {
    const slide = numberedSlide("03");

    expect(slide).toContain("Working pain hypothesis from technical discovery");
    expect(slide).toContain("roughly 20 minutes spent reconciling SAP");
    expect(slide).toContain("scarce domain experts become the bottleneck");
    expect(slide).toContain("avoidable expedite spend, schedule churn");
    expect(slide).not.toContain("Which disruptions consume the most time?");
    expect(slide).not.toContain("Where do handoffs reduce accuracy or predictability?");
    expect(slide).not.toContain(
      "Which recommendations need evidence, review and traceability?",
    );
  });

  it("keeps slide 06 deployment constraints concise", () => {
    const slide = numberedSlide("06");

    expect(slide).toContain("Deployment constraints to validate");
    expect(slide).toContain("Data &amp; privacy");
    expect(slide).toContain("Identity &amp; governance");
    expect(slide).toContain("Operations &amp; adoption");
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
    expect(slide).toContain("ZEISS confirms the baseline, attribution and annual run cost");
    expect(slide).not.toMatch(/€180K–€310K|€15K–€25K|€101K–€151K|€65K–€130K/);
    expect(slide).not.toContain("Net ROI =");
    expect(slide).not.toContain("× €");
    expect(slide).not.toContain("$");
  });

  it("shows four concise POC decision gates on slide 08", () => {
    const slide = numberedSlide("08");

    expect(slide).toContain("POC decision gates");
    expect(slide).toContain(
      "Test routine cases, high-impact exceptions and permission boundaries",
    );
    expect(slide).toContain("≥25% faster review · ≥80% useful");
    expect(slide).toContain("≥90% source-backed · &lt;5% serious risks missed");
    expect(slide).toContain("≥95% correct approved system and workflow");
    expect(slide).toContain("100% human review for high-impact actions");
    expect(slide).not.toContain("Agree realistic test scenarios");
    expect(slide).not.toContain("Compare each answer and proposed action");
    expect(slide).not.toContain("Review failures together");
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
      /\.roi-panel,\s*\.evaluation-panel\s*\{[^}]*min-height: 280px;/,
    );
    expect(styles).toMatch(
      /\.poc-slide \.validation-layout\s*\{[^}]*width: min\(100%, 920px\);/,
    );
    expect(styles).toMatch(/\.poc-slide \.slide-number\s*\{[^}]*bottom: 12px;/);
    expect(styles).toMatch(
      /\.decision-gates\s*\{[^}]*border-top: 0;[^}]*padding: 0;/,
    );
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
  });
});
