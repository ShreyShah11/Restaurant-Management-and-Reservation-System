import { readableDate, readableTime } from "@/utils/date";

describe("utils/date", () => {
  it("formats readableDate deterministically for a fixed date", () => {
    const fixed = new Date("2024-01-01T12:34:56Z");
    const result = readableDate(fixed);
    expect(typeof result).toBe("string");
    expect(result.toLowerCase()).toContain("2024");
  });

  it("formats readableTime deterministically for a fixed date", () => {
    const fixed = new Date("2024-01-01T12:34:56Z");
    const result = readableTime(fixed);
    expect(typeof result).toBe("string");
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});
