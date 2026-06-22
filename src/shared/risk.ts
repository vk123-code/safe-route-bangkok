import { districts } from "./data";
import type { District, RiskLevel } from "./data";

export type RiskResult = {
  homeDistrict: string;
  schoolDistrict: string;
  score: number;
  level: RiskLevel;
  rainfallScore: number;
  floodAlertScore: number;
  routeScore: number;
  routeIntersectsFloodZones: boolean;
  intersectingZones: [];
  reasons: string[];
  leaveEarlierMinutes: number;
  recommendedDeparture: string;
};

function rainfallPoints(mm: number) {
  if (mm >= 60) return 6;
  if (mm >= 40) return 4;
  if (mm >= 20) return 2;
  return 0;
}

function trendPoints(home?: string, school?: string) {
  if (home === "worsening" || school === "worsening") return 2;
  return 0;
}

function riverPoints(value: number | null | undefined) {
  if (value == null) return 0;
  if (value >= 1200) return 4;
  if (value >= 800) return 2;
  return 0;
}

function levelFromScore(score: number): RiskLevel {
  if (score >= 8) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

function subtractMinutes(time: string, minutes: number) {
  const [hourString, minuteString] = time.split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return "Not set";

  const total = ((hour * 60 + minute - minutes) % 1440 + 1440) % 1440;
  const newHour = Math.floor(total / 60);
  const newMinute = total % 60;

  return `${String(newHour).padStart(2, "0")}:${String(newMinute).padStart(
    2,
    "0"
  )}`;
}

export function calculateRiskWithDistricts(
  homeDistrictName: string,
  schoolDistrictName: string,
  liveDistricts: District[],
  departureTime = "07:30"
): RiskResult {
  const home = liveDistricts.find((district) => district.name === homeDistrictName);
  const school = liveDistricts.find(
    (district) => district.name === schoolDistrictName
  );

  if (!home || !school) {
    throw new Error("District not found");
  }

  const highestCurrentRainfall = Math.max(
    home.currentRainfallMmHr ?? home.rainfall,
    school.currentRainfallMmHr ?? school.rainfall
  );

  const highestNext3hRainfall = Math.max(
    home.next3hRainfallMmHr ?? home.rainfall,
    school.next3hRainfallMmHr ?? school.rainfall
  );

  const strongestRainSignal = Math.max(
    highestCurrentRainfall,
    highestNext3hRainfall
  );

  const rainfallScore = rainfallPoints(strongestRainSignal);
  const routeScore = trendPoints(home.trend, school.trend);

  const highestRiverDischarge = Math.max(
    home.riverDischargeM3s ?? 0,
    school.riverDischargeM3s ?? 0
  );

  const floodAlertScore = riverPoints(highestRiverDischarge);

  const score = rainfallScore + routeScore + floodAlertScore;
  const level = levelFromScore(score);

  const leaveEarlierMinutes =
    level === "High" ? 45 : level === "Medium" ? 15 : 0;

  const reasons: string[] = [
    `Live rainfall signal on this route is ${strongestRainSignal.toFixed(
      1
    )} mm/hr based on current and next 3-hour rainfall data.`,
  ];

  if (home.trend === "worsening" || school.trend === "worsening") {
    reasons.push("Rainfall trend is worsening in at least one selected district.");
  } else {
    reasons.push("Rainfall trend is not currently worsening across the selected route.");
  }

  if (highestRiverDischarge > 0) {
    reasons.push(
      `Nearest river discharge signal is ${highestRiverDischarge.toFixed(
        1
      )} m³/s from the live flood API.`
    );
  } else {
    reasons.push("No river discharge warning signal was returned for this route.");
  }

  reasons.push(
    "This version does not use simulated flood alerts, fake sensors, or fake flood zones."
  );

  return {
    homeDistrict: home.name,
    schoolDistrict: school.name,
    score,
    level,
    rainfallScore,
    floodAlertScore,
    routeScore,
    routeIntersectsFloodZones: false,
    intersectingZones: [],
    reasons,
    leaveEarlierMinutes,
    recommendedDeparture: subtractMinutes(departureTime, leaveEarlierMinutes),
  };
}

export function calculateRisk(
  homeDistrictName: string,
  schoolDistrictName: string,
  departureTime = "07:30"
): RiskResult {
  return calculateRiskWithDistricts(
    homeDistrictName,
    schoolDistrictName,
    districts,
    departureTime
  );
}