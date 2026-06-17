import { calculateRisk } from "../src/shared/risk";

export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { homeDistrict, schoolDistrict, departureTime } = body;

  try {
    const result = calculateRisk(homeDistrict, schoolDistrict, departureTime);
    res.status(200).json(result);
  } catch {
    res.status(400).json({
      error: "Invalid district input.",
    });
  }
}