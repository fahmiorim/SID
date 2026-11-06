/**
 * Kontrak OpenAPI API eksternal (OS-OPS-012).
 *
 * Hanya mendokumentasikan endpoint yang benar-benar ada. Desa ditentukan dari
 * header `Host`, dan endpoint tulis memakai header `X-API-Key`.
 */

export const JALUR_API_EKSTERNAL = {
  openapi: "/api/eksternal/openapi",
  tteTandaTangan: "/api/eksternal/tte/tanda-tangan",
  surat: "/api/eksternal/surat",
  suratToken: "/api/eksternal/surat/{token}",
  suratVerifikasi: "/api/eksternal/surat/verifikasi",
} as const;

const galat = {
  description: "Permintaan gagal.",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Galat" },
    },
  },
} as const;

export function buatSpesifikasiOpenApiEksternal(serverUrl: string) {
  return {
    openapi: "3.1.0",
    info: {
      title: "API Eksternal SID Desa",
      version: "1.0.0",
      description:
        "API mitra untuk verifikasi surat dan tanda tangan elektronik. " +
        "Desa ditentukan dari header Host; autentikasi memakai X-API-Key.",
    },
    servers: [{ url: serverUrl }],
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: "apiKey", in: "header", name: "X-API-Key" },
      },
      schemas: {
        Galat: {
          type: "object",
          required: ["ok", "error"],
          properties: {
            ok: { type: "boolean", const: false },
            error: { type: "string" },
            detail: { type: "string" },
          },
        },
      },
    },
    security: [{ ApiKeyAuth: [] }],
    paths: {
      [JALUR_API_EKSTERNAL.tteTandaTangan]: {
        post: {
          summary: "Tandatangani berkas PDF",
          description: "Menerima multipart/form-data dengan field `berkas` (PDF, maks. 20 MB).",
          operationId: "tandatanganiPdf",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["berkas"],
                  properties: {
                    berkas: { type: "string", format: "binary" },
                    nomor: { type: "string", maxLength: 50 },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "PDF bertanda tangan.",
              content: { "application/pdf": { schema: { type: "string", format: "binary" } } },
            },
            "401": galat,
            "413": galat,
            "415": galat,
            "422": galat,
            "429": galat,
          },
        },
      },
      [JALUR_API_EKSTERNAL.surat]: {
        post: {
          summary: "Ajukan permohonan surat atas nama warga",
          description:
            "Warga diidentifikasi dari NIK pada desa pemanggil. JSON untuk jenis surat tanpa syarat; " +
            "multipart bila perlu mengunggah berkas syarat.",
          operationId: "ajukanSuratEksternal",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["nik", "letterTypeId"],
                  properties: {
                    nik: { type: "string", pattern: "^\\d{16}$" },
                    letterTypeId: { type: "integer", minimum: 1 },
                    isian: { type: "object", additionalProperties: { type: "string" } },
                    noHpAktif: { type: "string", maxLength: 30 },
                    keterangan: { type: "string", maxLength: 500 },
                  },
                },
              },
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["nik", "letterTypeId"],
                  properties: {
                    nik: { type: "string", pattern: "^\\d{16}$" },
                    letterTypeId: { type: "integer", minimum: 1 },
                    isian: {
                      type: "string",
                      description: "JSON objek isian (alternatif: field isian.<kode>).",
                    },
                    noHpAktif: { type: "string", maxLength: 30 },
                    keterangan: { type: "string", maxLength: 500 },
                    berkas: {
                      type: "object",
                      description:
                        "Berkas syarat dengan nama field syarat.<id>, divalidasi pengaturan lampiran permohonan.",
                      additionalProperties: { type: "string", format: "binary" },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Permohonan dibuat (id + nomor antrean)." },
            "400": galat,
            "401": galat,
            "404": galat,
            "422": galat,
            "429": galat,
          },
        },
      },
      [JALUR_API_EKSTERNAL.suratToken]: {
        get: {
          summary: "Metadata non-pribadi surat berdasarkan token verifikasi",
          operationId: "getSuratByToken",
          parameters: [
            {
              name: "token",
              in: "path",
              required: true,
              schema: { type: "string", pattern: "^[a-f0-9]{64}$" },
            },
          ],
          responses: {
            "200": { description: "Metadata surat." },
            "401": galat,
            "404": galat,
            "429": galat,
          },
        },
      },
      [JALUR_API_EKSTERNAL.suratVerifikasi]: {
        post: {
          summary: "Verifikasi tanda tangan surat",
          operationId: "verifikasiSurat",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["token"],
                  properties: { token: { type: "string", pattern: "^[a-f0-9]{64}$" } },
                },
              },
            },
          },
          responses: {
            "200": { description: "Hasil verifikasi." },
            "400": galat,
            "401": galat,
            "429": galat,
          },
        },
      },
    },
  } as const;
}
