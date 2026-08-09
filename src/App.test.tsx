import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import App from "./App";

function jsonResponse(body: unknown, ok = true) {
  return { ok, json: async () => body } as Response;
}

const validWeatherPayload = {
  timezone: "UTC",
  current: {
    temperature_2m: 20,
    apparent_temperature: 19,
    relative_humidity_2m: 50,
    wind_speed_10m: 5,
    wind_gusts_10m: 8,
    precipitation: 0,
    weather_code: 0,
    is_day: 1,
    cloud_cover: 10,
  },
  daily: {
    time: ["2026-08-09"],
    temperature_2m_max: [25],
    temperature_2m_min: [15],
    weather_code: [0],
    precipitation_sum: [0],
    precipitation_probability_max: [0],
    wind_speed_10m_max: [10],
    sunrise: ["2026-08-09T06:00"],
    sunset: ["2026-08-09T20:00"],
  },
};

async function searchAndPick(cityLabel: string) {
  vi.useFakeTimers();
  fireEvent.change(screen.getByPlaceholderText("Search for a city..."), {
    target: { value: "Test" },
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(350);
  });
  // Switch back to real timers so waitFor's polling (used after this call) works normally.
  vi.useRealTimers();
  fireEvent.mouseDown(screen.getByText(cityLabel));
}

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("shows a welcome message before any search happens", () => {
    render(<App />);
    expect(screen.getByText("Search for a city to see the weather.")).toBeInTheDocument();
  });

  it("shows the forecast after picking a city", async () => {
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(
        jsonResponse({ results: [{ name: "Testville", latitude: 1, longitude: 2, country: "Testland" }] })
      )
      .mockResolvedValueOnce(jsonResponse(validWeatherPayload));

    render(<App />);
    await searchAndPick("Testland");

    await waitFor(() => expect(screen.getByText("Testville")).toBeInTheDocument());
    expect(screen.getByText("20°C")).toBeInTheDocument();
  });

  it("shows an error message when the weather API is down", async () => {
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(
        jsonResponse({ results: [{ name: "Testville", latitude: 1, longitude: 2, country: "Testland" }] })
      )
      .mockResolvedValueOnce(jsonResponse({}, false));

    render(<App />);
    await searchAndPick("Testland");

    await waitFor(() => expect(screen.getByText(/Weather fetch failed/)).toBeInTheDocument());
    expect(screen.getByText("Please try again.")).toBeInTheDocument();
  });

  it("shows a friendly error instead of crashing when the API sends back something unexpected", async () => {
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(
        jsonResponse({ results: [{ name: "Testville", latitude: 1, longitude: 2, country: "Testland" }] })
      )
      .mockResolvedValueOnce(jsonResponse({ some: "totally different shape" }));

    render(<App />);
    await searchAndPick("Testland");

    await waitFor(() =>
      expect(screen.getByText(/Couldn't understand the weather data/)).toBeInTheDocument()
    );
  });

  it("shows no suggestions and no crash when a searched city does not exist", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ results: [] }));

    render(<App />);
    vi.useFakeTimers();
    fireEvent.change(screen.getByPlaceholderText("Search for a city..."), {
      target: { value: "Nowhereville" },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });
    vi.useRealTimers();

    expect(screen.getByText("Search for a city to see the weather.")).toBeInTheDocument();
  });
});
