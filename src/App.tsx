import { useEffect, useMemo, useState } from "react";
import FloodMap from "./components/FloodMap";
import SummaryCards from "./components/SummaryCards";
import RiskCalculator from "./components/RiskCalculator";
import RainfallChart from "./components/RainfallChart";
import DistrictPanel from "./components/DistrictPanel";
import {
  districts,
  floodZones,
  rainfallTrend as fallbackRainfallTrend,
  sensors,
} from "./shared/data";
import { calculateRisk } from "./shared/risk";
import type { District } from "./shared/data";
import type { RiskResult } from "./shared/risk";

export default function App() {
  const [homeDistrict, setHomeDistrict] = useState("Bang Kapi");
  const [schoolDistrict, setSchoolDistrict] = useState("Pathum Wan");
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

  const [riskResult, setRiskResult] = useState<RiskResult>(
    calculateRisk("Bang Kapi", "Pathum Wan", "07:30")
  );

  const [weatherRainfallTrend, setWeatherRainfallTrend] =
    useState(fallbackRainfallTrend);

  const [weatherSource, setWeatherSource] = useState("mock-data");

  const fallbackDistrict = useMemo(() => {
    return [...districts].sort(
      (a, b) => b.rainfall + b.alerts * 8 - (a.rainfall + a.alerts * 8)
    )[0];
  }, []);

  useEffect(() => {
    async function loadWeather() {
      try {
        const response = await fetch("/api/weather");

        if (!response.ok) {
          throw new Error("Weather API failed");
        }

        const data = await response.json();

        setWeatherRainfallTrend(data.rainfallTrend ?? fallbackRainfallTrend);
        setWeatherSource(data.source ?? "Open-Meteo Forecast API");
      } catch {
        setWeatherRainfallTrend(fallbackRainfallTrend);
        setWeatherSource("mock-data fallback");
      }
    }

    loadWeather();
  }, []);

  return (
    <main className="min-h-screen text-[#1F2937]">
      <header className="border-b border-gray-300 bg-[#F5F5F5]/95 px-5 py-5 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="mono border border-[#005A9C] px-2 py-1 text-xs font-semibold text-[#005A9C]">
                BKK-FLOOD-COMMUTE
              </span>
              <span className="mono text-xs text-gray-500">
                student dashboard / live rainfall + mock flood feed
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
              Safe Route{" "}
              <span className="display-serif italic text-[#005A9C]">
                Bangkok
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-base text-gray-600 md:text-lg">
              A student commute flood-risk dashboard that converts rainfall,
              flood zones, and district alerts into clear route guidance.
            </p>
          </div>

          <div className="paper-card-soft max-w-sm p-4">
            <p className="field-label">Current Route</p>
            <p className="mt-2 text-lg font-semibold">
              {riskResult.homeDistrict} → {riskResult.schoolDistrict}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Score {riskResult.score}/17 · {riskResult.level} risk
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 md:px-8">
        <SummaryCards districts={districts} floodZones={floodZones} />

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.55fr_0.85fr]">
          <FloodMap
            districts={districts}
            floodZones={floodZones}
            sensors={sensors}
            homeDistrict={homeDistrict}
            schoolDistrict={schoolDistrict}
            onSelectDistrict={setSelectedDistrict}
          />

          <RiskCalculator
            onResult={setRiskResult}
            onRouteChange={(home, school) => {
              setHomeDistrict(home);
              setSchoolDistrict(school);
            }}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <RainfallChart data={weatherRainfallTrend} />

          <DistrictPanel
            district={selectedDistrict}
            fallbackDistrict={fallbackDistrict}
          />
        </section>

        <section className="paper-card p-5">
          <p className="field-label">Methodology</p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <h3 className="font-semibold">Rainfall score</h3>
              <p className="mt-1 text-sm text-gray-600">
                0 to 6 points based on rainfall intensity across the home and
                school district corridor.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Flood alert score</h3>
              <p className="mt-1 text-sm text-gray-600">
                0 to 6 points based on active flood reports in selected commute
                districts.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Route intersection score</h3>
              <p className="mt-1 text-sm text-gray-600">
                5 points added when the route passes through mapped flood-prone
                zones.
              </p>
            </div>
          </div>
        </section>

        <footer className="pb-8 pt-2 text-sm text-gray-500">
          Weather source: {weatherSource}. Flood zones and district alerts are
          simulated for demonstration. For real-world use, connect verified city
          flood feeds.
        </footer>
      </div>
    </main>
  );
}