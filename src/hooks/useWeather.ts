import { useState, useCallback } from "react";
import type { WeatherData, GeoLocation, TemperatureUnit } from "../types/weather";

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_SUGGESTIONS = 5;
const FORECAST_DAYS = 7;

// The Open-Meteo APIs are outside our control, so if a request hangs
// (bad wifi, server trouble) we give up after a while instead of
// leaving the app stuck on "Loading..." forever.
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error("The request took too long. Please try again.");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

async function searchLocations(query: string): Promise<GeoLocation[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=${MAX_SUGGESTIONS}&language=en&format=json`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error("Location search failed");
  const data = await res.json();
  if (!Array.isArray(data.results)) return [];
  return data.results.map((r: Record<string, unknown>) => ({
    name: r.name as string,
    latitude: r.latitude as number,
    longitude: r.longitude as number,
    country: r.country as string,
    admin1: r.admin1 as string | undefined,
  }));
}

// Checks that the weather response actually has the fields we need
// before we trust it. The API is outside our control, so its response
// could be missing pieces or shaped differently than we expect.
function isValidWeatherPayload(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  const current = d.current as Record<string, unknown> | undefined;
  const daily = d.daily as Record<string, unknown> | undefined;
  return (
    typeof d.timezone === "string" &&
    !!current &&
    typeof current.temperature_2m === "number" &&
    !!daily &&
    Array.isArray(daily.time)
  );
}

async function fetchWeather(
  location: GeoLocation,
  unit: TemperatureUnit
): Promise<WeatherData> {
  const tempUnit = unit === "celsius" ? "celsius" : "fahrenheit";
  const windUnit = "mph";

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${location.latitude}&longitude=${location.longitude}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,precipitation,weather_code,is_day,cloud_cover` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset` +
    `&temperature_unit=${tempUnit}` +
    `&wind_speed_unit=${windUnit}` +
    `&timezone=auto` +
    `&forecast_days=${FORECAST_DAYS}`;

  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error("Weather fetch failed");
  const data = await res.json();

  if (!isValidWeatherPayload(data)) {
    throw new Error("Couldn't understand the weather data. Please try again.");
  }

  return {
    location,
    timezone: data.timezone,
    current: {
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windspeed: data.current.wind_speed_10m,
      windgusts: data.current.wind_gusts_10m,
      precipitation: data.current.precipitation,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day,
      cloudCover: data.current.cloud_cover,
    },
    daily: {
      time: data.daily.time,
      temperatureMax: data.daily.temperature_2m_max,
      temperatureMin: data.daily.temperature_2m_min,
      weatherCode: data.daily.weather_code,
      precipitationSum: data.daily.precipitation_sum,
      precipitationProbability: data.daily.precipitation_probability_max,
      windspeedMax: data.daily.wind_speed_10m_max,
      sunrise: data.daily.sunrise,
      sunset: data.daily.sunset,
    },
  };
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [suggestions, setSuggestions] = useState<GeoLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<TemperatureUnit>("celsius");

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const results = await searchLocations(query);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const selectLocation = useCallback(
    async (location: GeoLocation, currentUnit?: TemperatureUnit) => {
      setLoading(true);
      setError(null);
      setSuggestions([]);
      try {
        const data = await fetchWeather(location, currentUnit ?? unit);
        setWeather(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load weather");
      } finally {
        setLoading(false);
      }
    },
    [unit]
  );

  const toggleUnit = useCallback(() => {
    const next: TemperatureUnit = unit === "celsius" ? "fahrenheit" : "celsius";
    setUnit(next);
    if (weather) {
      selectLocation(weather.location, next);
    }
  }, [unit, weather, selectLocation]);

  return { weather, suggestions, loading, error, unit, search, selectLocation, toggleUnit };
}
