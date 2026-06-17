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
          <p className="field-label">District Details</p>
          <h2 className="text-xl font-semibold">{activeDistrict.name}</h2>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${
            riskClass[activeDistrict.risk]
          }`}
        >
          {activeDistrict.risk.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="paper-card-soft p-4">
          <p className="field-label">Rainfall</p>
          <p className="mt-2 text-2xl font-semibold">{activeDistrict.rainfall}</p>
          <p className="text-sm text-gray-500">mm/hr</p>
        </div>

        <div className="paper-card-soft p-4">
          <p className="field-label">Alerts</p>
          <p className="mt-2 text-2xl font-semibold">{activeDistrict.alerts}</p>
          <p className="text-sm text-gray-500">active reports</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="field-label">Affected Roads</p>
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
        Click a district on the map to inspect localized rainfall, flood reports, and road-level commute risk.
      </p>
    </section>
  );
}