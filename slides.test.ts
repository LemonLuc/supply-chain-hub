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

  it("frames customer deployment constraints and OpenAI data controls on slide 06", () => {
    const slide = numberedSlide("06");

    expect(slide).toContain("Deployment constraints to validate");
    expect(slide).toContain("Data &amp; privacy");
    expect(slide).toContain("Identity &amp; governance");
    expect(slide).toContain("Operations &amp; adoption");
    expect(slide).toContain("API data is not used for model training unless the customer opts in");
    expect(slide).toContain(
      "Retention and residency depend on eligible project, endpoint and configuration",
    );
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

  it("defines the evaluation loop, metrics, and owners on slide 08", () => {
    const slide = numberedSlide("08");

    expect(slide).toContain("SME-labelled gold set");
    expect(slide).toContain("Graders");
    expect(slide).toContain("Trace + SME review");
    expect(slide).toContain("Regression set");
    expect(slide).toContain("≤5% critical false negatives");
    expect(slide).toContain("≥95% correct tool / trace path");
    expect(slide).toContain("100% high-impact review");
  });

  it("includes scoped styling hooks for the new layout", () => {
    expect(styles).toContain(".deployment-constraints");
    expect(styles).toContain(".openai-data-note");
    expect(styles).toContain(".roi-panel");
    expect(styles).toContain(".evaluation-loop");
    expect(styles).toContain(".release-gates");
  });
});
