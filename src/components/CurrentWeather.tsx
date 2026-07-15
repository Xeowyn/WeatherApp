import type { WeatherData, TemperatureUnit } from "../types/weather";
import { getWeatherDescription, getWeatherEmoji, formatTime } from "./weatherUtils";

interface Props {
  data: WeatherData;
  unit: TemperatureUnit;
  onToggleUnit: () => void;
}

export function CurrentWeather({ data, unit, onToggleUnit }: Props) {
  const { current, location, daily } = data;
  const unitSymbol = unit === "celsius" ? "°C" : "°F";
  const description = getWeatherDescription(current.weatherCode);
  const emoji = getWeatherEmoji(current.weatherCode, current.isDay);

  return (
    <div className="current-weather">
      <div className="current-header">
        <div>
          <h2 className="location-name">{location.name}</h2>
          <p className="location-sub">
            {location.admin1 ? `${location.admin1}, ` : ""}
            {location.country}
          </p>
        </div>
        <button className="unit-toggle" onClick={onToggleUnit} title="Switch units">
          {unit === "celsius" ? "°F" : "°C"}
        </button>
      </div>

      <div className="current-main">
        <span className="weather-emoji">{emoji}</span>
        <div className="temp-block">
          <span className="current-temp">
            {Math.round(current.temperature)}
            {unitSymbol}
          </span>
          <span className="feels-like">
            Feels like {Math.round(current.apparentTemperature)}
            {unitSymbol}
          </span>
          <span className="description">{description}</span>
        </div>
      </div>

      <div className="current-stats">
        <div className="stat">
          <span className="stat-icon">💧</span>
          <span className="stat-value">{current.humidity}%</span>
          <span className="stat-label">Humidity</span>
        </div>
        <div className="stat">
          <span className="stat-icon">💨</span>
          <span className="stat-value">{Math.round(current.windspeed)} mph</span>
          <span className="stat-label">Wind</span>
        </div>
        <div className="stat">
          <span className="stat-icon">🌬️</span>
          <span className="stat-value">{Math.round(current.windgusts)} mph</span>
          <span className="stat-label">Gusts</span>
        </div>
        <div className="stat">
          <span className="stat-icon">🌅</span>
          <span className="stat-value">{formatTime(daily.sunrise[0])}</span>
          <span className="stat-label">Sunrise</span>
        </div>
        <div className="stat">
          <span className="stat-icon">🌇</span>
          <span className="stat-value">{formatTime(daily.sunset[0])}</span>
          <span className="stat-label">Sunset</span>
        </div>
        {current.precipitation > 0 && (
          <div className="stat">
            <span className="stat-icon">🌧️</span>
            <span className="stat-value">{current.precipitation} mm</span>
            <span className="stat-label">Precip.</span>
          </div>
        )}
      </div>
    </div>
  );
}
