"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SuplemenField = {
  label: string;
  tipe: string;
  required: boolean;
  options?: string[];
};

interface Props {
  value: SuplemenField[];
  onChange: (fields: SuplemenField[]) => void;
}

export function SuplemenFormBuilder({ value, onChange }: Props) {
  const [fields, setFields] = useState<SuplemenField[]>(value || []);

  const addField = () => {
    const next = [...fields, { label: "", tipe: "text", required: false }];
    setFields(next);
    onChange(next);
  };

  const updateField = (idx: number, patch: Partial<SuplemenField>) => {
    const next = fields.map((f, i) => (i === idx ? { ...f, ...patch } : f));
    setFields(next);
    onChange(next);
  };

  const removeField = (idx: number) => {
    const next = fields.filter((_, i) => i !== idx);
    setFields(next);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Isian Dinamis</Label>
        <Button type="button" size="sm" onClick={addField}>
          Tambah Field
        </Button>
      </div>
      {fields.map((field, idx) => (
        <div key={idx} className="grid gap-2 rounded border p-3 md:grid-cols-4">
          <Input
            placeholder="Label"
            value={field.label}
            onChange={(e) => updateField(idx, { label: e.target.value })}
          />
          <Select value={field.tipe} onValueChange={(v) => updateField(idx, { tipe: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Tanggal</SelectItem>
              <SelectItem value="select">Pilihan</SelectItem>
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => updateField(idx, { required: e.target.checked })}
            />
            Wajib
          </label>
          <Button type="button" variant="outline" size="sm" onClick={() => removeField(idx)}>
            Hapus
          </Button>
        </div>
      ))}
    </div>
  );
}
