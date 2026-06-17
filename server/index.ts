import express from "express";
import cors from "cors";
import { districts, floodZones, rainfallTrend, sensors } from "../src/shared/data";
import { calculateRisk } from "../src/shared/risk";
import { fetchBangkokRainfallTrend } from "../src/shared/weather";

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.get("/api/districts", (_req, res) => {
  res.json(districts);
});

app.get("/api/floods", (_req, res) => {
  res.json({
    zones: floodZones,
    sensors,
  });
});

app.get("/api/weather", async (_req, res) => {
  try {
    const weather = await fetchBangkokRainfallTrend();
    res.json(weather);
  } catch {
    res.json({
      rainfallTrend,
      currentRainfallMmHr: rainfallTrend[rainfallTrend.length - 1].mm,
      source: "mock-data fallback",
      location: "Bangkok",
      note: "Open-Meteo request failed, so the app used fallback data.",
    });
  }
});

app.post("/api/risk", (req, res) => {
  const { homeDistrict, schoolDistrict, departureTime } = req.body;

  try {
    const result = calculateRisk(homeDistrict, schoolDistrict, departureTime);
    res.json(result);
  } catch {
    res.status(400).json({
      error: "Invalid district input.",
    });
  }
});

app.listen(port, () => {
  console.log(`Safe Route Bangkok API running on http://localhost:${port}`);
});