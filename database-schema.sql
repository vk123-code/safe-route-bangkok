CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE districts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  rainfall_mm_hr NUMERIC DEFAULT 0,
  active_alerts INTEGER DEFAULT 0,
  boundary GEOMETRY(POLYGON, 4326)
);

CREATE TABLE flood_zones (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('moderate', 'elevated', 'severe')),
  district_name TEXT REFERENCES districts(name),
  radius_m INTEGER NOT NULL,
  center GEOMETRY(POINT, 4326)
);

CREATE TABLE flood_sensors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  water_level_cm NUMERIC,
  status TEXT CHECK (status IN ('normal', 'watch', 'alert')),
  location GEOMETRY(POINT, 4326)
);

CREATE INDEX districts_boundary_gix ON districts USING GIST (boundary);
CREATE INDEX flood_zones_center_gix ON flood_zones USING GIST (center);
CREATE INDEX flood_sensors_location_gix ON flood_sensors USING GIST (location);

-- Example route intersection query:
-- Finds flood zones close to a route line.
WITH route AS (
  SELECT ST_SetSRID(
    ST_MakeLine(
      ST_MakePoint(100.647, 13.765),
      ST_MakePoint(100.535, 13.746)
    ),
    4326
  ) AS geom
)
SELECT
  flood_zones.name,
  flood_zones.severity
FROM flood_zones, route
WHERE ST_DWithin(
  flood_zones.center::geography,
  route.geom::geography,
  flood_zones.radius_m
);