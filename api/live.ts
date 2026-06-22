import { fetchLiveBangkokData } from "../src/shared/weather";

export default async function handler(_req: any, res: any) {
  try {
    const liveData = await fetchLiveBangkokData();
    res.status(200).json(liveData);
  } catch (error) {
    res.status(500).json({
      error: "Live data request failed.",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}