import { useMemo } from "react";
import type { WeatherData } from "../types/weather";
import {
  getMoonPhase,
  getGoldenHours,
  getNextSolarEclipse,
  getNextMeteorShower,
  getStargazingIndex,
} from "../utils/astronomy";

interface Props {
  data: WeatherData;
}

function daysLabel(n: number): string {
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  if (n < 30)  return `In ${n} days`;
  const months = Math.round(n / 30.44);
  return `In ~${months} month${months !== 1 ? "s" : ""}`;
}

export function SkyPanel({ data }: Props) {
  const now = useMemo(() => new Date(), []);

  const moon      = useMemo(() => getMoonPhase(now), [now]);
  const golden    = useMemo(() => getGoldenHours(data.daily.sunrise[0], data.daily.sunset[0]), [data]);
  const eclipse   = useMemo(() => getNextSolarEclipse(now), [now]);
  const shower    = useMemo(() => getNextMeteorShower(now), [now]);
  const stargazing = useMemo(() => getStargazingIndex(data.current.cloudCover), [data.current.cloudCover]);

  const moonMilestone = moon.daysToFull <= moon.daysToNew
    ? { label: "Full Moon", days: moon.daysToFull }
    : { label: "New Moon",  days: moon.daysToNew };

  return (
    <div className="sky-panel">
      <h3 className="sky-title">Night Sky</h3>

      <div className="sky-grid">

        {/* Moon Phase */}
        <div className="sky-card">
          <div className="sky-card-header">
            <span className="sky-icon">🌙</span>
            <span className="sky-card-title">Moon Phase</span>
          </div>
          <div className="moon-display">
            <span className="moon-emoji">{moon.emoji}</span>
            <div className="moon-info">
              <span className="moon-name">{moon.name}</span>
              <div className="illum-bar-wrap">
                <div className="illum-bar" style={{ width: `${moon.illumination}%` }} />
              </div>
              <span className="moon-illum">{moon.illumination}% illuminated</span>
            </div>
          </div>
          <div className="moon-next">
            <span className="moon-next-label">{moonMilestone.label}</span>
            <span className="moon-next-days">{daysLabel(Math.round(moonMilestone.days))}</span>
          </div>
        </div>

        {/* Stargazing */}
        <div className="sky-card">
          <div className="sky-card-header">
            <span className="sky-icon">⭐</span>
            <span className="sky-card-title">Stargazing Tonight</span>
          </div>
          <div className="stargaze-score-wrap">
            <span className="stargaze-score" style={{ color: stargazing.color }}>
              {stargazing.score}<span className="stargaze-denom">/10</span>
            </span>
            <span className="stargaze-label" style={{ color: stargazing.color }}>
              {stargazing.label}
            </span>
          </div>
          <p className="stargaze-tip">{stargazing.tip}</p>
          <p className="stargaze-cloud">Cloud cover: {data.current.cloudCover}%</p>
        </div>

        {/* Golden Hour */}
        <div className="sky-card">
          <div className="sky-card-header">
            <span className="sky-icon">🌅</span>
            <span className="sky-card-title">Golden &amp; Blue Hour</span>
          </div>
          <div className="golden-row">
            <span className="golden-badge golden">Golden</span>
            <div className="golden-times">
              <span>{golden.morningGoldStart} – {golden.morningGoldEnd}</span>
              <span>{golden.eveningGoldStart} – {golden.eveningGoldEnd}</span>
            </div>
          </div>
          <div className="golden-row">
            <span className="golden-badge blue">Blue</span>
            <div className="golden-times">
              <span>{golden.morningBlueStart} – {golden.morningBlueEnd}</span>
              <span>{golden.eveningBlueStart} – {golden.eveningBlueEnd}</span>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="sky-card">
          <div className="sky-card-header">
            <span className="sky-icon">🔭</span>
            <span className="sky-card-title">Upcoming Events</span>
          </div>

          <div className="event-row">
            <div className="event-icon-wrap">🌑</div>
            <div className="event-body">
              <span className="event-name">{eclipse.type} Solar Eclipse</span>
              <span className="event-date">{eclipse.displayDate} · {daysLabel(eclipse.daysUntil)}</span>
              <span className="event-note">{eclipse.regions}</span>
            </div>
          </div>

          <div className="event-divider" />

          <div className="event-row">
            <div className="event-icon-wrap">☄️</div>
            <div className="event-body">
              <span className="event-name">{shower.name} Meteor Shower</span>
              <span className="event-date">{shower.peakDate} · {daysLabel(shower.daysUntil)}</span>
              <span className="event-note">Up to {shower.hourlyRate}/hr · {shower.description}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
