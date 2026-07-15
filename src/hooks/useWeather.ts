import { useState, useCallback } from "react";
import type { WeatherData, GeoLocation, TemperatureUnit } from "../types/weather";

async function searchLocations(query: string): Promise<GeoLocation[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Location search failed");
  const data = await res.json();
  if (!data.results) return [];
  return data.results.map((r: Record<string, unknown>) => ({
    name: r.name as string,
    latitude: r.latitude as number,
    longitude: r.longitude as number,
    country: r.country as string,
    admin1: r.admin1 as string | undefined,
  }));
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
    `&forecast_days=7`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather fetch failed");
  const data = await res.json();

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
