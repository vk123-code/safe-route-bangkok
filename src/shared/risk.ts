import { districts, floodZones } from "./data";
import type { FloodZone, RiskLevel } from "./data";

type Point = {
  lat: number;
  lng: number;
};

export type RiskResult = {
  homeDistrict: string;
  schoolDistrict: string;
  score: number;
  level: RiskLevel;
  rainfallScore: number;
  floodAlertScore: number;
  routeScore: number;
  routeIntersectsFloodZones: boolean;
  intersectingZones: FloodZone[];
  reasons: string[];
  leaveEarlierMinutes: number;
  recommendedDeparture: string;
};

const rainfallPoints = (mm: number) => {
  if (mm >= 60) return 6;
  if (mm >= 40) return 4;
  if (mm >= 20) return 2;
  return 0;
};

const alertPoints = (alerts: number) => {
  if (alerts >= 7) return 6;
  if (alerts >= 4) return 4;
  if (alerts >= 1) return 2;
  return 0;
};

const levelFromScore = (score: number): RiskLevel => {
  if (score >= 12) return "High";
  if (score >= 6) return "Medium";
  return "Low";
};

const pointToSegmentDistanceKm = (point: Point, start: Point, end: Point) => {
  const originLat = ((point.lat + start.lat + end.lat) / 3) * (Math.PI / 180);
  const kmPerLat = 111;
  const kmPerLng = 111 * Math.cos(originLat);

  const p = { x: point.lng * kmPerLng, y: point.lat * kmPerLat };
  const a = { x: start.lng * kmPerLng, y: start.lat * kmPerLat };
  const b = { x: end.lng * kmPerLng, y: end.lat * kmPerLat };

  const dx = b.x - a.x;
  const dy = b.y - a.y;

  if (dx === 0 && dy === 0) {
    return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
  }

  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));

  const nearest = {
    x: a.x + t * dx,
    y: a.y + t * dy,
  };

  return Math.sqrt((p.x - nearest.x) ** 2 + (p.y - nearest.y) ** 2);
};

const routeIntersections = (home: Point, school: Point) => {
  return floodZones.filter((zone) => {
    const distance = pointToSegmentDistanceKm(
      { lat: zone.lat, lng: zone.lng },
      home,
      school
    );

    return distance <= zone.radiusKm;
  });
};

const subtractMinutes = (time: string, minutes: number) => {
  const [hourString, minuteString] = time.split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return "Not set";

  const total = ((hour * 60 + minute - minutes) % 1440 + 1440) % 1440;
  const newHour = Math.floor(total / 60);
  const newMinute = total % 60;

  return `${String(newHour).padStart(2, "0")}:${String(newMinute).padStart(2, "0")}`;
};

export const calculateRisk = (
  homeDistrictName: string,
  schoolDistrictName: string,
  departureTime = "07:30"
): RiskResult => {
  const home = districts.find((district) => district.name === homeDistrictName);
  const school = districts.find((district) => district.name === schoolDistrictName);

  if (!home || !school) {
    throw new Error("District not found");
  }

  const highestRouteRainfall = Math.max(home.rainfall, school.rainfall);
  const totalAlerts = home.alerts + school.alerts;
  const intersectingZones = routeIntersections(home, school);

  const rainfallScore = rainfallPoints(highestRouteRainfall);
  const floodAlertScore = alertPoints(totalAlerts);
  const routeScore = intersectingZones.length > 0 ? 5 : 0;

  const score = rainfallScore + floodAlertScore + routeScore;
  const level = levelFromScore(score);

  const leaveEarlierMinutes = level === "High" ? 45 : level === "Medium" ? 15 : 0;

  const reasons: string[] = [];

  if (highestRouteRainfall >= 60) {
    reasons.push(`Rainfall is severe on this commute corridor at ${highestRouteRainfall} mm/hr.`);
  } else if (highestRouteRainfall >= 40) {
    reasons.push(`Rainfall is elevated on this commute corridor at ${highestRouteRainfall} mm/hr.`);
  } else if (highestRouteRainfall >= 20) {
    reasons.push(`Rainfall is moderate on this commute corridor at ${highestRouteRainfall} mm/hr.`);
  } else {
    reasons.push(`Rainfall is currently light at ${highestRouteRainfall} mm/hr.`);
  }

  if (totalAlerts > 0) {
    reasons.push(`${totalAlerts} flood alert(s) are active across the home and school districts.`);
  } else {
    reasons.push("No flood alerts are active in the selected districts.");
  }

  if (intersectingZones.length > 0) {
    reasons.push(
      `The route intersects ${intersectingZones.length} flood-prone zone(s): ${intersectingZones
        .map((zone) => zone.name)
        .join(", ")}.`
    );
  } else {
    reasons.push("The route does not intersect a mapped flood-prone zone.");
  }

  return {
    homeDistrict: home.name,
    schoolDistrict: school.name,
    score,
    level,
    rainfallScore,
    floodAlertScore,
    routeScore,
    routeIntersectsFloodZones: intersectingZones.length > 0,
    intersectingZones,
    reasons,
    leaveEarlierMinutes,
    recommendedDeparture: subtractMinutes(departureTime, leaveEarlierMinutes),
  };
};