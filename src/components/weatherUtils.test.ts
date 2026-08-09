import { describe, it, expect } from "vitest";
import {
  getUnitSymbol,
  getWeatherDescription,
  getWeatherEmoji,
  formatDay,
  formatTime,
} from "./weatherUtils";

describe("getUnitSymbol", () => {
  it("returns °C for celsius", () => {
    expect(getUnitSymbol("celsius")).toBe("°C");
  });

  it("returns °F for fahrenheit", () => {
    expect(getUnitSymbol("fahrenheit")).toBe("°F");
  });
});

describe("getWeatherDescription", () => {
  it("maps the exact known codes", () => {
    expect(getWeatherDescription(0)).toBe("Clear sky");
    expect(getWeatherDescription(1)).toBe("Mainly clear");
    expect(getWeatherDescription(2)).toBe("Partly cloudy");
    expect(getWeatherDescription(3)).toBe("Overcast");
  });

  it("maps the ranges at their edges", () => {
    expect(getWeatherDescription(45)).toBe("Foggy");
    expect(getWeatherDescription(49)).toBe("Foggy");
    expect(getWeatherDescription(51)).toBe("Drizzle");
    expect(getWeatherDescription(57)).toBe("Drizzle");
    expect(getWeatherDescription(61)).toBe("Rain");
    expect(getWeatherDescription(67)).toBe("Rain");
    expect(getWeatherDescription(71)).toBe("Snow");
    expect(getWeatherDescription(77)).toBe("Snow");
    expect(getWeatherDescription(80)).toBe("Rain showers");
    expect(getWeatherDescription(82)).toBe("Rain showers");
    expect(getWeatherDescription(85)).toBe("Snow showers");
    expect(getWeatherDescription(86)).toBe("Snow showers");
    expect(getWeatherDescription(95)).toBe("Thunderstorm");
    expect(getWeatherDescription(99)).toBe("Thunderstorm");
  });

  it("falls back to Unknown for a code higher than any documented one", () => {
    expect(getWeatherDescription(100)).toBe("Unknown");
  });
});

describe("getWeatherEmoji", () => {
  it("shows sun for clear sky in the day", () => {
    expect(getWeatherEmoji(0, 1)).toBe("☀️");
  });

  it("shows moon for clear sky at night", () => {
    expect(getWeatherEmoji(0, 0)).toBe("🌙");
  });

  it("defaults to daytime when isDay is not given", () => {
    expect(getWeatherEmoji(0)).toBe("☀️");
  });

  it("shows a storm cloud for thunderstorm codes", () => {
    expect(getWeatherEmoji(96)).toBe("⛈️");
  });

  it("falls back to a thermometer for codes outside the documented range", () => {
    expect(getWeatherEmoji(150)).toBe("🌡️");
  });
});

describe("formatDay", () => {
  it("labels index 0 as Today regardless of the date", () => {
    expect(formatDay("2026-08-09", 0)).toBe("Today");
  });

  it("labels index 1 as Tomorrow regardless of the date", () => {
    expect(formatDay("2026-08-10", 1)).toBe("Tomorrow");
  });

  it("shows the weekday name for later days", () => {
    // 2026-08-11 is a Tuesday
    expect(formatDay("2026-08-11", 2)).toBe("Tuesday");
  });
});

describe("formatTime", () => {
  it("formats an ISO time string as a readable clock time", () => {
    const result = formatTime("2026-08-09T06:05");
    expect(result).toMatch(/6:05/);
  });
});
