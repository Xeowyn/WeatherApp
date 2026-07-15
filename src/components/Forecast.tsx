import type { DailyForecast, TemperatureUnit } from "../types/weather";
import { getWeatherEmoji, formatDay } from "./weatherUtils";

interface Props {
  daily: DailyForecast;
  unit: TemperatureUnit;
}

export function Forecast({ daily, unit }: Props) {
  const unitSymbol = unit === "celsius" ? "°C" : "°F";

  return (
    <div className="forecast">
      <h3 className="forecast-title">7-Day Forecast</h3>
      <div className="forecast-grid">
        {daily.time.map((date, i) => (
          <div key={date} className={`forecast-card ${i === 0 ? "forecast-today" : ""}`}>
            <span className="forecast-day">{formatDay(date, i)}</span>
            <span className="forecast-emoji">{getWeatherEmoji(daily.weatherCode[i])}</span>
            <div className="forecast-temps">
              <span className="forecast-high">
                {Math.round(daily.temperatureMax[i])}
                {unitSymbol}
              </span>
              <span className="forecast-low">
                {Math.round(daily.temperatureMin[i])}
                {unitSymbol}
              </span>
            </div>
            {daily.precipitationProbability[i] > 0 && (
              <span className="forecast-precip">
                💧 {daily.precipitationProbability[i]}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
