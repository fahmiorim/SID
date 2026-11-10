/**
 * Seeder khusus Desa Kwala Gunung.
 *
 * Menyisipkan seluruh konten publik (profil, perangkat, wilayah, pembangunan,
 * bantuan, kelompok, agenda, berita, galeri, slider, halaman, dokumen, menu,
 * widget, pengaturan) serta mengaktifkan tema `esensi` dengan opsi warna desa.
 * Idempoten: aman dijalankan berulang.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { agendaKegiatan } from "@/db/schema/agenda-kegiatan";
import { bantuanProgram } from "@/db/schema/bantuan";
import {
  berita,
  beritaKategori,
  dokumenPublik,
  galeriAlbum,
  galeriFoto,
  halamanStatis,
  jabatanPerangkat,
  menuPublik,
  perangkatDesa,
  profilDesa,
  slider,
  widget,
} from "@/db/schema/content";
import { kelompok, kelompokMaster } from "@/db/schema/kelompok";
import { pembangunanDokumentasi, pembangunanProyek } from "@/db/schema/pembangunan";
import { pengaturanDesa } from "@/db/schema/pengaturan";
import { regions } from "@/db/schema/region";

import { JABATAN_SEEDS, KATEGORI_BERITA_SEEDS } from "./data/konten";
import { VILLAGE_DATA } from "./data/kwala-gunung";
import { AGENDA_SEEDS } from "./data/kwala-gunung/agenda";
import { BANTUAN_SEEDS } from "./data/kwala-gunung/bantuan";
import { BERITA_SEEDS } from "./data/kwala-gunung/berita";
import { GALERI_ALBUM_SEEDS } from "./data/kwala-gunung/galeri";
import { KELOMPOK_MASTER_SEEDS, KELOMPOK_SEEDS } from "./data/kwala-gunung/kelompok";
import { mediaRoot, tulisGambar, type SpesifikasiGambar } from "./data/kwala-gunung/media";
import { PEMBANGUNAN_SEEDS } from "./data/kwala-gunung/pembangunan";
import { PERANGKAT_SEEDS } from "./data/kwala-gunung/perangkat";
import {
  DOKUMEN_SEEDS,
  HALAMAN_SEEDS,
  MENU_SEEDS,
  PENGATURAN_SEEDS,
  PROFIL_SEED,
  TEMA_OPSI,
  WIDGET_SEEDS,
} from "./data/kwala-gunung/profil";
import { SLIDER_SEEDS } from "./data/kwala-gunung/slider";
import { WILAYAH_SEEDS } from "./data/kwala-gunung/wilayah";
import { ROLE_SEEDS } from "./data/roles";
import {
  ensureAdminUser,
  ensureVillage,
  replaceGrants,
  seedKeuanganTemplate,
  seedReferenceCatalogs,
  seedSuratCatalog,
  seedSyaratSurat,
  seedTema,
  unwrap,
  upsertModules,
  upsertRole,
  type VillageSeedData,
} from "./foundation";

const MEDIA_SPECS: SpesifikasiGambar[] = [
  { kategori: "slider", nama: "banner-1", judul: "Selamat Datang", tipe: "banner" },
  { kategori: "slider", nama: "banner-2", judul: "Transparansi APBDes", tipe: "banner" },
  { kategori: "slider", nama: "banner-3", judul: "Layanan Surat", tipe: "banner" },
  { kategori: "slider", nama: "banner-4", judul: "Lapak Desa", tipe: "banner" },
  { kategori: "slider", nama: "banner-5", judul: "Gotong Royong", tipe: "banner" },
  { kategori: "berita", nama: "berita-kegiatan", judul: "Kegiatan Desa", tipe: "foto" },
  { kategori: "berita", nama: "berita-pembangunan", judul: "Pembangunan", tipe: "foto" },
  { kategori: "berita", nama: "berita-kesehatan", judul: "Kesehatan", tipe: "foto" },
  { kategori: "berita", nama: "berita-pelatihan", judul: "Pelatihan", tipe: "foto" },
  { kategori: "berita", nama: "berita-apbdes", judul: "APBDes", tipe: "foto" },
  { kategori: "galeri", nama: "pembangunan-jalan-1", judul: "Paving 1", tipe: "foto" },
  { kategori: "galeri", nama: "pembangunan-jalan-2", judul: "Paving 2", tipe: "foto" },
  { kategori: "galeri", nama: "rapat-pkkm-1", judul: "Musdes", tipe: "foto" },
  { kategori: "galeri", nama: "rapat-pkkm-2", judul: "FGD", tipe: "foto" },
  { kategori: "galeri", nama: "kartun-desa-1", judul: "Keagamaan", tipe: "foto" },
  { kategori: "galeri", nama: "karang-taruna-1", judul: "Karang Taruna", tipe: "foto" },
  { kategori: "galeri", nama: "kelompok-wanita-1", judul: "PKK", tipe: "foto" },
  { kategori: "perangkat", nama: "kepala-desa", judul: "H. Syahril, S.E.", tipe: "potret" },
  { kategori: "perangkat", nama: "sekretaris-desa", judul: "Rizky Efendi", tipe: "potret" },
  { kategori: "perangkat", nama: "kaur-tata-usaha", judul: "Nuraini", tipe: "potret" },
  { kategori: "perangkat", nama: "kaur-keuangan", judul: "Mulyadi", tipe: "potret" },
  { kategori: "perangkat", nama: "kaur-perencanaan", judul: "Febrianti", tipe: "potret" },
  { kategori: "perangkat", nama: "kasi-pemerintahan", judul: "Andi Pohan", tipe: "potret" },
  { kategori: "perangkat", nama: "kasi-kesejahteraan", judul: "Hj. Ratna Sari", tipe: "potret" },
  { kategori: "perangkat", nama: "kasi-pelayanan", judul: "Saiful Bahri", tipe: "potret" },
];

async function generateMedia(villageId: number): Promise<void> {
  for (const spec of MEDIA_SPECS) {
    await tulisGambar(villageId, spec);
  }
  console.log(`• ${MEDIA_SPECS.length} gambar media dihasilkan`);
}

const GAMBAR_BERITA_UNDUHAN: Array<{ relatif: string; url: string }> = [
  {
    relatif: "/1/berita/safari-ramadhan-bupati.jpg",
    url: "https://scontent.fkno13-1.fna.fbcdn.net/v/t39.30808-6/643762610_1336823261807838_6085920091646434517_n.jpg?stp=dst-jpg_tt6&cstp=mx1536x2048&ctp=p600x600&_nc_cat=100&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=b96d88&_nc_ohc=V-J3QfqeFeYQ7kNvwEfROWN&_nc_oc=Adqzvhl6oJwEMctYvBGJR8fglttBFSMd7HzNF_wotc4Xx69Ds0Ytt5fJQBoHN7njyjs&_nc_zt=23&_nc_ht=scontent.fkno13-1.fna&_nc_gid=t9Lew_nd5yuv1TDUrHNKXQ&_nc_ss=7f20f&oh=00_AQQap6a2jR4pVP_Hdek32bQMJDUtzY8C0ceURH8eWvYT1w&oe=6AF90A9A",
  },
  {
    relatif: "/1/berita/kmp-kwala-gunung.jpg",
    url: "https://www.waspada.id/uploads/media/2026/08/aceh-1787590345308-share-preview-1787590450591.jpg",
  },
  {
    relatif: "/1/berita/banjir-datuk-lima-puluh.jpg",
    url: "https://batubarakab.go.id/storage/berita/BERITA-1764367321.jpg",
  },
];

async function unduhGambarBerita(villageId: number): Promise<void> {
  for (const item of GAMBAR_BERITA_UNDUHAN) {
    const filePath = path.join(mediaRoot(villageId), item.relatif.replace(/^\/\d+\//, ""));
    if (fs.existsSync(filePath)) continue;
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    try {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await fs.promises.writeFile(filePath, buf);
      console.log(`  • diunduh ${item.relatif}`);
    } catch (error) {
      console.warn(`  • gagal unduh ${item.relatif}: ${(error as Error).message}`);
    }
  }
}

async function seedKwalaKonten(villageId: number): Promise<void> {
  // Profil desa
  const [profilAda] = await db
    .select({ id: profilDesa.id })
    .from(profilDesa)
    .where(eq(profilDesa.villageId, villageId))
    .limit(1);
  if (profilAda) {
    await db
      .update(profilDesa)
      .set({
        visi: PROFIL_SEED.visi,
        misi: PROFIL_SEED.misi,
        sejarah: PROFIL_SEED.sejarah,
        sambutan: PROFIL_SEED.sambutan,
        koordinat: PROFIL_SEED.koordinat,
      })
      .where(eq(profilDesa.id, profilAda.id));
  } else {
    await db.insert(profilDesa).values({ villageId, ...PROFIL_SEED });
  }

  // Jabatan perangkat
  const jabatanIds = new Map<string, number>();
  for (const item of JABATAN_SEEDS) {
    const [ada] = await db
      .select({ id: jabatanPerangkat.id })
      .from(jabatanPerangkat)
      .where(and(eq(jabatanPerangkat.villageId, villageId), eq(jabatanPerangkat.slug, item.slug)))
      .limit(1);
    if (ada) {
      jabatanIds.set(item.slug, ada.id);
    } else {
      const inserted = unwrap(
        await db
          .insert(jabatanPerangkat)
          .values({ villageId, nama: item.nama, slug: item.slug, urut: item.urut })
          .$returningId(),
      );
      jabatanIds.set(item.slug, inserted.id);
    }
  }

  // Perangkat: hapus yang lama lalu sisipkan ulang (idempoten via hapus)
  await db.delete(perangkatDesa).where(eq(perangkatDesa.villageId, villageId));
  for (const item of PERANGKAT_SEEDS) {
    await db.insert(perangkatDesa).values({
      villageId,
      jabatanId: jabatanIds.get(item.jabatanSlug) ?? null,
      nama: item.nama,
      nip: item.nip ?? null,
      jenisKelamin: item.jenisKelamin ?? null,
      tempatLahir: item.tempatLahir ?? null,
      tanggalLahir: item.tanggalLahir ?? null,
      foto: item.foto ?? null,
      penandaTangan: item.jabatanSlug === "kepala-desa",
      status: item.status,
      urut: item.urut,
    });
  }

  // Kategori berita
  const kategoriIds = new Map<string, number>();
  for (const item of KATEGORI_BERITA_SEEDS) {
    const [ada] = await db
      .select({ id: beritaKategori.id })
      .from(beritaKategori)
      .where(and(eq(beritaKategori.villageId, villageId), eq(beritaKategori.slug, item.slug)))
      .limit(1);
    if (ada) {
      kategoriIds.set(item.slug, ada.id);
    } else {
      const inserted = unwrap(
        await db
          .insert(beritaKategori)
          .values({
            villageId,
            nama: item.nama,
            slug: item.slug,
            urut: item.urut,
          })
          .$returningId(),
      );
      kategoriIds.set(item.slug, inserted.id);
    }
  }

  // Berita
  for (const item of BERITA_SEEDS) {
    const [ada] = await db
      .select({ id: berita.id })
      .from(berita)
      .where(and(eq(berita.villageId, villageId), eq(berita.slug, item.slug)))
      .limit(1);
    if (ada) continue;
    await db.insert(berita).values({
      villageId,
      kategoriId: kategoriIds.get(item.kategoriSlug) ?? null,
      judul: item.judul,
      slug: item.slug,
      ringkasan: item.ringkasan,
      isi: item.isi,
      gambar: item.gambar ?? null,
      status: "published",
      terbitPada: new Date(),
      headline: item.headline ?? false,
      slider: item.slider ?? false,
    });
  }

  // Slider
  const [sliderAda] = await db
    .select({ id: slider.id })
    .from(slider)
    .where(eq(slider.villageId, villageId))
    .limit(1);
  if (!sliderAda) {
    for (const item of SLIDER_SEEDS) {
      await db.insert(slider).values({
        villageId,
        gambar: item.gambar,
        judul: item.judul,
        keterangan: item.keterangan,
        tautan: item.tautan,
        aktif: item.aktif,
        urut: item.urut,
      });
    }
  }

  // Galeri album + foto
  for (const album of GALERI_ALBUM_SEEDS) {
    const [adaAlbum] = await db
      .select({ id: galeriAlbum.id })
      .from(galeriAlbum)
      .where(and(eq(galeriAlbum.villageId, villageId), eq(galeriAlbum.slug, album.slug)))
      .limit(1);
    let albumId: number;
    if (adaAlbum) {
      albumId = adaAlbum.id;
    } else {
      const inserted = unwrap(
        await db
          .insert(galeriAlbum)
          .values({
            villageId,
            nama: album.nama,
            slug: album.slug,
            keterangan: album.keterangan,
            sampul: album.sampulRelatif ? `/1/galeri/${album.sampulRelatif}` : null,
            aktif: true,
            urut: album.urutan,
          })
          .$returningId(),
      );
      albumId = inserted.id;
    }

    for (const foto of album.fotoSeeds) {
      const [adaFoto] = await db
        .select({ id: galeriFoto.id })
        .from(galeriFoto)
        .where(
          and(
            eq(galeriFoto.villageId, villageId),
            eq(galeriFoto.albumId, albumId),
            eq(galeriFoto.gambar, foto.gambar),
          ),
        )
        .limit(1);
      if (adaFoto) continue;
      await db.insert(galeriFoto).values({
        villageId,
        albumId,
        gambar: foto.gambar,
        judul: foto.judul ?? null,
        keterangan: foto.keterangan ?? null,
        aktif: true,
        slider: foto.slider ?? false,
        urut: foto.urut ?? 0,
      });
    }
  }

  // Wilayah (regions)
  const [regionAda] = await db
    .select({ id: regions.id })
    .from(regions)
    .where(eq(regions.villageId, villageId))
    .limit(1);
  if (!regionAda) {
    for (const w of WILAYAH_SEEDS) {
      await db.insert(regions).values({
        villageId,
        dusun: w.dusun,
        rw: w.rw ?? null,
        rt: w.rt ?? null,
        sortOrder: w.sortOrder,
      });
    }
  }

  // Pembangunan proyek
  for (const p of PEMBANGUNAN_SEEDS) {
    const [ada] = await db
      .select({ id: pembangunanProyek.id })
      .from(pembangunanProyek)
      .where(and(eq(pembangunanProyek.villageId, villageId), eq(pembangunanProyek.slug, p.slug)))
      .limit(1);
    if (ada) continue;
    const inserted = unwrap(
      await db
        .insert(pembangunanProyek)
        .values({
          villageId,
          judul: p.judul,
          slug: p.slug,
          deskripsi: p.deskripsi,
          lokasi: p.lokasi,
          tahunAnggaran: p.tahunAnggaran,
          sumberDana: p.sumberDana,
          anggaran: p.anggaran,
          volume: p.volume,
          satuan: p.satuan,
          pelaksana: p.pelaksana,
          mulai: p.mulai,
          selesai: p.selesai,
          status: p.status,
          progres: p.progres,
          hasil: p.hasil ?? null,
        })
        .$returningId(),
    );
    if (p.dokumentasi?.length) {
      for (const d of p.dokumentasi) {
        await db.insert(pembangunanDokumentasi).values({
          proyekId: inserted.id,
          gambar: d.gambar,
          judul: d.judul ?? null,
          keterangan: d.keterangan ?? null,
        });
      }
    }
  }

  // Bantuan program
  for (const b of BANTUAN_SEEDS) {
    const [ada] = await db
      .select({ id: bantuanProgram.id })
      .from(bantuanProgram)
      .where(and(eq(bantuanProgram.villageId, villageId), eq(bantuanProgram.slug, b.slug)))
      .limit(1);
    if (ada) continue;
    await db.insert(bantuanProgram).values({
      villageId,
      name: b.nama,
      slug: b.slug,
      sasaran: b.sasaran,
      description: b.description,
      startDate: b.startDate,
      endDate: b.endDate,
      asalDana: b.asalDana,
    });
  }

  // Kelompok master + kelompok
  const masterIds = new Map<string, number>();
  for (const km of KELOMPOK_MASTER_SEEDS) {
    const [ada] = await db
      .select({ id: kelompokMaster.id })
      .from(kelompokMaster)
      .where(
        and(
          eq(kelompokMaster.villageId, villageId),
          eq(kelompokMaster.name, km.name),
          eq(kelompokMaster.type, km.type),
        ),
      )
      .limit(1);
    if (ada) {
      masterIds.set(`${km.name}|${km.type}`, ada.id);
    } else {
      const inserted = unwrap(
        await db
          .insert(kelompokMaster)
          .values({ villageId, name: km.name, type: km.type })
          .$returningId(),
      );
      masterIds.set(`${km.name}|${km.type}`, inserted.id);
    }
  }

  // Map nama master → id by type guessed from seeds? Seeds don't include categoryId.
  // We'll assign first matching master by type.
  for (const k of KELOMPOK_SEEDS) {
    const [ada] = await db
      .select({ id: kelompok.id })
      .from(kelompok)
      .where(and(eq(kelompok.villageId, villageId), eq(kelompok.slug, k.slug)))
      .limit(1);
    if (ada) continue;

    // find a master id: match by name prefix? Use first master with same type.
    let catId: number | null = null;
    for (const km of KELOMPOK_MASTER_SEEDS) {
      if (km.type === k.type) {
        const id = masterIds.get(`${km.name}|${km.type}`);
        // Prefer master whose name appears in kelompok name or first
        if (id !== undefined) {
          catId = id;
          break;
        }
      }
    }
    // Better: try name-based match
    for (const km of KELOMPOK_MASTER_SEEDS) {
      if (km.type === k.type && k.name.toLowerCase().includes(km.name.toLowerCase())) {
        const id = masterIds.get(`${km.name}|${km.type}`);
        if (id !== undefined) {
          catId = id;
          break;
        }
      }
    }

    await db.insert(kelompok).values({
      villageId,
      name: k.name,
      slug: k.slug,
      type: k.type,
      categoryId: catId,
      code: k.code ?? null,
      decreeNumber: k.decreeNumber ?? null,
      description: k.description,
    });
  }

  // Agenda
  for (const a of AGENDA_SEEDS) {
    const [ada] = await db
      .select({ id: agendaKegiatan.id })
      .from(agendaKegiatan)
      .where(and(eq(agendaKegiatan.villageId, villageId), eq(agendaKegiatan.judul, a.judul)))
      .limit(1);
    if (ada) continue;
    await db.insert(agendaKegiatan).values({
      villageId,
      judul: a.judul,
      mulai: a.mulai,
      selesai: a.selesai,
      lokasi: a.lokasi,
      deskripsi: a.deskripsi,
      tayang: a.tayang,
    });
  }

  // Halaman statis
  for (const h of HALAMAN_SEEDS) {
    const [ada] = await db
      .select({ id: halamanStatis.id })
      .from(halamanStatis)
      .where(and(eq(halamanStatis.villageId, villageId), eq(halamanStatis.slug, h.slug)))
      .limit(1);
    if (ada) continue;
    await db.insert(halamanStatis).values({
      villageId,
      judul: h.judul,
      slug: h.slug,
      isi: h.isi,
      aktif: true,
    });
  }

  // Dokumen publik
  for (const d of DOKUMEN_SEEDS) {
    const [ada] = await db
      .select({ id: dokumenPublik.id })
      .from(dokumenPublik)
      .where(and(eq(dokumenPublik.villageId, villageId), eq(dokumenPublik.slug, d.slug)))
      .limit(1);
    if (ada) continue;
    await db.insert(dokumenPublik).values({
      villageId,
      nama: d.nama,
      slug: d.slug,
      kategori: d.kategori,
      jenis: d.jenis,
      nomor: d.nomor,
      tahun: d.tahun,
      berkas: `/1/dokumen/${d.berkas}.pdf`,
      keterangan: d.keterangan,
      aktif: true,
    });
  }

  // Menu publik
  const [menuAda] = await db
    .select({ id: menuPublik.id })
    .from(menuPublik)
    .where(eq(menuPublik.villageId, villageId))
    .limit(1);
  if (!menuAda) {
    for (const m of MENU_SEEDS) {
      const inserted = unwrap(
        await db
          .insert(menuPublik)
          .values({
            villageId,
            nama: m.nama,
            link: m.link,
            linkTipe: m.linkTipe,
            urut: m.urut,
            parentId: null,
          })
          .$returningId(),
      );
      if (m.anak?.length) {
        for (const a of m.anak) {
          await db.insert(menuPublik).values({
            villageId,
            nama: a.nama,
            link: a.link,
            linkTipe: a.linkTipe,
            urut: a.urut,
            parentId: inserted.id,
          });
        }
      }
    }
  }

  // Widget
  const [widgetAda] = await db
    .select({ id: widget.id })
    .from(widget)
    .where(eq(widget.villageId, villageId))
    .limit(1);
  if (!widgetAda) {
    for (const w of WIDGET_SEEDS) {
      await db.insert(widget).values({
        villageId,
        judul: w.judul,
        isi: w.isi,
        jenis: w.jenis,
        urut: w.urut,
        aktif: true,
      });
    }
  }

  // Pengaturan
  for (const [kunci, nilai] of Object.entries(PENGATURAN_SEEDS)) {
    const [ada] = await db
      .select({ id: pengaturanDesa.id })
      .from(pengaturanDesa)
      .where(and(eq(pengaturanDesa.villageId, villageId), eq(pengaturanDesa.kunci, kunci)))
      .limit(1);
    if (ada) {
      await db
        .update(pengaturanDesa)
        .set({ nilai: JSON.stringify(nilai) })
        .where(eq(pengaturanDesa.id, ada.id));
    } else {
      await db.insert(pengaturanDesa).values({
        villageId,
        kunci,
        nilai: JSON.stringify(nilai),
      });
    }
  }
}

export async function seedKwalaGunung(): Promise<number> {
  await seedReferenceCatalogs();
  console.log("• katalog referensi kependudukan disiapkan");

  // village 1 harus menjadi Kwala Gunung agar path media /1/... cocok.
  const villageId = await ensureVillage(VILLAGE_DATA as VillageSeedData);
  console.log(`• village id = ${villageId}`);

  const roleIds = new Map<string, number>();
  for (const role of ROLE_SEEDS) {
    roleIds.set(role.slug, await upsertRole(villageId, role));
  }
  console.log(`• ${roleIds.size} role disiapkan`);

  const slugToId = await upsertModules(villageId);
  console.log(`• ${slugToId.size} modul disiapkan`);

  await seedSuratCatalog(villageId);
  await seedKeuanganTemplate();
  console.log("• katalog persuratan disiapkan");
  console.log("• pohon rekening APBDes disiapkan");

  for (const role of ROLE_SEEDS) {
    const roleId = roleIds.get(role.slug);
    if (roleId !== undefined) {
      await replaceGrants(role.slug, roleId, role.grants, slugToId);
    }
  }
  console.log("• matriks akses disiapkan");

  const adminRoleId = roleIds.get("administrator");
  if (adminRoleId === undefined) throw new Error("Role administrator tidak ditemukan.");

  await ensureAdminUser(villageId, adminRoleId);
  console.log("• pengguna administrator disiapkan");

  // Syarat surat (opsional, abaikan jika gagal)
  try {
    await seedSyaratSurat(villageId);
  } catch (e) {
    console.log("• seedSyaratSurat dilewati:", (e as Error).message);
  }

  await generateMedia(villageId);
  await unduhGambarBerita(villageId);
  await seedKwalaKonten(villageId);
  console.log("• konten publik Kwala Gunung disiapkan");

  await seedTema(villageId, JSON.stringify(TEMA_OPSI));
  console.log("• tema esensi + opsi warna desa diaktifkan");

  return villageId;
}
