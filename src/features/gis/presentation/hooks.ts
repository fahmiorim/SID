"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  createArea,
  createGaris,
  createPersil,
  createPoint,
  createPolygon,
  deleteArea,
  deleteGaris,
  deletePersil,
  deletePoint,
  deletePolygon,
  updateArea,
  updateGaris,
  updatePersil,
  updatePoint,
  updatePolygon,
} from "@/features/gis/application/use-cases";

export function usePolygonAction() {
  const [isPending, setPending] = useState(false);

  const create = async (input: Parameters<typeof createPolygon>[0]) => {
    setPending(true);
    try {
      const result = await createPolygon(input);
      toast.success("Polygon berhasil dibuat.");
      return { result, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal membuat polygon.";
      toast.error(message);
      return { result: null, error: message };
    } finally {
      setPending(false);
    }
  };

  const update = async (id: number, input: Parameters<typeof updatePolygon>[1]) => {
    setPending(true);
    try {
      await updatePolygon(id, input);
      toast.success("Polygon berhasil diperbarui.");
      return { success: true, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui polygon.";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setPending(false);
    }
  };

  const remove = async (id: number) => {
    setPending(true);
    try {
      await deletePolygon(id);
      toast.success("Polygon berhasil dihapus.");
      return { success: true, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menghapus polygon.";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setPending(false);
    }
  };

  return { isPending, create, update, remove };
}

export function useAreaAction() {
  const [isPending, setPending] = useState(false);

  const create = async (input: Parameters<typeof createArea>[0]) => {
    setPending(true);
    try {
      await createArea(input);
      toast.success("Area berhasil dibuat.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal membuat area.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  const update = async (id: number, input: Parameters<typeof updateArea>[1]) => {
    setPending(true);
    try {
      await updateArea(id, input);
      toast.success("Area berhasil diperbarui.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui area.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  const remove = async (id: number) => {
    setPending(true);
    try {
      await deleteArea(id);
      toast.success("Area berhasil dihapus.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menghapus area.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  return { isPending, create, update, remove };
}

export function useGarisAction() {
  const [isPending, setPending] = useState(false);

  const create = async (input: Parameters<typeof createGaris>[0]) => {
    setPending(true);
    try {
      await createGaris(input);
      toast.success("Garis berhasil dibuat.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal membuat garis.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  const update = async (id: number, input: Parameters<typeof updateGaris>[1]) => {
    setPending(true);
    try {
      await updateGaris(id, input);
      toast.success("Garis berhasil diperbarui.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui garis.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  const remove = async (id: number) => {
    setPending(true);
    try {
      await deleteGaris(id);
      toast.success("Garis berhasil dihapus.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menghapus garis.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  return { isPending, create, update, remove };
}

export function usePointAction() {
  const [isPending, setPending] = useState(false);

  const create = async (input: Parameters<typeof createPoint>[0]) => {
    setPending(true);
    try {
      await createPoint(input);
      toast.success("Titik berhasil dibuat.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal membuat titik.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  const update = async (id: number, input: Parameters<typeof updatePoint>[1]) => {
    setPending(true);
    try {
      await updatePoint(id, input);
      toast.success("Titik berhasil diperbarui.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui titik.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  const remove = async (id: number) => {
    setPending(true);
    try {
      await deletePoint(id);
      toast.success("Titik berhasil dihapus.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menghapus titik.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  return { isPending, create, update, remove };
}

export function usePersilAction() {
  const [isPending, setPending] = useState(false);

  const create = async (input: Parameters<typeof createPersil>[0]) => {
    setPending(true);
    try {
      await createPersil(input);
      toast.success("Persil berhasil dibuat.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal membuat persil.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  const update = async (id: number, input: Parameters<typeof updatePersil>[1]) => {
    setPending(true);
    try {
      await updatePersil(id, input);
      toast.success("Persil berhasil diperbarui.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui persil.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  const remove = async (id: number) => {
    setPending(true);
    try {
      await deletePersil(id);
      toast.success("Persil berhasil dihapus.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menghapus persil.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  return { isPending, create, update, remove };
}
