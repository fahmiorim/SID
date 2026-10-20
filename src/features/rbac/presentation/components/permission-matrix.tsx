"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { Fragment, useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ModulePermissionRow, RoleDTO } from "@/features/rbac/domain/grup";
import { idleActionState } from "@/lib/action-state";

import { savePermissionsAction } from "../actions";

interface PermissionMatrixProps {
  role: RoleDTO;
  permissions: ModulePermissionRow[];
  canManage: boolean;
}

export function PermissionMatrix({ role, permissions, canManage }: PermissionMatrixProps) {
  const [state, formAction, pending] = useActionState(savePermissionsAction, idleActionState);

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
  }, [state]);

  const parents = permissions.filter((p) => p.parentId === null && p.isGroup);
  const children = permissions.filter((p) => p.parentId !== null);

  function getChildren(parentId: number) {
    return children.filter((c) => c.parentId === parentId);
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Hak Akses — {role.name}</h2>
            <p className="text-sm text-muted-foreground">Kelola izin read/write/manage per modul</p>
          </div>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="roleId" value={role.id} />
          {state.status === "error" && !state.fieldErrors ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modul</TableHead>
                  <TableHead className="w-24 text-center">Read</TableHead>
                  <TableHead className="w-24 text-center">Write</TableHead>
                  <TableHead className="w-24 text-center">Manage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parents.map((parent) => {
                  const childs = getChildren(parent.moduleId);
                  return (
                    <Fragment key={parent.moduleId}>
                      <TableRow>
                        <TableCell className="font-medium">{parent.name}</TableCell>
                        <TableCell colSpan={3} />
                      </TableRow>
                      {childs.map((c) => (
                        <TableRow key={c.moduleId}>
                          <TableCell className="pl-8">{c.name}</TableCell>
                          <TableCell className="text-center">
                            <Label className="inline-flex items-center gap-2">
                              <Checkbox
                                name={`perm:${c.moduleId}:read`}
                                defaultChecked={c.read}
                                disabled={!canManage || !c.isActive}
                              />
                            </Label>
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              name={`perm:${c.moduleId}:write`}
                              defaultChecked={c.write}
                              disabled={!canManage || !c.isActive}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              name={`perm:${c.moduleId}:manage`}
                              defaultChecked={c.manage}
                              disabled={!canManage || !c.isActive}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </Fragment>
                  );
                })}
                {/* Modul anak yatim (induknya tidak tampil) dan modul tingkat atas
                    non-grup (mis. Beranda / modul baru) tetap harus bisa diatur. */}
                {permissions
                  .filter(
                    (c) =>
                      (c.parentId !== null && parents.every((p) => p.moduleId !== c.parentId)) ||
                      (c.parentId === null && !c.isGroup),
                  )
                  .map((c) => (
                    <TableRow key={c.moduleId}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          name={`perm:${c.moduleId}:read`}
                          defaultChecked={c.read}
                          disabled={!canManage || !c.isActive}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          name={`perm:${c.moduleId}:write`}
                          defaultChecked={c.write}
                          disabled={!canManage || !c.isActive}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          name={`perm:${c.moduleId}:manage`}
                          defaultChecked={c.manage}
                          disabled={!canManage || !c.isActive}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {canManage ? (
            <div className="flex justify-end">
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : null}
                Simpan Hak Akses
              </Button>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
