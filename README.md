# Weather App

A simple weather app made with React and TypeScript.

Type in any city and see what the weather is like right now, plus a 7-day forecast. You don't need an API key or sign-up — all the weather data comes free from [Open-Meteo](https://open-meteo.com/).

## What it can do

- Search for a city and pick it from a list of matches
- Show the current temperature, what it feels like, humidity, wind speed and gusts, and sunrise/sunset times
- Show a 7-day forecast with highs, lows, and the chance of rain
- Switch between Celsius and Fahrenheit
- Look good on both phones and computers
- Show moon phase, stargazing conditions, golden hour times, and upcoming meteor showers and eclipses

## Built with

- [React 19](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) to build and bundle the app
- [Open-Meteo](https://open-meteo.com/) for weather data — free, no key needed
- [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) to turn a city name into a location

## How to run it

**Easiest way — just open the file:**

Download this repo and open `dist/index.html` in your browser. Nothing to install.

**Or run it in dev mode:**

```bash
git clone https://github.com/Xeowyn/WeatherApp.git
cd WeatherApp
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Building it yourself

```bash
npm run build
```

This makes one file, `dist/index.html`, with everything (all the code and styles) packed inside. You can open it straight in a browser — no server needed.

## Running the tests

```bash
npm run test
```
