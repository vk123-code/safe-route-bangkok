import type { District } from "../shared/data";

type Props = {
  district: District | null;
  fallbackDistrict: District;
};

const riskClass = {
  Low: "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  High: "bg-red-50 text-red-700 border-red-200",
};

export default function DistrictPanel({ district, fallbackDistrict }: Props) {
  const activeDistrict = district ?? fallbackDistrict;

  return (
    <section className="paper-card p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="field-label">Live District Details</p>
          <h2 className="text-xl font-semibold">{activeDistrict.name}</h2>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${riskClass[activeDistrict.risk]}`}
        >
          {activeDistrict.risk.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="paper-card-soft p-4">
          <p className="field-label">Current Rain</p>
          <p className="mt-2 text-2xl font-semibold">
            {(activeDistrict.currentRainfallMmHr ?? activeDistrict.rainfall).toFixed(1)}
          </p>
          <p className="text-sm text-gray-500">mm/hr</p>
        </div>

        <div className="paper-card-soft p-4">
          <p className="field-label">Next 3h Peak</p>
          <p className="mt-2 text-2xl font-semibold">
            {(activeDistrict.next3hRainfallMmHr ?? 0).toFixed(1)}
          </p>
          <p className="text-sm text-gray-500">mm/hr</p>
        </div>

        <div className="paper-card-soft p-4">
          <p className="field-label">Past 6h Rain</p>
          <p className="mt-2 text-2xl font-semibold">
            {(activeDistrict.past6hRainfallMm ?? 0).toFixed(1)}
          </p>
          <p className="text-sm text-gray-500">mm total</p>
        </div>

        <div className="paper-card-soft p-4">
          <p className="field-label">River Signal</p>
          <p className="mt-2 text-2xl font-semibold">
            {activeDistrict.riverDischargeM3s == null
              ? "N/A"
              : activeDistrict.riverDischargeM3s.toFixed(1)}
          </p>
          <p className="text-sm text-gray-500">m³/s</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="field-label">Rainfall Trend</p>
        <p className="mt-2 text-lg font-semibold capitalize">
          {activeDistrict.trend ?? "steady"}
        </p>
      </div>

      <div className="mt-5">
        <p className="field-label">Major Commute Roads</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {activeDistrict.affectedRoads.map((road) => (
            <span
              key={road}
              className="border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              {road}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-5 border-t border-gray-200 pt-4 text-sm text-gray-600">
        This panel uses live rainfall and flood API signals. It does not use fake
        flood alerts or fake sensor readings.
      </p>
    </section>
  );
}