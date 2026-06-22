import type { District } from "../shared/data";

type Props = {
  districts: District[];
};

const riskClass = {
  Low: "text-green-700 bg-green-50 border-green-200",
  Medium: "text-amber-700 bg-amber-50 border-amber-200",
  High: "text-red-700 bg-red-50 border-red-200",
};

export default function SummaryCards({ districts }: Props) {
  const safeDistricts = districts.length > 0 ? districts : [];

  const activeRiskAreas = safeDistricts.filter(
    (district) => district.risk === "Medium" || district.risk === "High"
  ).length;

  const highestRainfall =
    safeDistricts.length > 0
      ? Math.max(
          ...safeDistricts.map(
            (district) => district.next3hRainfallMmHr ?? district.rainfall ?? 0
          )
        )
      : 0;

  const mostAffected =
    safeDistricts.length > 0
      ? [...safeDistricts].sort((a, b) => {
          const bScore = b.next3hRainfallMmHr ?? b.rainfall ?? 0;
          const aScore = a.next3hRainfallMmHr ?? a.rainfall ?? 0;
          return bScore - aScore;
        })[0]
      : null;

  const highDistricts = safeDistricts.filter(
    (district) => district.risk === "High"
  ).length;

  const mediumDistricts = safeDistricts.filter(
    (district) => district.risk === "Medium"
  ).length;

  const cityRisk =
    highDistricts >= 1 ? "High" : mediumDistricts >= 2 ? "Medium" : "Low";

  const cards = [
    {
      label: "Live Risk Areas",
      value: activeRiskAreas,
      sub: "districts with medium/high live risk",
    },
    {
      label: "Highest 3h Rain Signal",
      value: `${highestRainfall.toFixed(1)} mm/hr`,
      sub: "from live forecast data",
    },
    {
      label: "Most Affected District",
      value: mostAffected?.name ?? "Loading",
      sub: `${mostAffected?.trend ?? "loading"} rainfall trend`,
    },
    {
      label: "Overall City Risk",
      value: cityRisk,
      sub: "live weather-derived status",
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
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskClass[cityRisk]}`}
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