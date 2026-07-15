export interface GeoLocation {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windspeed: number;
  windgusts: number;
  precipitation: number;
  weatherCode: number;
  isDay: number;
  cloudCover: number;
}

export interface DailyForecast {
  time: string[];
  temperatureMax: number[];
  temperatureMin: number[];
  weatherCode: number[];
  precipitationSum: number[];
  precipitationProbability: number[];
  windspeedMax: number[];
  sunrise: string[];
  sunset: string[];
}

export interface WeatherData {
  location: GeoLocation;
  current: CurrentWeather;
  daily: DailyForecast;
  timezone: string;
}

export type TemperatureUnit = "celsius" | "fahrenheit";
