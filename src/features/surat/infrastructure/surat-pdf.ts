import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";

import { formatTanggalIndonesia } from "@/features/surat/domain/surat";

export interface SuratPdfIdentity {
  namaDesa: string | null;
  kodeDesa: string | null;
  namaKecamatan: string | null;
  namaKabupaten: string | null;
  namaPropinsi: string | null;
  alamatKantor: string | null;
  telepon: string | null;
  emailDesa: string | null;
  namaKepalaDesa: string | null;
  nipKepalaDesa: string | null;
}

export interface SuratPdfInput {
  desa: SuratPdfIdentity;
  jenisNama: string;
  nomor: string | null;
  tanggal: string;
  content: string;
  /** Tautan verifikasi publik; dicetak di footer bila tersedia. */
  verificationUrl?: string | null;
}

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 15;

/** pdf-lib dengan font standar hanya mendukung WinAnsi; normalkan karakter. */
function clean(value: string): string {
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/[^\x20-\x7E\n]/g, "?");
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];

  for (const rawLine of text.split("\n")) {
    const words = rawLine.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }

    let current = "";
    for (const word of words) {
      const candidate = current === "" ? word : `${current} ${word}`;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        current = candidate;
        continue;
      }
      if (current !== "") lines.push(current);
      current = word;
    }
    if (current !== "") lines.push(current);
  }

  return lines;
}

function centered(page: PDFPage, text: string, y: number, font: PDFFont, size: number): void {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (PAGE_WIDTH - width) / 2, y, size, font, color: rgb(0, 0, 0) });
}

export async function buildSuratPdf(input: SuratPdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const desa = input.desa;
  const headerLines = [
    desa.namaPropinsi ? `PEMERINTAH ${desa.namaPropinsi.toUpperCase()}` : null,
    desa.namaKabupaten ? `KABUPATEN ${desa.namaKabupaten.toUpperCase()}` : null,
    desa.namaKecamatan ? `KECAMATAN ${desa.namaKecamatan.toUpperCase()}` : null,
    desa.namaDesa ? `DESA ${desa.namaDesa.toUpperCase()}` : "PEMERINTAH DESA",
  ].filter((line): line is string => line !== null);

  for (const [index, line] of headerLines.entries()) {
    centered(
      page,
      clean(line),
      y,
      index === headerLines.length - 1 ? bold : font,
      index === headerLines.length - 1 ? 14 : 12,
    );
    y -= index === headerLines.length - 1 ? 18 : 15;
  }

  const contact = [desa.alamatKantor, desa.telepon ? `Telp. ${desa.telepon}` : null, desa.emailDesa]
    .filter(Boolean)
    .join(" | ");
  if (contact) {
    centered(page, clean(contact), y, font, 9);
    y -= 12;
  }

  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  centered(page, clean(input.jenisNama.toUpperCase()), y, bold, 12);
  y -= 16;
  if (input.nomor) {
    centered(page, clean(`Nomor: ${input.nomor}`), y, font, 10);
    y -= 24;
  } else {
    y -= 8;
  }

  const bodyLines = wrap(clean(input.content), font, 11, CONTENT_WIDTH);
  const ensurePage = () => {
    if (y < MARGIN + 90) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  };

  for (const line of bodyLines) {
    ensurePage();
    if (line !== "") {
      page.drawText(line, {
        x: MARGIN,
        y,
        size: 11,
        font,
        color: rgb(0, 0, 0),
        maxWidth: CONTENT_WIDTH,
      });
    }
    y -= LINE_HEIGHT;
  }

  y -= 24;
  ensurePage();

  const signatureDate = formatTanggalIndonesia(input.tanggal);
  page.drawText(clean(`Desa ${desa.namaDesa ?? "..."}, ${signatureDate}`), {
    x: PAGE_WIDTH - MARGIN - 180,
    y,
    size: 11,
    font,
  });
  y -= 16;
  page.drawText("Kepala Desa", { x: PAGE_WIDTH - MARGIN - 180, y, size: 11, font });
  y -= 60;

  const headName = clean(desa.namaKepalaDesa ?? "..............................");
  const headWidth = bold.widthOfTextAtSize(headName, 11);
  page.drawText(headName, { x: PAGE_WIDTH - MARGIN - headWidth, y, size: 11, font: bold });
  page.drawLine({
    start: { x: PAGE_WIDTH - MARGIN - Math.max(headWidth, 120), y: y - 3 },
    end: { x: PAGE_WIDTH - MARGIN, y: y - 3 },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  y -= 14;

  if (desa.nipKepalaDesa) {
    const nip = clean(`NIP. ${desa.nipKepalaDesa}`);
    const nipWidth = font.widthOfTextAtSize(nip, 9);
    page.drawText(nip, { x: PAGE_WIDTH - MARGIN - nipWidth, y, size: 9, font });
  }

  if (input.verificationUrl) {
    const footer = wrap(clean(`Verifikasi: ${input.verificationUrl}`), font, 8, CONTENT_WIDTH);

    // Footer selalu di dasar halaman; pindah halaman bila tanda tangan terlalu
    // dekat dengan batas bawah agar tidak bertumpuk.
    if (y < MARGIN + 30) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    }

    let footerY = MARGIN;
    for (const line of footer) {
      const width = font.widthOfTextAtSize(line, 8);
      page.drawText(line, {
        x: (PAGE_WIDTH - width) / 2,
        y: footerY,
        size: 8,
        font,
        color: rgb(0, 0, 0),
      });
      footerY += 10;
    }
  }

  return pdf.save();
}
