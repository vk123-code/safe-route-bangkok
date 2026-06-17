import { rainfallTrend } from "../src/shared/data";
import { fetchBangkokRainfallTrend } from "../src/shared/weather";

export default async function handler(_req: any, res: any) {
  try {
    const weather = await fetchBangkokRainfallTrend();
    res.status(200).json(weather);
  } catch {
    res.status(200).json({
      rainfallTrend,
      currentRainfallMmHr: rainfallTrend[rainfallTrend.length - 1].mm,
      source: "mock-data fallback",
      location: "Bangkok",
      note: "Open-Meteo request failed, so the app used fallback data.",
    });
  }
}