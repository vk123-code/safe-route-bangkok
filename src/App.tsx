import { useEffect, useMemo, useState } from "react";
import FloodMap from "./components/FloodMap";
import SummaryCards from "./components/SummaryCards";
import RiskCalculator from "./components/RiskCalculator";
import RainfallChart from "./components/RainfallChart";
import DistrictPanel from "./components/DistrictPanel";
import {
  districts as fallbackDistricts,
  floodZones,
  rainfallTrend as fallbackRainfallTrend,
  sensors,
} from "./shared/data";
import { calculateRiskWithDistricts } from "./shared/risk";
import type { District, RainfallPoint } from "./shared/data";
import type { RiskResult } from "./shared/risk";

export default function App() {
  const [districts, setDistricts] = useState<District[]>(fallbackDistricts);
  const [homeDistrict, setHomeDistrict] = useState("Bang Kapi");
  const [schoolDistrict, setSchoolDistrict] = useState("Pathum Wan");
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [rainfallTrend, setRainfallTrend] =
    useState<RainfallPoint[]>(fallbackRainfallTrend);
  const [dataSource, setDataSource] = useState("Loading live data...");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const [riskResult, setRiskResult] = useState<RiskResult>(
    calculateRiskWithDistricts(
      "Bang Kapi",
      "Pathum Wan",
      fallbackDistricts,
      "07:30"
    )
  );

  const fallbackDistrict = useMemo(() => {
    return [...districts].sort((a, b) => {
      const bScore =
        (b.next3hRainfallMmHr ?? b.rainfall) + (b.riverDischargeM3s ?? 0) / 100;
      const aScore =
        (a.next3hRainfallMmHr ?? a.rainfall) + (a.riverDischargeM3s ?? 0) / 100;

      return bScore - aScore;
    })[0];
  }, [districts]);

  useEffect(() => {
    async function loadLiveData() {
      try {
        const response = await fetch("/api/live");

        if (!response.ok) {
          throw new Error("Live API failed");
        }

        const data = await response.json();

        setDistricts(data.districts ?? fallbackDistricts);
        setRainfallTrend(data.rainfallTrend ?? fallbackRainfallTrend);
        setDataSource(data.source ?? "Open-Meteo");
        setUpdatedAt(data.updatedAt ?? null);
      } catch {
        setDistricts(fallbackDistricts);
        setRainfallTrend(fallbackRainfallTrend);
        setDataSource("Live data unavailable");
      }
    }

    loadLiveData();

    const interval = window.setInterval(loadLiveData, 10 * 60 * 1000);

    return () => window.clearInterval(interval);
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
                live rainfall + live river-discharge signal
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
              Safe Route{" "}
              <span className="display-serif italic text-[#005A9C]">
                Bangkok
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-base text-gray-600 md:text-lg">
              A live weather-derived commute flood-risk dashboard for Bangkok
              students, using current rainfall, short-term rainfall forecast,
              rainfall trend, and river-discharge data.
            </p>
          </div>

          <div className="paper-card-soft max-w-sm p-4">
            <p className="field-label">Current Route</p>
            <p className="mt-2 text-lg font-semibold">
              {riskResult.homeDistrict} → {riskResult.schoolDistrict}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Score {riskResult.score}/12 · {riskResult.level} risk
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 md:px-8">
        <SummaryCards districts={districts} />

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
            districts={districts}
            onResult={setRiskResult}
            onRouteChange={(home, school) => {
              setHomeDistrict(home);
              setSchoolDistrict(school);
            }}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <RainfallChart data={rainfallTrend} />

          <DistrictPanel
            district={selectedDistrict}
            fallbackDistrict={fallbackDistrict}
          />
        </section>

        <section className="paper-card p-5">
          <p className="field-label">Live Methodology</p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <h3 className="font-semibold">Rainfall signal</h3>
              <p className="mt-1 text-sm text-gray-600">
                Uses live current rainfall and the highest expected rainfall in
                the next 3 hours for the selected home and school districts.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Trend signal</h3>
              <p className="mt-1 text-sm text-gray-600">
                Compares recent rainfall with earlier rainfall to detect whether
                conditions are improving, steady, or worsening.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">River signal</h3>
              <p className="mt-1 text-sm text-gray-600">
                Uses nearby river-discharge values from the flood API as an
                additional flood-pressure signal.
              </p>
            </div>
          </div>
        </section>

        <footer className="pb-8 pt-2 text-sm text-gray-500">
          Data source: {dataSource}. Updated:{" "}
          {updatedAt ? new Date(updatedAt).toLocaleString() : "loading"}. This
          version removes simulated flood alerts, fake sensors, and fake flood
          zones.
        </footer>
      </div>
    </main>
  );
}