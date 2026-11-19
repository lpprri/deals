// Peta UUID blok opsi -> label teks, form Tally "Plan a Campaign" (id ArpNAN).
//
// FAKTA TALLY (terverifikasi via API pada submission laGXkbk, 19/11/2026):
// jawaban pilihan disimpan sebagai UUID BLOK OPSI, bukan teks — mis. B1
// menyimpan ["d774d4c6-9d38-5e4d-8f30-4b0470608ebf"] yang labelnya
// "Social Media Ads". Jawaban teks/tanggal menyimpan teks biasa.
// Karena itu tabel Ads Quotation Request TIDAK BOLEH menampilkan nilai
// mentah — selalu lewat labelOpsiTally() di bawah. Webhook (PR
// terpisah) memakai peta yang sama saat menyimpan/menampilkan.
//
// Sumber: GET /forms/ArpNAN, 19/11/2026 (49 blok opsi). Bila opsi form
// berubah di Tally (tambah/ubah/hapus pilihan), regenerasi peta ini
// dari definisi form yang sama — UUID lama tetap dipetakan supaya
// submission lama tetap terbaca.
export const PETA_OPSI_TALLY: Record<string, string> = {
  '47ad5af8-525d-515b-9f4c-83c39bf82317': 'Radio Ads',
  'd774d4c6-9d38-5e4d-8f30-4b0470608ebf': 'Social Media Ads',
  'c2d0b06d-9d0e-51af-aaf6-4a443452c48d': 'Digital Platform Ads',
  'a396af94-6a37-5103-b5b1-91bbbbe2a8d8': 'Dialogue & Podcast',
  '0d0d7df0-8e36-55b7-b217-a88a789f5605': 'Spot Iklan',
  'adb156d9-64ed-53f1-9ba5-55d30ed3fff0': 'Adlibs',
  '2a064823-ef3b-5282-8bb9-11862b1b4713': 'Advertorial',
  'df19be1b-0904-54e4-843f-2c22c1c99499': 'Jingle',
  '59758383-e4b8-581a-8481-5539b1a1d7ee': 'Programa 1',
  '4a5bf310-6f5b-585b-bb45-f6d50906b485': 'Programa 2',
  '584809b5-ef81-5575-a914-2544617abf63': 'Programa 3',
  '07026f21-90cf-5760-b924-4746650b5487': 'Programa 4',
  'a157f2ff-0249-5eaf-ae6a-544e3bf2186b': 'Belum tahu — butuh rekomendasi',
  'b68523cd-1b70-5776-a013-44bff9384caf': 'Prime Time',
  '62df9cbb-fe9c-5b33-a5f3-b436a0a85b8e': 'Regular Time',
  '4c09f508-6a1c-5149-9e94-04eb7ce8e4c6': 'Belum tahu — butuh rekomendasi',
  '5d872285-7960-57d6-a98b-fd0ff3408576': '30 detik',
  '7e22013a-bcfa-5fcb-a26a-987f53d3d599': '60 detik',
  '1c134777-908e-599a-87b0-e02459ee073d': '120 detik',
  '118484a2-aaca-5858-ae95-d6531df4a9d7': '>120 detik',
  '41aee12b-d902-52cb-9d88-8f163876e00c': 'Instagram',
  '9ff3ea0c-2bc7-5928-a604-3931868d813f': 'TikTok',
  '1c49b9a5-96de-52c7-84a5-caf7eb180630': 'YouTube',
  '12c49581-7a14-531a-b8dd-f4e700a99149': 'Facebook',
  'd2808f18-27d2-515e-8327-b50295118cc9': 'rri.co.id',
  'fbeeea6a-6695-56cc-a3f4-17ba26bc86f4': 'Aplikasi RRI Digital',
  '6ff34536-3719-55ed-9208-c452258c4342': 'Feed / gambar',
  'ba17f9d5-dde5-54fd-9443-361e88594947': 'Reels / video pendek',
  '4817f382-adea-53b1-a97e-10ad71d85ba7': 'Video',
  '4915f221-ed3a-5e61-88eb-6ea73d5e6c40': 'Artikel',
  '551c1f93-605d-5be2-af7d-1f81fac41952': 'Live',
  '8d1fbc02-76dd-57c3-a5bf-88d7b6d6c4a0': 'Lainnya',
  '6b610413-a5d4-5f66-abd0-474c7c65232c': 'Dialog Interaktif',
  '34e574ec-9350-5bd3-8435-ee345a43e3c3': 'Podcast',
  '91d67769-8e66-5d21-8493-6f7b4c1516b5': 'Belum tahu — butuh rekomendasi',
  '2c935d64-93fb-505f-8441-126f40ac8c62': 'Brand awareness',
  '48878d61-8d28-51f0-8e9e-67ce5dd2bf5b': 'Promosi event',
  '478ce6b2-f9e3-5509-ae00-5a4c88427360': 'Promosi produk / penjualan',
  'babfa505-6169-5946-9092-40f2ba02267d': 'Sosialisasi / layanan masyarakat',
  'e73461d4-39d4-5fe0-a2b1-a54074f52d3a': 'Lainnya',
  '8e7cdca7-f51e-51c8-b450-dcf40ec27f6a': 'Sudah ada (siap tayang)',
  'ee6d758d-7ad9-56cc-8d3c-1c8c7d48d354': 'Butuh diproduksi RRI',
  'd102bf09-d3f7-59d1-8d63-7cfc8c3fbe21': 'Belum ada',
  'a6beb2a4-dbf7-59ef-9a5b-36c03acbbd48': 'Di bawah Rp5 juta',
  'f65d269c-4ede-5f02-96d3-94799da213fa': 'Rp5–25 juta',
  '835be58d-bf29-507d-b9d5-3c332a61266d': 'Rp25–100 juta',
  '3728c6da-4f32-5dbb-9cc6-3265cc3822f1': 'Di atas Rp100 juta',
  'bb7421cd-c2bb-57ea-a1d1-a181dc3825c7': 'Belum tahu',
  '27abc438-0e8b-58a3-a0be-fe2dad4d922d': 'Ya, saya bersedia dihubungi',
};

/**
 * Label tampil untuk satu nilai jawaban Tally: UUID blok opsi -> label
 * teksnya; nilai lain (teks/tanggal bebas) dikembalikan apa adanya,
 * supaya jawaban non-pilihan tidak pernah hilang atau kosong.
 */
export function labelOpsiTally(nilai: string): string {
  return PETA_OPSI_TALLY[nilai] ?? nilai;
}
