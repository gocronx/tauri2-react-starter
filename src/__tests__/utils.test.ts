import { describe, it, expect } from "vitest";
import { cn, formatDate } from "../lib/utils";

describe("Utility functions", () => {
  it("cn merges class names properly", () => {
    expect(
      cn("px-2 py-1", "bg-red-500", { "text-white": true, "opacity-0": false }),
    ).toBe("px-2 py-1 bg-red-500 text-white");
  });

  it("formatDate handles valid ISO dates", () => {
    const iso = "2026-01-01T12:00:00Z";
    const formatted = formatDate(iso);
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe("string");
  });
});
