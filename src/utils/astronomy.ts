// ── Moon Phase ───────────────────────────────────────────────────────────────

const SYNODIC_PERIOD = 29.53058867; // days
// Reference new moon: Jan 6, 2000 at 18:14 UTC
const REFERENCE_NEW_MOON = new Date("2000-01-06T18:14:00Z").getTime();

export interface MoonPhaseData {
  phase: number;         // days since last new moon (0–29.53)
  name: string;
  emoji: string;
  illumination: number;  // 0–100 %
  daysToFull: number;
  daysToNew: number;
}

export function getMoonPhase(date: Date = new Date()): MoonPhaseData {
  const daysSince = (date.getTime() - REFERENCE_NEW_MOON) / 86_400_000;
  const phase = ((daysSince % SYNODIC_PERIOD) + SYNODIC_PERIOD) % SYNODIC_PERIOD;
  const illumination = Math.round(((1 - Math.cos((phase / SYNODIC_PERIOD) * 2 * Math.PI)) / 2) * 100);

  const daysToFull = phase <= 14.765 ? 14.765 - phase : SYNODIC_PERIOD - phase + 14.765;
  const daysToNew = SYNODIC_PERIOD - phase;

  let name: string;
  let emoji: string;
  if (phase < 1.85)       { name = "New Moon";        emoji = "🌑"; }
  else if (phase < 7.38)  { name = "Waxing Crescent"; emoji = "🌒"; }
  else if (phase < 9.22)  { name = "First Quarter";   emoji = "🌓"; }
  else if (phase < 14.77) { name = "Waxing Gibbous";  emoji = "🌔"; }
  else if (phase < 16.61) { name = "Full Moon";       emoji = "🌕"; }
  else if (phase < 22.15) { name = "Waning Gibbous";  emoji = "🌖"; }
  else if (phase < 23.99) { name = "Last Quarter";    emoji = "🌗"; }
  else                    { name = "Waning Crescent";  emoji = "🌘"; }

  return { phase, name, emoji, illumination, daysToFull, daysToNew };
}

// ── Golden Hour / Blue Hour ──────────────────────────────────────────────────

export interface GoldenHourData {
  morningBlueStart: string;
  morningBlueEnd: string;
  morningGoldStart: string;
  morningGoldEnd: string;
  eveningGoldStart: string;
  eveningGoldEnd: string;
  eveningBlueStart: string;
  eveningBlueEnd: string;
}

function shiftTime(isoStr: string, minutes: number): string {
  const d = new Date(isoStr);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function getGoldenHours(sunriseIso: string, sunsetIso: string): GoldenHourData {
  return {
    morningBlueStart:  shiftTime(sunriseIso, -30),
    morningBlueEnd:    shiftTime(sunriseIso,   0),
    morningGoldStart:  shiftTime(sunriseIso,   0),
    morningGoldEnd:    shiftTime(sunriseIso,  60),
    eveningGoldStart:  shiftTime(sunsetIso,  -60),
    eveningGoldEnd:    shiftTime(sunsetIso,    0),
    eveningBlueStart:  shiftTime(sunsetIso,    0),
    eveningBlueEnd:    shiftTime(sunsetIso,   30),
  };
}

// ── Solar Eclipses ───────────────────────────────────────────────────────────

export interface SolarEclipse {
  date: string;
  displayDate: string;
  type: "Total" | "Annular" | "Hybrid" | "Partial";
  regions: string;
  daysUntil: number;
}

const ECLIPSE_TABLE: { date: string; type: SolarEclipse["type"]; regions: string }[] = [
  { date: "2026-08-12", type: "Total",   regions: "Arctic, Greenland, Spain, West Africa" },
  { date: "2027-08-02", type: "Total",   regions: "Morocco, Egypt, Saudi Arabia, India" },
  { date: "2028-07-22", type: "Total",   regions: "Australia, New Zealand" },
  { date: "2030-06-01", type: "Annular", regions: "Europe, North Africa, Central Asia" },
  { date: "2030-11-25", type: "Total",   regions: "Namibia, South Africa, Indian Ocean" },
  { date: "2031-05-21", type: "Annular", regions: "NW Africa, Mediterranean, Arabian Peninsula" },
  { date: "2033-03-30", type: "Total",   regions: "Alaska, Siberia" },
  { date: "2034-03-20", type: "Total",   regions: "Central Africa, Saudi Arabia, India, China" },
  { date: "2035-09-02", type: "Total",   regions: "China, Korea, Japan, Pacific" },
];

export function getNextSolarEclipse(now: Date = new Date()): SolarEclipse {
  for (const e of ECLIPSE_TABLE) {
    const eDate = new Date(e.date + "T12:00:00Z");
    const daysUntil = Math.ceil((eDate.getTime() - now.getTime()) / 86_400_000);
    if (daysUntil >= 0) {
      const displayDate = eDate.toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      });
      return { ...e, displayDate, daysUntil };
    }
  }
  const last = ECLIPSE_TABLE[ECLIPSE_TABLE.length - 1];
  return { ...last, displayDate: last.date, daysUntil: 0 };
}

// ── Meteor Showers ───────────────────────────────────────────────────────────

export interface MeteorShower {
  name: string;
  peakDate: string;
  daysUntil: number;
  hourlyRate: number;
  description: string;
}

const SHOWERS: { name: string; month: number; day: number; rate: number; desc: string }[] = [
  { name: "Quadrantids", month: 1,  day:  3, rate: 120, desc: "Swift blue meteors from asteroid 2003 EH1" },
  { name: "Lyrids",      month: 4,  day: 22, rate:  18, desc: "Debris from Comet Thatcher, one of the oldest showers" },
  { name: "Eta Aquariids", month: 5, day: 6, rate:  50, desc: "Halley's Comet debris, best in the southern hemisphere" },
  { name: "Perseids",    month: 8,  day: 12, rate: 100, desc: "Most popular shower — bright fast meteors from Comet Swift-Tuttle" },
  { name: "Orionids",    month: 10, day: 21, rate:  20, desc: "More of Halley's Comet, noted for glowing persistent trains" },
  { name: "Leonids",     month: 11, day: 17, rate:  15, desc: "Comet Tempel-Tuttle — famous for historic meteor storms" },
  { name: "Geminids",    month: 12, day: 13, rate: 120, desc: "Best annual shower — slow brilliant fireballs from asteroid Phaethon" },
];

export function getNextMeteorShower(now: Date = new Date()): MeteorShower {
  for (let offset = 0; offset <= 1; offset++) {
    const year = now.getFullYear() + offset;
    for (const s of SHOWERS) {
      const peak = new Date(year, s.month - 1, s.day, 12, 0, 0);
      const daysUntil = Math.ceil((peak.getTime() - now.getTime()) / 86_400_000);
      if (daysUntil >= -1) {
        return {
          name: s.name,
          peakDate: peak.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          daysUntil: Math.max(0, daysUntil),
          hourlyRate: s.rate,
          description: s.desc,
        };
      }
    }
  }
  // Wrap to next Quadrantids (should never reach here within 1-year offset)
  const next = new Date(now.getFullYear() + 1, 0, 3, 12, 0, 0);
  return {
    name: "Quadrantids",
    peakDate: next.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    daysUntil: Math.ceil((next.getTime() - now.getTime()) / 86_400_000),
    hourlyRate: 120,
    description: "Swift blue meteors from asteroid 2003 EH1",
  };
}

// ── Stargazing Index ─────────────────────────────────────────────────────────

export interface StargazingIndex {
  score: number;   // 0–10
  label: string;
  color: string;
  tip: string;
}

export function getStargazingIndex(cloudCover: number): StargazingIndex {
  const score = Math.round((1 - cloudCover / 100) * 10);
  if (score >= 9) return { score, label: "Perfect",      color: "#a78bfa", tip: "Galaxy visible to the naked eye" };
  if (score >= 7) return { score, label: "Excellent",    color: "#818cf8", tip: "Great night for astrophotography" };
  if (score >= 5) return { score, label: "Good",         color: "#60a5fa", tip: "Most stars clearly visible" };
  if (score >= 3) return { score, label: "Fair",         color: "#fbbf24", tip: "Bright stars and planets only" };
  if (score >= 1) return { score, label: "Poor",         color: "#fb923c", tip: "Heavy cloud cover tonight" };
  return          { score, label: "Clouded Out",         color: "#f87171", tip: "No stars visible tonight" };
}
