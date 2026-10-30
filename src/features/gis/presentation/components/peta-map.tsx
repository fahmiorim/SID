"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";

import "leaflet/dist/leaflet.css";

import type { AreaDTO, GarisDTO, PointDTO, PolygonDTO } from "@/features/gis/domain/gis";

interface PetaMapProps {
  areas: AreaDTO[];
  garises: GarisDTO[];
  points: PointDTO[];
  polygons: PolygonDTO[];
  desaName: string;
}

function parseGeoJsonPath(
  path: string | null,
  expectedType: "LineString" | "Polygon" | "Point",
): [number, number][] | null {
  if (!path) return null;
  try {
    const parsed = JSON.parse(path);
    if (parsed?.type !== expectedType || !Array.isArray(parsed.coordinates)) return null;

    const coordinates =
      expectedType === "Point"
        ? [parsed.coordinates]
        : expectedType === "Polygon"
          ? parsed.coordinates[0]
          : parsed.coordinates;
    if (!Array.isArray(coordinates)) return null;

    const valid = coordinates.filter(
      (coordinate): coordinate is [number, number] =>
        Array.isArray(coordinate) &&
        coordinate.length >= 2 &&
        typeof coordinate[0] === "number" &&
        typeof coordinate[1] === "number" &&
        Number.isFinite(coordinate[0]) &&
        Number.isFinite(coordinate[1]) &&
        Math.abs(coordinate[0]) <= 180 &&
        Math.abs(coordinate[1]) <= 90,
    );
    if (valid.length !== coordinates.length) return null;
    return valid.map(([longitude, latitude]) => [latitude, longitude]);
  } catch {
    return null;
  }
}

function popupContent(label: string): HTMLElement {
  const element = document.createElement("strong");
  element.textContent = label;
  return element;
}

export default function PetaMap({ areas, garises, points, polygons, desaName }: PetaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (leafletRef.current) {
      leafletRef.current.remove();
      leafletRef.current = null;
    }

    const map = L.map(mapRef.current).setView([-2.5, 118.0], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: `© OpenStreetMap · ${desaName}`,
      maxZoom: 18,
    }).addTo(map);

    const polygonById = new Map(polygons.map((polygon) => [polygon.id, polygon]));
    const bounds: L.LatLngTuple[] = [];
    const layerGroups = {
      areas: L.layerGroup().addTo(map),
      garises: L.layerGroup().addTo(map),
      points: L.layerGroup().addTo(map),
    };

    // Draw areas with the color/publication state of their layer.
    areas.forEach((area) => {
      const layer = area.refPolygon === null ? undefined : polygonById.get(area.refPolygon);
      const path = parseGeoJsonPath(area.path, "Polygon");
      if (!layer || path === null || path.length < 3) return;
      L.polygon(path, { color: layer.color ?? "#10b981", weight: 2, fillOpacity: 0.15 })
        .addTo(layerGroups.areas)
        .bindPopup(popupContent(area.nama));
      bounds.push(...path);
    });

    // Draw garises (roads/lines)
    garises.forEach((garis) => {
      const path = parseGeoJsonPath(garis.path, "LineString");
      if (!path || path.length < 2) return;
      L.polyline(path, { color: "#f59e0b", weight: 3 })
        .addTo(layerGroups.garises)
        .bindPopup(popupContent(garis.nama));
      bounds.push(...path);
    });

    // Draw points
    points.forEach((point) => {
      const path = parseGeoJsonPath(point.path, "Point");
      if (!path || path.length !== 1) return;
      const coord = path[0];
      if (!coord) return;
      const [lat, lng] = coord;
      L.marker([lat, lng]).addTo(layerGroups.points).bindPopup(popupContent(point.nama));
      bounds.push([lat, lng]);
    });

    if (bounds.length > 0) map.fitBounds(bounds, { padding: [24, 24] });

    L.control
      .layers(undefined, {
        Area: layerGroups.areas,
        Garis: layerGroups.garises,
        Titik: layerGroups.points,
      })
      .addTo(map);

    leafletRef.current = map;

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, [areas, garises, points, polygons, desaName]);

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-lg border">
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
