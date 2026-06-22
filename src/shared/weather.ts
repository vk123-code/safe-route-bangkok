import { districts } from "./data";
import type { District, RainTrend, RainfallPoint, RiskLevel } from "./data";

type ForecastResponse = {
  hourly?: {
    time?: string[];
    rain?: Array<number | null>;
    precipitation?: Array<number | null>;
  };
};

const BANGKOK_CENTER = {
  lat: 13.7563,
  lng: 100.5018,
};

function toBangkokTimestamp(openMeteoTime: string) {
  return new Date(`${openMeteoTime}:00+07:00`).getTime();
}

function calculateTrend(points: RainfallPoint[]): RainTrend {
  if (points.length < 6) return "steady";

  const recent = points.slice(-3).reduce((sum, point) => sum + point.mm, 0);
  const previous = points.slice(-6, -3).reduce((sum, point) => sum + point.mm, 0);

  if (recent > previous + 2) return "worsening";
  if (recent < previous - 2) return "improving";
  return "steady";
}

function riskLevelFromRain(currentRain: number, next3hRain: number, trend: RainTrend): RiskLevel {
  const strongestSignal = Math.max(currentRain, next3hRain);

  let score = 0;

  if (strongestSignal >= 60) score += 6;
  else if (strongestSignal >= 40) score += 4;
  else if (strongestSignal >= 20) score += 2;

  if (trend === "worsening") score += 2;

  if (score >= 6) return "High";
  if (score >= 2) return "Medium";
  return "Low";
}

async function fetchForecastForPoint(lat: number, lng: number): Promise<ForecastResponse> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    hourly: "rain,precipitation",
    timezone: "Asia/Bangkok",
    past_days: "1",
    forecast_days: "1",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with status ${response.status}`);
  }

  return (await response.json()) as ForecastResponse;
}

function extractRainfallPoints(data: ForecastResponse): RainfallPoint[] {
  const times = data.hourly?.time ?? [];
  const rain = data.hourly?.rain ?? [];
  const precipitation = data.hourly?.precipitation ?? [];
  const now = Date.now();

  const points = times
    .map((time, index) => {
      const rawRain = rain[index] ?? precipitation[index] ?? 0;

      return {
        timestamp: toBangkokTimestamp(time),
        time: time.includes("T") ? time.split("T")[1].slice(0, 5) : time,
        mm: Number(rawRain.toFixed(1)),
      };
    })
    .filter((point) => point.timestamp <= now)
    .slice(-12)
    .map(({ time, mm }) => ({ time, mm }));

  if (points.length === 0) {
    return [{ time: "No data", mm: 0 }];
  }

  return points;
}

function extractCurrentAndForecastRain(data: ForecastResponse) {
  const times = data.hourly?.time ?? [];
  const rain = data.hourly?.rain ?? [];
  const precipitation = data.hourly?.precipitation ?? [];

  const now = Date.now();

  const indexed = times.map((time, index) => ({
    timestamp: toBangkokTimestamp(time),
    mm: Number((rain[index] ?? precipitation[index] ?? 0).toFixed(1)),
  }));

  let currentIndex = 0;

  for (let i = 0; i < indexed.length; i += 1) {
    if (indexed[i].timestamp <= now) {
      currentIndex = i;
    }
  }

  const currentRainfall = indexed[currentIndex]?.mm ?? 0;

  const nextFewHours = indexed
    .slice(currentIndex, currentIndex + 4)
    .map((point) => point.mm);

  const next3hRainfall = Math.max(currentRainfall, ...nextFewHours);

  const past6hRainfall = indexed
    .slice(Math.max(0, currentIndex - 5), currentIndex + 1)
    .reduce((sum, point) => sum + point.mm, 0);

  return {
    currentRainfallMmHr: Number(currentRainfall.toFixed(1)),
    next3hRainfallMmHr: Number(next3hRainfall.toFixed(1)),
    past6hRainfallMm: Number(past6hRainfall.toFixed(1)),
  };
}

export async function fetchLiveBangkokData() {
  const cityForecast = await fetchForecastForPoint(
    BANGKOK_CENTER.lat,
    BANGKOK_CENTER.lng
  );

  const rainfallTrend = extractRainfallPoints(cityForecast);
  const cityTrend = calculateTrend(rainfallTrend);

  const liveDistricts: District[] = await Promise.all(
    districts.map(async (district) => {
      const forecast = await fetchForecastForPoint(district.lat, district.lng);
      const districtRainfallTrend = extractRainfallPoints(forecast);
      const trend = calculateTrend(districtRainfallTrend);
      const rainStats = extractCurrentAndForecastRain(forecast);

      const risk = riskLevelFromRain(
        rainStats.currentRainfallMmHr,
        rainStats.next3hRainfallMmHr,
        trend
      );

      return {
        ...district,
        rainfall: rainStats.currentRainfallMmHr,
        alerts: 0,
        risk,
        currentRainfallMmHr: rainStats.currentRainfallMmHr,
        next3hRainfallMmHr: rainStats.next3hRainfallMmHr,
        past6hRainfallMm: rainStats.past6hRainfallMm,
        riverDischargeM3s: null,
        trend,
        dataSource: "Open-Meteo Forecast API",
        updatedAt: new Date().toISOString(),
      };
    })
  );

  return {
    districts: liveDistricts,
    rainfallTrend,
    cityTrend,
    source: "Open-Meteo Forecast API",
    updatedAt: new Date().toISOString(),
  };
}