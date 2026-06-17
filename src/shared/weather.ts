import { rainfallTrend } from "./data";
import type { RainfallPoint } from "./data";

type OpenMeteoResponse = {
  hourly?: {
    time?: string[];
    rain?: Array<number | null>;
    precipitation?: Array<number | null>;
  };
};

const BANGKOK_LAT = "13.7563";
const BANGKOK_LNG = "100.5018";

const fallbackWeather = {
  rainfallTrend,
  currentRainfallMmHr: rainfallTrend[rainfallTrend.length - 1].mm,
  source: "mock-data fallback",
  location: "Bangkok",
};

export async function fetchBangkokRainfallTrend() {
  const params = new URLSearchParams({
    latitude: BANGKOK_LAT,
    longitude: BANGKOK_LNG,
    hourly: "rain,precipitation",
    timezone: "Asia/Bangkok",
    past_days: "1",
    forecast_days: "1",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Open-Meteo weather request failed");
  }

  const data = (await response.json()) as OpenMeteoResponse;

  const times = data.hourly?.time ?? [];
  const rain = data.hourly?.rain ?? [];
  const precipitation = data.hourly?.precipitation ?? [];

  if (times.length === 0) {
    return fallbackWeather;
  }

  const now = Date.now();

  const points = times
    .map((time, index) => {
      const rainValue = rain[index] ?? precipitation[index] ?? 0;

      return {
        rawTime: time,
        timestamp: new Date(`${time}+07:00`).getTime(),
        mm: Number(rainValue.toFixed(1)),
      };
    })
    .filter((point) => point.timestamp <= now)
    .slice(-12);

  const rainfallPoints: RainfallPoint[] = points.map((point) => ({
    time: point.rawTime.includes("T")
      ? point.rawTime.split("T")[1].slice(0, 5)
      : point.rawTime,
    mm: point.mm,
  }));

  if (rainfallPoints.length === 0) {
    return fallbackWeather;
  }

  return {
    rainfallTrend: rainfallPoints,
    currentRainfallMmHr: rainfallPoints[rainfallPoints.length - 1].mm,
    source: "Open-Meteo Forecast API",
    location: "Bangkok",
  };
}