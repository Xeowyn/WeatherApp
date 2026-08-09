import { describe, it, expect } from "vitest";
import {
  getMoonPhase,
  getGoldenHours,
  getNextSolarEclipse,
  getNextMeteorShower,
  getStargazingIndex,
} from "./astronomy";

describe("getMoonPhase", () => {
  it("is a new moon right at the reference new moon date", () => {
    const result = getMoonPhase(new Date("2000-01-06T18:14:00Z"));
    expect(result.name).toBe("New Moon");
    expect(result.illumination).toBeLessThan(5);
  });

  it("is a full moon about halfway through the cycle", () => {
    const halfwayThrough = new Date("2000-01-06T18:14:00Z");
    halfwayThrough.setDate(halfwayThrough.getDate() + 15);
    const result = getMoonPhase(halfwayThrough);
    expect(result.name).toBe("Full Moon");
    expect(result.illumination).toBeGreaterThan(95);
  });

  it("wraps correctly for dates before the reference date", () => {
    const before = new Date("1999-12-01T00:00:00Z");
    const result = getMoonPhase(before);
    expect(result.phase).toBeGreaterThanOrEqual(0);
    expect(result.phase).toBeLessThan(30);
  });
});

describe("getGoldenHours", () => {
  it("shifts golden and blue hour times around sunrise and sunset", () => {
    const result = getGoldenHours("2026-08-09T06:00:00", "2026-08-09T20:00:00");
    expect(result.morningGoldStart).toMatch(/6:00/);
    expect(result.morningGoldEnd).toMatch(/7:00/);
    expect(result.eveningGoldStart).toMatch(/7:00/);
    expect(result.eveningBlueEnd).toMatch(/8:30/);
  });
});

describe("getNextSolarEclipse", () => {
  it("finds the first eclipse after the given date", () => {
    const result = getNextSolarEclipse(new Date("2026-01-01T00:00:00Z"));
    expect(result.date).toBe("2026-08-12");
    expect(result.daysUntil).toBeGreaterThan(0);
  });

  it("falls back to the last known eclipse once every listed one is in the past", () => {
    const result = getNextSolarEclipse(new Date("2099-01-01T00:00:00Z"));
    expect(result.date).toBe("2035-09-02");
  });
});

describe("getNextMeteorShower", () => {
  it("finds the next shower within the current year", () => {
    const result = getNextMeteorShower(new Date("2026-08-01T00:00:00Z"));
    expect(result.name).toBe("Perseids");
    expect(result.daysUntil).toBeGreaterThanOrEqual(0);
  });

  it("rolls over to next year's Quadrantids right after Geminids", () => {
    const result = getNextMeteorShower(new Date("2026-12-20T00:00:00Z"));
    expect(result.name).toBe("Quadrantids");
  });
});

describe("getStargazingIndex", () => {
  it("scores a perfectly clear sky as 10 / Perfect", () => {
    const result = getStargazingIndex(0);
    expect(result.score).toBe(10);
    expect(result.label).toBe("Perfect");
  });

  it("scores a fully clouded sky as 0 / Clouded Out", () => {
    const result = getStargazingIndex(100);
    expect(result.score).toBe(0);
    expect(result.label).toBe("Clouded Out");
  });

  it("scores a middling cloud cover as Good", () => {
    const result = getStargazingIndex(50);
    expect(result.score).toBe(5);
    expect(result.label).toBe("Good");
  });
});
