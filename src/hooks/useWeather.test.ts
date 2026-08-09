import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useWeather } from "./useWeather";
import type { GeoLocation } from "../types/weather";

const testLocation: GeoLocation = {
  name: "Testville",
  latitude: 10,
  longitude: 20,
  country: "Testland",
  admin1: "Test State",
};

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    json: async () => body,
  } as Response;
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

describe("useWeather", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("clears suggestions for an empty search without calling the API", async () => {
    const { result } = renderHook(() => useWeather());
    await act(async () => {
      await result.current.search("   ");
    });
    expect(result.current.suggestions).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("populates suggestions from a successful search", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({
        results: [
          { name: "Paris", latitude: 1, longitude: 2, country: "France" },
        ],
      })
    );
    const { result } = renderHook(() => useWeather());
    await act(async () => {
      await result.current.search("Paris");
    });
    expect(result.current.suggestions).toHaveLength(1);
    expect(result.current.suggestions[0].name).toBe("Paris");
  });

  it("treats a city with no matches as an empty suggestion list, not an error", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({}));
    const { result } = renderHook(() => useWeather());
    await act(async () => {
      await result.current.search("Nowhereville");
    });
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("quietly clears suggestions when the search request fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("network down"));
    const { result } = renderHook(() => useWeather());
    await act(async () => {
      await result.current.search("Paris");
    });
    expect(result.current.suggestions).toEqual([]);
  });

  it("loads weather for a selected location", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse(validWeatherPayload));
    const { result } = renderHook(() => useWeather());
    await act(async () => {
      await result.current.selectLocation(testLocation);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.weather?.current.temperature).toBe(20);
    expect(result.current.weather?.location.name).toBe("Testville");
  });

  it("shows a friendly error message when the weather request fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({}, false));
    const { result } = renderHook(() => useWeather());
    await act(async () => {
      await result.current.selectLocation(testLocation);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.weather).toBeNull();
    expect(result.current.error).toBe("Weather fetch failed");
  });

  it("shows a friendly error instead of crashing when the API response is missing fields", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({ reason: "Invalid parameters" })
    );
    const { result } = renderHook(() => useWeather());
    await act(async () => {
      await result.current.selectLocation(testLocation);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.weather).toBeNull();
    expect(result.current.error).toBe("Couldn't understand the weather data. Please try again.");
  });

  it("shows a friendly error when the request times out", async () => {
    vi.useFakeTimers();
    (fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
      (_url: string, options?: { signal?: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener("abort", () => {
            const err = new DOMException("Aborted", "AbortError");
            reject(err);
          });
        })
    );
    const { result } = renderHook(() => useWeather());
    let selectPromise: Promise<void>;
    act(() => {
      selectPromise = result.current.selectLocation(testLocation);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
      await selectPromise;
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("The request took too long. Please try again.");
  });

  it("toggles the unit and refetches weather in the new unit", async () => {
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(jsonResponse(validWeatherPayload))
      .mockResolvedValueOnce(jsonResponse({ ...validWeatherPayload, current: { ...validWeatherPayload.current, temperature_2m: 68 } }));

    const { result } = renderHook(() => useWeather());
    await act(async () => {
      await result.current.selectLocation(testLocation);
    });
    expect(result.current.unit).toBe("celsius");

    await act(async () => {
      result.current.toggleUnit();
      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    expect(result.current.unit).toBe("fahrenheit");
    expect(result.current.weather?.current.temperature).toBe(68);
  });
});
