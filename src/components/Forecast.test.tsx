import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Forecast } from "./Forecast";
import type { DailyForecast } from "../types/weather";

const sevenDays: DailyForecast = {
  time: ["2026-08-09", "2026-08-10", "2026-08-11", "2026-08-12", "2026-08-13", "2026-08-14", "2026-08-15"],
  temperatureMax: [26, 27, 28, 25, 24, 23, 22],
  temperatureMin: [16, 17, 18, 15, 14, 13, 12],
  weatherCode: [0, 1, 2, 3, 61, 71, 95],
  precipitationSum: [0, 0, 0, 0, 2, 1, 5],
  precipitationProbability: [0, 0, 0, 0, 60, 40, 90],
  windspeedMax: [10, 11, 12, 13, 14, 15, 16],
  sunrise: ["2026-08-09T06:00", "", "", "", "", "", ""],
  sunset: ["2026-08-09T20:00", "", "", "", "", "", ""],
};

describe("Forecast", () => {
  it("renders one card per day", () => {
    render(<Forecast daily={sevenDays} unit="celsius" />);
    expect(screen.getAllByText(/°C$/).length).toBeGreaterThanOrEqual(7);
  });

  it("labels the first two days as Today and Tomorrow", () => {
    render(<Forecast daily={sevenDays} unit="celsius" />);
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Tomorrow")).toBeInTheDocument();
  });

  it("only shows a rain chance when there is one", () => {
    render(<Forecast daily={sevenDays} unit="celsius" />);
    expect(screen.getByText("💧 60%")).toBeInTheDocument();
    expect(screen.queryByText("💧 0%")).not.toBeInTheDocument();
  });

  it("renders in Fahrenheit when asked", () => {
    render(<Forecast daily={sevenDays} unit="fahrenheit" />);
    expect(screen.getAllByText(/°F$/).length).toBeGreaterThanOrEqual(7);
  });
});
