import express from "express";
import cors from "cors";
import { districts, floodZones, sensors } from "../src/shared/data";
import { calculateRiskWithDistricts } from "../src/shared/risk";
import { fetchLiveBangkokData } from "../src/shared/weather";

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.get("/api/live", async (_req, res) => {
  try {
    const liveData = await fetchLiveBangkokData();
    res.json(liveData);
  } catch {
    res.status(500).json({
      error: "Live data request failed.",
    });
  }
});

app.get("/api/districts", async (_req, res) => {
  try {
    const liveData = await fetchLiveBangkokData();
    res.json(liveData.districts);
  } catch {
    res.json(districts);
  }
});

app.get("/api/floods", (_req, res) => {
  res.json({
    zones: floodZones,
    sensors,
    note: "No simulated flood zones or fake sensors are used in the live-data version.",
  });
});

app.get("/api/weather", async (_req, res) => {
  try {
    const liveData = await fetchLiveBangkokData();
    res.json({
      rainfallTrend: liveData.rainfallTrend,
      source: liveData.source,
      updatedAt: liveData.updatedAt,
    });
  } catch {
    res.status(500).json({
      error: "Live weather request failed.",
    });
  }
});

app.post("/api/risk", async (req, res) => {
  const { homeDistrict, schoolDistrict, departureTime } = req.body;

  try {
    const liveData = await fetchLiveBangkokData();

    const result = calculateRiskWithDistricts(
      homeDistrict,
      schoolDistrict,
      liveData.districts,
      departureTime
    );

    res.json(result);
  } catch {
    res.status(400).json({
      error: "Live commute risk calculation failed.",
    });
  }
});

app.listen(port, () => {
  console.log(`Safe Route Bangkok API running on http://localhost:${port}`);
});