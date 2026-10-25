import "server-only";

import {
  type ListSuplemenParams,
  type ListSuplemenResult,
  type SuplemenCreateInput,
  type SuplemenUpdateInput,
} from "@/features/penduduk/domain/suplemen";
import {
  createSuplemen,
  deleteSuplemen,
  listSuplemen,
  updateSuplemen,
} from "@/features/penduduk/infrastructure/suplemen-repository";

export async function getSuplemenListUseCase(
  villageId: number,
  params: ListSuplemenParams,
): Promise<ListSuplemenResult> {
  return listSuplemen(villageId, params);
}

export async function createSuplemenUseCase(
  villageId: number,
  input: SuplemenCreateInput,
): Promise<number> {
  return createSuplemen(villageId, input);
}

export async function updateSuplemenUseCase(
  villageId: number,
  input: SuplemenUpdateInput,
): Promise<void> {
  await updateSuplemen(villageId, input);
}

export async function deleteSuplemenUseCase(villageId: number, id: number): Promise<void> {
  await deleteSuplemen(villageId, id);
}
