export type RiskLevel = "Low" | "Medium" | "High";

export type District = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rainfall: number;
  alerts: number;
  risk: RiskLevel;
  affectedRoads: string[];
  boundary: [number, number][];
};

export type FloodZone = {
  id: string;
  name: string;
  district: string;
  severity: "moderate" | "elevated" | "severe";
  lat: number;
  lng: number;
  radiusKm: number;
};

export type Sensor = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  waterLevelCm: number;
  status: "normal" | "watch" | "alert";
};

export type RainfallPoint = {
  time: string;
  mm: number;
};

const boundaryBox = (
  lat: number,
  lng: number,
  northSouth = 0.028,
  eastWest = 0.042
): [number, number][] => [
  [lat - northSouth, lng - eastWest],
  [lat - northSouth, lng + eastWest],
  [lat + northSouth, lng + eastWest],
  [lat + northSouth, lng - eastWest],
];

export const districts: District[] = [
  {
    id: "bang-kapi",
    name: "Bang Kapi",
    lat: 13.765,
    lng: 100.647,
    rainfall: 48,
    alerts: 3,
    risk: "Medium",
    affectedRoads: ["Ramkhamhaeng Road", "Lat Phrao Road", "Seri Thai Road"],
    boundary: boundaryBox(13.765, 100.647),
  },
  {
    id: "pathum-wan",
    name: "Pathum Wan",
    lat: 13.746,
    lng: 100.535,
    rainfall: 28,
    alerts: 1,
    risk: "Medium",
    affectedRoads: ["Phaya Thai Road", "Rama I Road"],
    boundary: boundaryBox(13.746, 100.535, 0.022, 0.032),
  },
  {
    id: "bang-khen",
    name: "Bang Khen",
    lat: 13.875,
    lng: 100.596,
    rainfall: 62,
    alerts: 7,
    risk: "High",
    affectedRoads: ["Phahonyothin Road", "Ramintra Road", "Chaeng Watthana Road"],
    boundary: boundaryBox(13.875, 100.596, 0.04, 0.05),
  },
  {
    id: "lat-phrao",
    name: "Lat Phrao",
    lat: 13.803,
    lng: 100.607,
    rainfall: 55,
    alerts: 5,
    risk: "High",
    affectedRoads: ["Lat Phrao Road", "Chok Chai 4", "Ratchadaphisek Road"],
    boundary: boundaryBox(13.803, 100.607),
  },
  {
    id: "huai-khwang",
    name: "Huai Khwang",
    lat: 13.769,
    lng: 100.574,
    rainfall: 42,
    alerts: 4,
    risk: "Medium",
    affectedRoads: ["Ratchadaphisek Road", "Pracha Songkhro Road"],
    boundary: boundaryBox(13.769, 100.574),
  },
  {
    id: "chatuchak",
    name: "Chatuchak",
    lat: 13.828,
    lng: 100.559,
    rainfall: 37,
    alerts: 2,
    risk: "Medium",
    affectedRoads: ["Vibhavadi Rangsit Road", "Kamphaeng Phet Road"],
    boundary: boundaryBox(13.828, 100.559),
  },
  {
    id: "khlong-toei",
    name: "Khlong Toei",
    lat: 13.722,
    lng: 100.56,
    rainfall: 18,
    alerts: 0,
    risk: "Low",
    affectedRoads: ["Rama IV Road"],
    boundary: boundaryBox(13.722, 100.56, 0.025, 0.035),
  },
  {
    id: "sathon",
    name: "Sathon",
    lat: 13.708,
    lng: 100.526,
    rainfall: 22,
    alerts: 1,
    risk: "Low",
    affectedRoads: ["Sathon Road", "Naradhiwas Road"],
    boundary: boundaryBox(13.708, 100.526, 0.025, 0.035),
  },
];

export const floodZones: FloodZone[] = [
  {
    id: "fz-ramkhamhaeng",
    name: "Ramkhamhaeng Canal Belt",
    district: "Bang Kapi",
    severity: "elevated",
    lat: 13.758,
    lng: 100.64,
    radiusKm: 1.7,
  },
  {
    id: "fz-lat-phrao-junction",
    name: "Lat Phrao Junction Basin",
    district: "Lat Phrao",
    severity: "severe",
    lat: 13.807,
    lng: 100.607,
    radiusKm: 2.1,
  },
  {
    id: "fz-ratchada-lowpoint",
    name: "Ratchada Lowpoint",
    district: "Huai Khwang",
    severity: "elevated",
    lat: 13.773,
    lng: 100.573,
    radiusKm: 1.3,
  },
  {
    id: "fz-vibhavadi",
    name: "Vibhavadi Drainage Corridor",
    district: "Chatuchak",
    severity: "moderate",
    lat: 13.835,
    lng: 100.558,
    radiusKm: 1.4,
  },
  {
    id: "fz-bang-khen",
    name: "Bang Khen North Watch Area",
    district: "Bang Khen",
    severity: "severe",
    lat: 13.878,
    lng: 100.602,
    radiusKm: 2.4,
  },
  {
    id: "fz-pathum-wan",
    name: "Central Retail Drainage Watch",
    district: "Pathum Wan",
    severity: "moderate",
    lat: 13.746,
    lng: 100.535,
    radiusKm: 0.9,
  },
];

export const sensors: Sensor[] = [
  {
    id: "s-01",
    name: "Khlong Saen Saep Sensor",
    lat: 13.755,
    lng: 100.612,
    waterLevelCm: 71,
    status: "watch",
  },
  {
    id: "s-02",
    name: "Lat Phrao Pump Station",
    lat: 13.81,
    lng: 100.604,
    waterLevelCm: 94,
    status: "alert",
  },
  {
    id: "s-03",
    name: "Pathum Wan Drainage Node",
    lat: 13.746,
    lng: 100.532,
    waterLevelCm: 52,
    status: "watch",
  },
  {
    id: "s-04",
    name: "Bang Khen Road Gauge",
    lat: 13.876,
    lng: 100.596,
    waterLevelCm: 104,
    status: "alert",
  },
];

export const rainfallTrend: RainfallPoint[] = [
  { time: "06:00", mm: 8 },
  { time: "07:00", mm: 12 },
  { time: "08:00", mm: 18 },
  { time: "09:00", mm: 24 },
  { time: "10:00", mm: 33 },
  { time: "11:00", mm: 42 },
  { time: "12:00", mm: 56 },
  { time: "13:00", mm: 62 },
  { time: "14:00", mm: 58 },
  { time: "15:00", mm: 44 },
  { time: "16:00", mm: 31 },
  { time: "17:00", mm: 26 },
];