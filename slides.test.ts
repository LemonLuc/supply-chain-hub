import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const deck = readFileSync(resolve(process.cwd(), "slides.md"), "utf8");
const styles = readFileSync(resolve(process.cwd(), "style.css"), "utf8");

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

  it("keeps slide 06 deployment constraints concise", () => {
    const slide = numberedSlide("06");

    expect(slide).toContain("Deployment constraints to validate");
    expect(slide).toContain("Data &amp; privacy");
    expect(slide).toContain("Identity &amp; governance");
    expect(slide).toContain("Operations &amp; adoption");
    expect(slide).not.toContain("OpenAI data control");
    expect(slide).not.toContain("API data is not used for model training");
  });

  it("shows a euro-only value hypothesis and explicit ROI gate on slide 08", () => {
    const slide = numberedSlide("08");

    expect(slide).toContain("€180K–€310K");
    expect(slide).toContain("€15K–€25K");
    expect(slide).toContain("€101K–€151K");
    expect(slide).toContain("€65K–€130K");
    expect(slide).toContain(
      "Net ROI = (validated benefit − annualized solution cost) ÷ annualized solution cost",
    );
    expect(slide).not.toContain("$");
  });

  it("explains the slide 08 proof plan in buyer language", () => {
    const slide = numberedSlide("08");

    expect(slide).toContain("Agree realistic test scenarios");
    expect(slide).toContain("Compare each answer and proposed action");
    expect(slide).toContain("Review failures together");
    expect(slide).toContain("Business value · Process owner");
    expect(slide).toContain("Decision quality · Supply-chain lead");
    expect(slide).toContain("Technical reliability · IT / AI owner");
    expect(slide).toContain("Governance · Risk owner");
    expect(slide).not.toMatch(/SME-labelled gold set|Graders|Trace \+ SME review|Regression set/);
    expect(slide).not.toMatch(/false negatives|tool \/ trace path/);
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
    expect(styles).toContain(".proof-steps");
    expect(styles).toContain(".buyer-gates");
    expect(styles).not.toContain(".openai-data-note");
  });
});
