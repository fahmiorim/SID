"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";

import "leaflet/dist/leaflet.css";

interface ProdukMapItem {
  nama: string;
  lapakNama: string;
  harga: string;
  lat: number;
  lng: number;
}

interface PetaProdukMapProps {
  items: ProdukMapItem[];
  desaName: string;
}

export default function PetaProdukMap({ items, desaName }: PetaProdukMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    const firstLat = items[0]?.lat ?? -6.1751;
    const firstLng = items[0]?.lng ?? 106.865;

    const map = L.map(mapRef.current).setView([firstLat, firstLng], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    leafletRef.current = map;

    items.forEach((item) => {
      const marker = L.marker([item.lat, item.lng]).addTo(map);
      marker.bindPopup(`
        <div style="min-width: 160px">
          <strong>${item.nama}</strong><br/>
          <span style="font-size: 0.9em; color: #666;">Lapak: ${item.lapakNama}</span><br/>
          <span style="font-weight: bold;">Rp ${Number(item.harga).toLocaleString("id-ID")}</span>
        </div>
      `);
    });
  }, [items, desaName]);

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-lg border">
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
