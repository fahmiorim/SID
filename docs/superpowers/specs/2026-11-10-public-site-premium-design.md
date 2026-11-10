# Rancangan: Situs Publik Desa Lebih Aman dan Premium

## Tujuan

Meningkatkan pengalaman warga pada situs publik desa dengan mengerjakan seluruh rekomendasi secara bertahap: lindungi data DPT, samakan pengalaman lintas halaman, mudahkan penemuan konten, dan poles tampilan agar terasa lebih premium tanpa menghapus identitas tema desa.

## Pendekatan yang dipilih

1. **Bertahap per irisan (dipilih pengguna):** privasi dan konsistensi kerangka lebih dulu, lalu penemuan konten, agenda/statistik/peta, terakhir penyempurnaan visual bersama. Tiap irisan dapat diuji dan ditinjau sebelum lanjut.
2. **Redesign semua halaman sekaligus:** hasil bisa seragam lebih cepat, tetapi perubahan luas menyulitkan peninjauan, berisiko mengganggu tema aktif, dan mencampur isu keamanan dengan presentasi.
3. **Poles visual saja:** lingkup kecil, tetapi tidak menyelesaikan paparan NIK atau celah penemuan informasi.

## Sasaran dan batas

- DPT publik tidak menampilkan atau mengirim NIK lengkap ke browser; pencarian publik memakai nama, bukan NIK.
- Halaman publik yang saat ini memakai kerangka berbeda memiliki navigasi, lebar konten, header/footer, dan pola judul yang konsisten dengan tema aktif.
- Warga dapat menemukan halaman publik lewat navigasi dan tautan kontekstual; berita mendapat akses ke arsip/populer atau penjelajah berita yang sepadan dengan data yang tersedia.
- Agenda publik tersedia sebagai informasi kegiatan yang memang dipilih untuk tayang. Tabel `bumindes_agenda` saat ini adalah buku agenda surat masuk/keluar dan bukan sumber aman untuk kalender publik; data surat internal tidak boleh otomatis dipublikasikan.
- Statistik diperluas hanya sebagai agregat, tanpa identitas atau rincian yang dapat mengungkap penduduk.
- Peta publik memberi tautan kontekstual ke data/layer yang memang diizinkan publik.
- Tampilan lebih premium melalui tipografi, hierarki, ruang, kartu, dan keadaan kosong/error yang rapi; warna dan identitas desa tetap berasal dari tema/tokens aktif.

Bukan sasaran: menyalin kode/aset OpenSID, mengganti identitas visual semua desa dengan satu palet tetap, mengubah pengalaman admin/warga privat, atau memublikasikan data surat/penduduk demi kelengkapan tampilan.

## Urutan irisan

1. **Privasi DPT dan konsistensi dasar:** hilangkan NIK dari keluaran publik di lapisan aplikasi/repository publik dan dari pencarian publik; satukan struktur halaman khusus yang belum mengikuti tema/layout publik.
2. **Penemuan konten:** rapikan menu dan tautan kontekstual; lengkapi arsip/pencarian berita dan penonjolan berita populer bila metrik yang ada aman serta jelas.
3. **Agenda publik yang aman:** gunakan sumber kegiatan publik terpisah atau data yang memiliki pilihan tayang eksplisit; jangan membaca buku agenda surat sebagai kalender publik. Tambahkan halaman dan navigasi agenda setelah sumber aman ditetapkan.
4. **Statistik dan peta:** tambahkan ringkasan agregat yang bermanfaat dan tautan peta yang kontekstual, tenant-scoped, serta hanya untuk layer publik.
5. **Poles premium:** terapkan bahasa visual editorial yang tenang pada komponen/halaman terkait, mempertahankan warna tema, kontras, responsivitas, dan aksesibilitas.

Setiap irisan dipetakan ke ID katalog `OS-POP-005`, `OS-WEB-001`, `OS-WEB-002`, `OS-WEB-006`, `OS-WEB-007`, dan ID publik lain yang benar-benar disentuh setelah pemetaan terhadap katalog aktif.

## Kendala dan keputusan implementasi

- `villageId` publik selalu dari host; jangan menerima tenant dari parameter klien.
- Ikuti Next.js versi repo dan dokumentasi lokalnya; ikuti batas lapisan di `docs/ARCHITECTURE.md`.
- Pertahankan mesin tema dan token `--pub-*`; implementasi visual bersifat orisinal.
- Sebelum menentukan sumber agenda, pastikan model/data kegiatan publik yang ada; bila tidak ada, buat sumber kalender tersendiri dengan status tayang eksplisit, bukan membuka `bumindes_agenda`.
- Jangan mengubah pekerjaan lokal yang tidak terkait.

## Kriteria penerimaan

- NIK tidak ada pada HTML, props/DTO, atau data browser yang dikirim oleh rute DPT publik; kontrol dan query publik tidak lagi menawarkan pencarian NIK; alur administratif DPT tetap berfungsi.
- Halaman publik yang ditargetkan memakai shell tema yang benar pada tema Esensi maupun Natra (atau fallback yang ditetapkan repo), dan navigasinya tidak kehilangan rute yang sudah ada.
- Arsip/pencarian berita dan tautan terkait mengarah ke data tayang saja, mempertahankan scoping desa, serta memiliki bukti perilaku UI.
- Tidak ada surat agenda internal yang tampil di kalender publik tanpa publikasi eksplisit; data agenda publik hanya berisi field yang disetujui untuk tayang.
- Statistik hanya agregat; tautan peta tidak melintasi tenant dan tidak mengungkap layer privat.
- Tampilan beradaptasi untuk layar kecil, tetap dapat dioperasikan dengan keyboard, dan mempertahankan kontras serta warna tema desa.
- Test perilaku dan dokumentasi status diperbarui untuk ID `OS-*` yang terdampak; perubahan tidak dinyatakan selesai tanpa bukti route/UI dan test.

## Hal yang tersisa untuk implementasi

Setelah rancangan ini disetujui, rencana implementasi akan mengikat file/route, sumber data agenda yang aman, urutan test, dan pembaruan dokumen paritas. Tidak ada kode fitur yang diubah sebagai bagian dari rancangan ini.
