"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";

import "leaflet/dist/leaflet.css";

import type { AreaDTO, GarisDTO, PointDTO, PolygonDTO } from "@/features/gis/domain/gis";

export interface PetaMapProps {
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
    const overlayLayers: Record<string, L.LayerGroup> = {};

    // Draw areas grouped by polygon layer
    const areasByPolygon = new Map<number | "lainnya", typeof areas>();
    areas.forEach((area) => {
      const key = area.refPolygon ?? "lainnya";
      const list = areasByPolygon.get(key);
      if (list) list.push(area);
      else areasByPolygon.set(key, [area]);
    });

    areasByPolygon.forEach((list, key) => {
      const group = L.layerGroup();
      list.forEach((area) => {
        const layer = key === "lainnya" ? undefined : polygonById.get(key);
        const path = parseGeoJsonPath(area.path, "Polygon");
        if (!layer && key !== "lainnya") return;
        if (path === null || path.length < 3) return;
        const color = key === "lainnya" ? "#10b981" : (layer?.color ?? "#10b981");
        L.polygon(path, { color, weight: 2, fillOpacity: 0.15 })
          .addTo(group)
          .bindPopup(popupContent(area.nama));
        bounds.push(...path);
      });
      if (list.length > 0) {
        group.addTo(map);
        if (key === "lainnya") {
          overlayLayers["Area Lainnya"] = group;
        } else {
          const polygon = polygonById.get(key);
          overlayLayers[polygon?.nama ?? `Polygon ${key}`] = group;
        }
      }
    });

    // Draw garises (roads/lines)
    if (garises.length > 0) {
      const garisGroup = L.layerGroup();
      garises.forEach((garis) => {
        const path = parseGeoJsonPath(garis.path, "LineString");
        if (!path || path.length < 2) return;
        L.polyline(path, { color: "#f59e0b", weight: 3 })
          .addTo(garisGroup)
          .bindPopup(popupContent(garis.nama));
        bounds.push(...path);
      });
      garisGroup.addTo(map);
      overlayLayers["Garis"] = garisGroup;
    }

    // Draw points
    if (points.length > 0) {
      const titikGroup = L.layerGroup();
      points.forEach((point) => {
        const path = parseGeoJsonPath(point.path, "Point");
        if (!path || path.length !== 1) return;
        const coord = path[0];
        if (!coord) return;
        const [lat, lng] = coord;
        L.marker([lat, lng]).addTo(titikGroup).bindPopup(popupContent(point.nama));
        bounds.push([lat, lng]);
      });
      titikGroup.addTo(map);
      overlayLayers["Titik"] = titikGroup;
    }

    if (bounds.length > 0) map.fitBounds(bounds, { padding: [24, 24] });

    if (Object.keys(overlayLayers).length > 0) {
      L.control.layers(undefined, overlayLayers).addTo(map);
    }

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
