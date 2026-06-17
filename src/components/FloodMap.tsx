import {
  Circle,
  MapContainer,
  Polygon,
  Polyline,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import type { District, FloodZone, Sensor } from "../shared/data";

type Props = {
  districts: District[];
  floodZones: FloodZone[];
  sensors: Sensor[];
  homeDistrict: string;
  schoolDistrict: string;
  onSelectDistrict: (district: District) => void;
};

const zoneColor = {
  moderate: "#D97706",
  elevated: "#EA580C",
  severe: "#DC2626",
};

const sensorColor = {
  normal: "#15803D",
  watch: "#D97706",
  alert: "#DC2626",
};

export default function FloodMap({
  districts,
  floodZones,
  sensors,
  homeDistrict,
  schoolDistrict,
  onSelectDistrict,
}: Props) {
  const home = districts.find((district) => district.name === homeDistrict) ?? districts[0];
  const school =
    districts.find((district) => district.name === schoolDistrict) ?? districts[1];

  return (
    <section className="paper-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="field-label">Interactive Flood Map</p>
          <h2 className="text-xl font-semibold">Bangkok commute corridor</h2>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-amber-700">
            Moderate
          </span>
          <span className="rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-orange-700">
            Elevated
          </span>
          <span className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-red-700">
            Severe
          </span>
        </div>
      </div>

      <MapContainer
        center={[13.77, 100.58]}
        zoom={11}
        scrollWheelZoom={true}
        className="h-[520px] w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {districts.map((district) => (
          <Polygon
            key={district.id}
            positions={district.boundary}
            pathOptions={{
              color: "#6B7280",
              weight: 1,
              fillOpacity: 0.04,
              fillColor: "#F5F5F5",
            }}
            eventHandlers={{
              click: () => onSelectDistrict(district),
            }}
          >
            <Tooltip sticky>
              <strong>{district.name}</strong>
              <br />
              Rainfall: {district.rainfall} mm/hr
              <br />
              Alerts: {district.alerts}
            </Tooltip>
          </Polygon>
        ))}

        {floodZones.map((zone) => (
          <Circle
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={zone.radiusKm * 1000}
            pathOptions={{
              color: zoneColor[zone.severity],
              fillColor: zoneColor[zone.severity],
              fillOpacity: 0.24,
              weight: 2,
            }}
          >
            <Tooltip>
              <strong>{zone.name}</strong>
              <br />
              District: {zone.district}
              <br />
              Severity: {zone.severity}
            </Tooltip>
          </Circle>
        ))}

        {sensors.map((sensor) => (
          <Circle
            key={sensor.id}
            center={[sensor.lat, sensor.lng]}
            radius={170}
            pathOptions={{
              color: sensorColor[sensor.status],
              fillColor: sensorColor[sensor.status],
              fillOpacity: 0.9,
              weight: 1,
            }}
          >
            <Tooltip>
              <strong>{sensor.name}</strong>
              <br />
              Water level: {sensor.waterLevelCm} cm
              <br />
              Status: {sensor.status}
            </Tooltip>
          </Circle>
        ))}

        <Polyline
          positions={[
            [home.lat, home.lng],
            [school.lat, school.lng],
          ]}
          pathOptions={{
            color: "#005A9C",
            weight: 4,
            dashArray: "8 8",
          }}
        >
          <Tooltip sticky>
            {home.name} → {school.name}
          </Tooltip>
        </Polyline>
      </MapContainer>
    </section>
  );
}