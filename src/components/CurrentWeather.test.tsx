import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CurrentWeather } from "./CurrentWeather";
import type { WeatherData } from "../types/weather";

const sampleWeather: WeatherData = {
  location: { name: "Testville", latitude: 1, longitude: 2, country: "Testland", admin1: "Test State" },
  timezone: "UTC",
  current: {
    temperature: 22.4,
    apparentTemperature: 20.6,
    humidity: 55,
    windspeed: 12.3,
    windgusts: 18.9,
    precipitation: 0,
    weatherCode: 0,
    isDay: 1,
    cloudCover: 10,
  },
  daily: {
    time: ["2026-08-09"],
    temperatureMax: [26],
    temperatureMin: [16],
    weatherCode: [0],
    precipitationSum: [0],
    precipitationProbability: [0],
    windspeedMax: [15],
    sunrise: ["2026-08-09T06:12"],
    sunset: ["2026-08-09T20:03"],
  },
};

describe("CurrentWeather", () => {
  it("shows the rounded temperature and unit symbol", () => {
    render(<CurrentWeather data={sampleWeather} unit="celsius" onToggleUnit={() => {}} />);
    expect(screen.getByText("22°C")).toBeInTheDocument();
    expect(screen.getByText(/Feels like 21°C/)).toBeInTheDocument();
  });

  it("shows the city name and region", () => {
    render(<CurrentWeather data={sampleWeather} unit="celsius" onToggleUnit={() => {}} />);
    expect(screen.getByText("Testville")).toBeInTheDocument();
    expect(screen.getByText("Test State, Testland")).toBeInTheDocument();
  });

  it("calls onToggleUnit when the unit button is clicked", () => {
    const onToggleUnit = vi.fn();
    render(<CurrentWeather data={sampleWeather} unit="celsius" onToggleUnit={onToggleUnit} />);
    fireEvent.click(screen.getByTitle("Switch units"));
    expect(onToggleUnit).toHaveBeenCalledTimes(1);
  });

  it("hides the precipitation stat when there is none", () => {
    render(<CurrentWeather data={sampleWeather} unit="celsius" onToggleUnit={() => {}} />);
    expect(screen.queryByText("Precip.")).not.toBeInTheDocument();
  });

  it("shows the precipitation stat when there is some", () => {
    const rainy: WeatherData = {
      ...sampleWeather,
      current: { ...sampleWeather.current, precipitation: 3.2 },
    };
    render(<CurrentWeather data={rainy} unit="celsius" onToggleUnit={() => {}} />);
    expect(screen.getByText("Precip.")).toBeInTheDocument();
  });

  it("handles an extreme temperature without breaking", () => {
    const extreme: WeatherData = {
      ...sampleWeather,
      current: { ...sampleWeather.current, temperature: -55.7, apparentTemperature: -70.2 },
    };
    render(<CurrentWeather data={extreme} unit="fahrenheit" onToggleUnit={() => {}} />);
    expect(screen.getByText("-56°F")).toBeInTheDocument();
  });
});
