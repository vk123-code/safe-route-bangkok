export type RiskLevel = "Low" | "Medium" | "High";

export type RainTrend = "improving" | "steady" | "worsening";

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

  currentRainfallMmHr?: number;
  next3hRainfallMmHr?: number;
  past6hRainfallMm?: number;
  riverDischargeM3s?: number | null;
  trend?: RainTrend;
  dataSource?: string;
  updatedAt?: string;
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
    rainfall: 0,
    alerts: 0,
    risk: "Low",
    affectedRoads: ["Ramkhamhaeng Road", "Lat Phrao Road", "Seri Thai Road"],
    boundary: boundaryBox(13.765, 100.647),
  },
  {
    id: "pathum-wan",
    name: "Pathum Wan",
    lat: 13.746,
    lng: 100.535,
    rainfall: 0,
    alerts: 0,
    risk: "Low",
    affectedRoads: ["Phaya Thai Road", "Rama I Road"],
    boundary: boundaryBox(13.746, 100.535, 0.022, 0.032),
  },
  {
    id: "bang-khen",
    name: "Bang Khen",
    lat: 13.875,
    lng: 100.596,
    rainfall: 0,
    alerts: 0,
    risk: "Low",
    affectedRoads: ["Phahonyothin Road", "Ramintra Road", "Chaeng Watthana Road"],
    boundary: boundaryBox(13.875, 100.596, 0.04, 0.05),
  },
  {
    id: "lat-phrao",
    name: "Lat Phrao",
    lat: 13.803,
    lng: 100.607,
    rainfall: 0,
    alerts: 0,
    risk: "Low",
    affectedRoads: ["Lat Phrao Road", "Chok Chai 4", "Ratchadaphisek Road"],
    boundary: boundaryBox(13.803, 100.607),
  },
  {
    id: "huai-khwang",
    name: "Huai Khwang",
    lat: 13.769,
    lng: 100.574,
    rainfall: 0,
    alerts: 0,
    risk: "Low",
    affectedRoads: ["Ratchadaphisek Road", "Pracha Songkhro Road"],
    boundary: boundaryBox(13.769, 100.574),
  },
  {
    id: "chatuchak",
    name: "Chatuchak",
    lat: 13.828,
    lng: 100.559,
    rainfall: 0,
    alerts: 0,
    risk: "Low",
    affectedRoads: ["Vibhavadi Rangsit Road", "Kamphaeng Phet Road"],
    boundary: boundaryBox(13.828, 100.559),
  },
  {
    id: "khlong-toei",
    name: "Khlong Toei",
    lat: 13.722,
    lng: 100.56,
    rainfall: 0,
    alerts: 0,
    risk: "Low",
    affectedRoads: ["Rama IV Road", "Sukhumvit Road"],
    boundary: boundaryBox(13.722, 100.56, 0.025, 0.035),
  },
  {
    id: "sathon",
    name: "Sathon",
    lat: 13.708,
    lng: 100.526,
    rainfall: 0,
    alerts: 0,
    risk: "Low",
    affectedRoads: ["Sathon Road", "Naradhiwas Road"],
    boundary: boundaryBox(13.708, 100.526, 0.025, 0.035),
  },
];

export const floodZones: FloodZone[] = [];
export const sensors: Sensor[] = [];

export const rainfallTrend: RainfallPoint[] = [
  { time: "Loading", mm: 0 },
];