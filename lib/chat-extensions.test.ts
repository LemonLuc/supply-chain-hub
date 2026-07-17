import { describe, expect, it } from "vitest";

import { buildAppContext } from "./context";
import { getChatTools } from "./chat-extensions";

describe("getChatTools", () => {
  it("registers a trusted operational chart only for an explicit compatible request", async () => {
    const context = buildAppContext(
      "delay",
      "procurement",
      ["sap", "quality", "excel", "capacity"],
    );
    const withoutVisualRequest = getChatTools(context);
    const withVisualRequest = getChatTools(context, { allowOperationalChart: true });

    expect(withoutVisualRequest).toEqual({});
    expect(withVisualRequest).toHaveProperty("renderOperationalChart");
    const chartTool = withVisualRequest.renderOperationalChart as {
      execute?: (input: { visualId: string; reason: string }) => unknown;
    };
    await expect(chartTool.execute?.({
      visualId: "alternate-coverage",
      reason: "Compare protected and uncovered builds.",
    })).resolves.toMatchObject({
      kind: "operational-bar",
      id: "alternate-coverage",
      bars: [
        expect.objectContaining({ value: 14 }),
        expect.objectContaining({ value: 8 }),
        expect.objectContaining({ value: 6 }),
      ],
    });
  });

  it("does not register an operational chart when the trusted context cannot resolve one", () => {
    const context = buildAppContext("risks", "logistics", []);

    expect(getChatTools(context, { allowOperationalChart: true })).toEqual({});
  });
});
