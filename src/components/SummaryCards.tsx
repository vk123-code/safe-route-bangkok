import type { District, FloodZone } from "../shared/data";

type Props = {
  districts: District[];
  floodZones: FloodZone[];
};

const riskClass = {
  Low: "text-green-700 bg-green-50 border-green-200",
  Medium: "text-amber-700 bg-amber-50 border-amber-200",
  High: "text-red-700 bg-red-50 border-red-200",
};

export default function SummaryCards({ districts, floodZones }: Props) {
  const activeFloodAreas = floodZones.length;
  const highestRainfall = Math.max(...districts.map((district) => district.rainfall));
  const mostAffected = [...districts].sort(
    (a, b) => b.rainfall + b.alerts * 8 - (a.rainfall + a.alerts * 8)
  )[0];

  const highDistricts = districts.filter((district) => district.risk === "High").length;
  const cityRisk = highDistricts >= 2 ? "High" : highDistricts === 1 ? "Medium" : "Low";

  const cards = [
    {
      label: "Active Flood Areas",
      value: activeFloodAreas,
      sub: "mapped flood-prone zones",
    },
    {
      label: "Highest Rainfall",
      value: `${highestRainfall} mm/hr`,
      sub: "current district peak",
    },
    {
      label: "Most Affected District",
      value: mostAffected.name,
      sub: `${mostAffected.alerts} active alert(s)`,
    },
    {
      label: "Overall City Risk",
      value: cityRisk,
      sub: "rule-based city status",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="paper-card p-5">
          <p className="field-label">{card.label}</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <h3 className="text-2xl font-semibold tracking-tight text-[#1F2937]">
              {card.value}
            </h3>

            {card.label === "Overall City Risk" && (
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  riskClass[cityRisk]
                }`}
              >
                {cityRisk.toUpperCase()}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500">{card.sub}</p>
        </article>
      ))}
    </section>
  );
}