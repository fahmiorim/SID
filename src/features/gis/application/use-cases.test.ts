import { beforeEach, describe, expect, it, vi } from "vitest";

import * as resolveVillage from "@/features/desa/application/resolve-village";
import {
  createPolygon,
  listAllPolygonUseCases,
  listPolygonUseCases,
} from "@/features/gis/application/use-cases";
import type { PolygonDTO, PolygonFormInput } from "@/features/gis/domain/gis";
import * as gisRepo from "@/features/gis/infrastructure/gis-repository";
import * as dal from "@/lib/dal";
import type { CurrentUser } from "@/lib/dal";

vi.mock("@/lib/dal", () => ({
  requireUser: vi.fn(),
  requirePermission: vi.fn(),
}));

vi.mock("@/features/desa/application/resolve-village", () => ({
  resolveVillageId: vi.fn(),
  getIdentitasFromRequest: vi.fn(),
}));

vi.mock("@/features/gis/infrastructure/gis-repository", () => ({
  listPolygons: vi.fn(),
  listAllPolygons: vi.fn(),
  findPolygonById: vi.fn(),
  insertPolygon: vi.fn(),
  updatePolygon: vi.fn(),
  deletePolygon: vi.fn(),
  listAreas: vi.fn(),
  findAreaById: vi.fn(),
  insertArea: vi.fn(),
  updateArea: vi.fn(),
  deleteArea: vi.fn(),
  listGaris: vi.fn(),
  findGarisById: vi.fn(),
  insertGaris: vi.fn(),
  updateGaris: vi.fn(),
  deleteGaris: vi.fn(),
  listPoints: vi.fn(),
  findPointById: vi.fn(),
  insertPoint: vi.fn(),
  updatePoint: vi.fn(),
  deletePoint: vi.fn(),
  listSimbol: vi.fn(),
  insertSimbol: vi.fn(),
  updateSimbol: vi.fn(),
  deleteSimbol: vi.fn(),
  listPersil: vi.fn(),
  findPersilById: vi.fn(),
  insertPersil: vi.fn(),
  updatePersil: vi.fn(),
  deletePersil: vi.fn(),
  listCdesa: vi.fn(),
  findCdesaById: vi.fn(),
  insertCdesa: vi.fn(),
  deleteCdesa: vi.fn(),
  listCdesaMutasi: vi.fn(),
  insertCdesaMutasi: vi.fn(),
  deleteCdesaMutasi: vi.fn(),
}));

describe("gis use-cases: polygon", () => {
  const baseUser = {
    id: "1",
    name: "Admin",
    username: null,
    email: "admin@test",
    image: null,
    villageId: null,
    roleId: null,
    residentId: null,
    mustChangePin: false,
    permissions: { isSuperadmin: false, levelByResource: new Map() },
  } as CurrentUser;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dal.requireUser).mockResolvedValue(baseUser);
    vi.mocked(dal.requirePermission).mockResolvedValue({} as never);
    vi.mocked(resolveVillage.resolveVillageId).mockResolvedValue(10);
  });

  it("listPolygonUseCases menerapkan tenant isolation (hanya desa terpilih)", async () => {
    vi.mocked(gisRepo.listPolygons).mockResolvedValue([]);
    const res = await listPolygonUseCases();
    expect(resolveVillage.resolveVillageId).toHaveBeenCalledWith(baseUser);
    expect(gisRepo.listPolygons).toHaveBeenCalledWith(10);
    expect(res).toEqual([]);
  });

  it("listAllPolygonUseCases mengembalikan semua polygon untuk desa", async () => {
    vi.mocked(gisRepo.listAllPolygons).mockResolvedValue([]);
    await listAllPolygonUseCases();
    expect(gisRepo.listAllPolygons).toHaveBeenCalledWith(10);
  });

  it("createPolygon memeriksa parent polygon di desa yang sama", async () => {
    const mockPolygon: PolygonDTO = {
      id: 1,
      villageId: 10,
      nama: "Parent",
      simbol: null,
      color: null,
      tipe: 0,
      parrent: null,
      enabled: 1,
      sortOrder: 0,
    };
    vi.mocked(gisRepo.findPolygonById).mockResolvedValue(mockPolygon);
    vi.mocked(gisRepo.insertPolygon).mockResolvedValue(5);

    const input = {
      nama: "X",
      simbol: null,
      color: null,
      tipe: 0,
      parrent: 1,
      enabled: 1,
      sortOrder: 0,
    } as unknown as PolygonFormInput;
    const res = await createPolygon(input);
    expect(gisRepo.findPolygonById).toHaveBeenCalledWith(10, 1);
    expect(gisRepo.insertPolygon).toHaveBeenCalledWith(10, expect.objectContaining({ nama: "X" }));
    expect(res).toEqual({ id: 5 });
  });
});
