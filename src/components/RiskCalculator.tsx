import { useEffect, useState } from "react";
import { calculateRiskWithDistricts } from "../shared/risk";
import type { District } from "../shared/data";
import type { RiskResult } from "../shared/risk";

type Props = {
  districts: District[];
  onResult: (result: RiskResult) => void;
  onRouteChange: (home: string, school: string) => void;
};

const badgeClass = {
  Low: "bg-green-700 text-white",
  Medium: "bg-amber-600 text-white",
  High: "bg-red-600 text-white",
};

export default function RiskCalculator({
  districts,
  onResult,
  onRouteChange,
}: Props) {
  const [homeDistrict, setHomeDistrict] = useState("Bang Kapi");
  const [schoolDistrict, setSchoolDistrict] = useState("Pathum Wan");
  const [departureTime, setDepartureTime] = useState("09:30");
  const [result, setResult] = useState<RiskResult | null>(null);

  const runCalculation = () => {
    if (districts.length === 0) return;

    onRouteChange(homeDistrict, schoolDistrict);

    const localResult = calculateRiskWithDistricts(
      homeDistrict,
      schoolDistrict,
      districts,
      departureTime
    );

    setResult(localResult);
    onResult(localResult);
  };

  useEffect(() => {
    runCalculation();
  }, [districts, homeDistrict, schoolDistrict, departureTime]);

  return (
    <section className="paper-card p-5">
      <div className="mb-5">
        <p className="field-label">Commute Risk Calculator</p>
        <h2 className="text-xl font-semibold">Check my school route</h2>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="field-label">Home District</span>
          <select
            value={homeDistrict}
            onChange={(event) => setHomeDistrict(event.target.value)}
            className="mt-2 w-full border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#005A9C]"
          >
            {districts.map((district) => (
              <option key={district.id}>{district.name}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="field-label">School District</span>
          <select
            value={schoolDistrict}
            onChange={(event) => setSchoolDistrict(event.target.value)}
            className="mt-2 w-full border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#005A9C]"
          >
            {districts.map((district) => (
              <option key={district.id}>{district.name}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="field-label">Departure Time</span>
          <input
            type="time"
            value={departureTime}
            onChange={(event) => setDepartureTime(event.target.value)}
            className="mt-2 w-full border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#005A9C]"
          />
        </label>

        <button
          onClick={runCalculation}
          className="w-full bg-[#005A9C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#004577]"
        >
          Calculate live commute risk
        </button>
      </div>

      {result && (
        <div className="mt-6 border-t border-gray-200 pt-5">
          <div className="flex items-center justify-between gap-4">
            <p className="field-label">Commute Risk</p>
            <span
              className={`rounded-full px-4 py-2 text-sm font-bold ${badgeClass[result.level]}`}
            >
              {result.level.toUpperCase()}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="paper-card-soft p-3">
              <p className="field-label">Rain</p>
              <p className="text-lg font-semibold">{result.rainfallScore}</p>
            </div>

            <div className="paper-card-soft p-3">
              <p className="field-label">Alerts</p>
              <p className="text-lg font-semibold">{result.floodAlertScore}</p>
            </div>

            <div className="paper-card-soft p-3">
              <p className="field-label">Trend</p>
              <p className="text-lg font-semibold">{result.routeScore}</p>
            </div>
          </div>

          <div className="mt-5 route-stamp p-4">
            <p className="field-label text-[#005A9C]">Recommended Departure</p>
            <p className="mt-1 text-2xl font-semibold">
              {result.recommendedDeparture}
            </p>
            <p className="mt-1 text-sm">
              {result.leaveEarlierMinutes === 0
                ? "No time adjustment needed because current live rainfall risk is low."
                : `Leave ${result.leaveEarlierMinutes} minutes earlier than planned.`}
            </p>
          </div>

          <ul className="mt-5 space-y-2 text-sm text-gray-700">
            {result.reasons.map((reason) => (
              <li key={reason} className="border-l-2 border-[#005A9C] pl-3">
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}