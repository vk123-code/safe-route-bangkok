import {
  Circle,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import type { District, FloodZone, Sensor } from "../shared/data";

type Props = {
  districts: District[];
  floodZones: FloodZone[];
  sensors: Sensor[];
  homeDistrict: string;
  schoolDistrict: string;
  onSelectDistrict: (district: District) => void;
};

const riskColor = {
  Low: "#15803D",
  Medium: "#D97706",
  High: "#DC2626",
};

function RouteFocus({
  home,
  school,
}: {
  home: District | undefined;
  school: District | undefined;
}) {
  const map = useMap();

  useEffect(() => {
    if (!home || !school) return;

    map.fitBounds(
      [
        [home.lat, home.lng],
        [school.lat, school.lng],
      ],
      {
        padding: [80, 80],
        maxZoom: 12,
      }
    );
  }, [home, school, map]);

  return null;
}

export default function FloodMap({
  districts,
  homeDistrict,
  schoolDistrict,
  onSelectDistrict,
}: Props) {
  const home = districts.find((district) => district.name === homeDistrict);
  const school = districts.find((district) => district.name === schoolDistrict);

  return (
    <section className="paper-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="field-label">Live Rainfall Map</p>
          <h2 className="text-xl font-semibold">Bangkok commute corridor</h2>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-green-300 bg-green-50 px-3 py-1 text-green-700">
            Low
          </span>
          <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-amber-700">
            Medium
          </span>
          <span className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-red-700">
            High
          </span>
        </div>
      </div>

      <MapContainer
        center={[13.7563, 100.5018]}
        zoom={11}
        scrollWheelZoom={true}
        className="h-[520px] w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RouteFocus home={home} school={school} />

        {districts.map((district) => {
          const rain =
            district.next3hRainfallMmHr ??
            district.currentRainfallMmHr ??
            district.rainfall ??
            0;

          const radius = Math.max(650, 650 + rain * 160);

          return (
            <Circle
              key={district.id}
              center={[district.lat, district.lng]}
              radius={radius}
              pathOptions={{
                color: riskColor[district.risk],
                fillColor: riskColor[district.risk],
                fillOpacity: 0.28,
                weight: 2,
              }}
              eventHandlers={{
                click: () => onSelectDistrict(district),
              }}
            >
              <Tooltip sticky>
                <strong>{district.name}</strong>
                <br />
                Current rain:{" "}
                {(district.currentRainfallMmHr ?? district.rainfall ?? 0).toFixed(1)} mm/hr
                <br />
                Next 3h peak:{" "}
                {(district.next3hRainfallMmHr ?? 0).toFixed(1)} mm/hr
                <br />
                Trend: {district.trend ?? "steady"}
                <br />
                Risk: {district.risk}
              </Tooltip>
            </Circle>
          );
        })}

        {home && school && (
          <Polyline
            positions={[
              [home.lat, home.lng],
              [school.lat, school.lng],
            ]}
            pathOptions={{
              color: "#005A9C",
              weight: 5,
              dashArray: "10 10",
            }}
          >
            <Tooltip sticky>
              {home.name} → {school.name}
            </Tooltip>
          </Polyline>
        )}
      </MapContainer>
    </section>
  );
}
