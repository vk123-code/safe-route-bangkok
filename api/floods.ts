import { floodZones, sensors } from "../src/shared/data";

export default function handler(_req: any, res: any) {
  res.status(200).json({
    zones: floodZones,
    sensors,
  });
}