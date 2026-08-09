# Weather App

A clean, responsive weather app built with React and TypeScript.

Search any city in the world to get current conditions and a 7-day forecast. No API key needed — powered entirely by the free [Open-Meteo](https://open-meteo.com/) API.

## Features

- City search with autocomplete
- Current temperature, feels-like, humidity, wind speed, gusts, sunrise/sunset
- 7-day forecast with highs, lows, and precipitation probability
- Toggle between °C and °F
- Fully responsive — works on mobile and desktop

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for bundling
- [Open-Meteo API](https://open-meteo.com/) — free, no key required
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) for city search

## Getting started

**Option 1 — Just open it (no install needed):**

Download the repo and open `dist/index.html` in your browser. That's it.

**Option 2 — Dev mode:**

```bash
git clone https://github.com/Xeowyn/WeatherApp.git
cd WeatherApp
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

Produces a single self-contained `dist/index.html` with all JS and CSS inlined — no server required.
