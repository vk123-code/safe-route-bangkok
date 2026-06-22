import { districts } from "./data";
import type { District, RainTrend, RainfallPoint, RiskLevel } from "./data";

type ForecastResponse = {
  current?: {
    time?: string;
    rain?: number;
    precipitation?: number;
  };
  hourly?: {
    time?: string[];
    rain?: Array<number | null>;
    precipitation?: Array<number | null>;
  };
};

type FloodResponse = {
  daily?: {
    time?: string[];
    river_discharge?: Array<number | null>;
  };
};

const BANGKOK_CENTER = {
  lat: 13.7563,
  lng: 100.5018,
};

function toBangkokTimestamp(openMeteoTime: string) {
  return new Date(`${openMeteoTime}:00+07:00`).getTime();
}

function rainfallRiskPoints(mm: number) {
  if (mm >= 60) return 6;
  if (mm >= 40) return 4;
  if (mm >= 20) return 2;
  return 0;
}

function riverRiskPoints(discharge: number | null) {
  if (discharge === null) return 0;
  if (discharge >= 1200) return 4;
  if (discharge >= 800) return 2;
  return 0;
}

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 8) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

function calculateTrend(points: RainfallPoint[]): RainTrend {
  if (points.length < 6) return "steady";

  const recent = points.slice(-3).reduce((sum, point) => sum + point.mm, 0);
  const previous = points.slice(-6, -3).reduce((sum, point) => sum + point.mm, 0);

  if (recent > previous + 3) return "worsening";
  if (recent < previous - 3) return "improving";
  return "steady";
}

async function fetchForecastForPoint(lat: number, lng: number) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: "rain,precipitation",
    hourly: "rain,precipitation",
    timezone: "Asia/Bangkok",
    past_days: "1",
    forecast_days: "1",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Open-Meteo forecast request failed");
  }

  return (await response.json()) as ForecastResponse;
}

async function fetchFloodForPoint(lat: number, lng: number) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    daily: "river_discharge",
    past_days: "1",
    forecast_days: "7",
  });

  const response = await fetch(
    `https://flood-api.open-meteo.com/v1/flood?${params.toString()}`
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as FloodResponse;

  const values = data.daily?.river_discharge ?? [];
  const validValues = values.filter(
    (value): value is number => typeof value === "number"
  );

  if (validValues.length === 0) return null;

  return validValues[0];
}

function extractRainfallPoints(data: ForecastResponse): RainfallPoint[] {
  const times = data.hourly?.time ?? [];
  const rain = data.hourly?.rain ?? [];
  const precipitation = data.hourly?.precipitation ?? [];

  const now = Date.now();

  return times
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

  const currentIndex = indexed.findLastIndex((point) => point.timestamp <= now);

  const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;

  const currentRainfall =
    data.current?.rain ??
    data.current?.precipitation ??
    indexed[safeCurrentIndex]?.mm ??
    0;

  const next3hRainfall = Math.max(
    ...indexed
      .slice(safeCurrentIndex, safeCurrentIndex + 4)
      .map((point) => point.mm),
    currentRainfall
  );

  const past6hRainfall = indexed
    .slice(Math.max(0, safeCurrentIndex - 5), safeCurrentIndex + 1)
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
      const [forecast, riverDischarge] = await Promise.all([
        fetchForecastForPoint(district.lat, district.lng),
        fetchFloodForPoint(district.lat, district.lng),
      ]);

      const districtRainfallTrend = extractRainfallPoints(forecast);
      const trend = calculateTrend(districtRainfallTrend);
      const rainStats = extractCurrentAndForecastRain(forecast);

      const rainScore = rainfallRiskPoints(
        Math.max(rainStats.currentRainfallMmHr, rainStats.next3hRainfallMmHr)
      );

      const trendScore = trend === "worsening" ? 2 : 0;
      const riverScore = riverRiskPoints(riverDischarge);

      const totalScore = rainScore + trendScore + riverScore;
      const risk = riskLevelFromScore(totalScore);

      return {
        ...district,
        rainfall: rainStats.currentRainfallMmHr,
        alerts: 0,
        risk,
        currentRainfallMmHr: rainStats.currentRainfallMmHr,
        next3hRainfallMmHr: rainStats.next3hRainfallMmHr,
        past6hRainfallMm: rainStats.past6hRainfallMm,
        riverDischargeM3s: riverDischarge,
        trend,
        dataSource: "Open-Meteo Forecast API + Open-Meteo Flood API",
        updatedAt: new Date().toISOString(),
      };
    })
  );

  return {
    districts: liveDistricts,
    rainfallTrend,
    cityTrend,
    source: "Open-Meteo Forecast API + Open-Meteo Flood API",
    updatedAt: new Date().toISOString(),
  };
}