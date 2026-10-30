"use client";

export function LayerPanel() {
  return (
    <div className="absolute top-2 right-2 z-[1000] rounded bg-white/90 p-2 text-sm shadow">
      <div className="mb-1 font-semibold">Layer</div>
      <label className="flex items-center gap-2">
        <input type="checkbox" defaultChecked />
        Area
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" defaultChecked />
        Garis
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" defaultChecked />
        Titik
      </label>
    </div>
  );
}
