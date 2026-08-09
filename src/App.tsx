import { useWeather } from "./hooks/useWeather";
import { SearchBar } from "./components/SearchBar";
import { CurrentWeather } from "./components/CurrentWeather";
import { Forecast } from "./components/Forecast";
import { SkyPanel } from "./components/SkyPanel";
import "./App.css";

export default function App() {
  const { weather, suggestions, loading, error, unit, search, selectLocation, toggleUnit } =
    useWeather();

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Weather</h1>
        <SearchBar onSearch={search} onSelect={selectLocation} suggestions={suggestions} />
      </header>

      <main className="app-main">
        {loading && (
          <div className="state-message">
            <span className="spinner" />
            <p>Loading weather...</p>
          </div>
        )}

        {error && !loading && (
          <div className="state-message error">
            <p>⚠️ {error}</p>
            <p className="error-sub">Please try again.</p>
          </div>
        )}

        {!weather && !loading && !error && (
          <div className="state-message welcome">
            <div className="welcome-icon">🌍</div>
            <p>Search for a city to see the weather.</p>
          </div>
        )}

        {weather && !loading && (
          <>
            <CurrentWeather data={weather} unit={unit} onToggleUnit={toggleUnit} />
            <Forecast daily={weather.daily} unit={unit} />
            <SkyPanel data={weather} />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Data from{" "}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo
          </a>
        </p>
      </footer>
    </div>
  );
}
