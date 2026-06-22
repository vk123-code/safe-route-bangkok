import { calculateRiskWithDistricts } from "../src/shared/risk";
import { fetchLiveBangkokData } from "../src/shared/weather";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { homeDistrict, schoolDistrict, departureTime } = body;

  try {
    const liveData = await fetchLiveBangkokData();

    const result = calculateRiskWithDistricts(
      homeDistrict,
      schoolDistrict,
      liveData.districts,
      departureTime
    );

    res.status(200).json(result);
  } catch {
    res.status(400).json({
      error: "Live commute risk calculation failed.",
    });
  }
}