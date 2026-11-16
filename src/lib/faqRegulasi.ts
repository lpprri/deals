// Daftar kanonis entri FAQ Resources (PR #49, 16/11/2026).
// Pertanyaan yang mungkin ditanyakan tiap operator, yang jawabannya
// BENAR-BENAR ada di 9 dokumen regulasi yang diunggah pengguna — tiap
// jawaban mencantumkan sumbernya (nama regulasi + pasal/bagian bila
// terbaca). TIDAK ada jawaban karangan; pertanyaan yang jawabannya tidak
// ada di dokumen TIDAK dimasukkan.
// Dipakai dua tempat: seed mode contoh (seedNyata.ts) dan aksi seed
// satu-kali mode live (seedFaqRegulasi di App.tsx, idempotent).
// Isi FAQ Bahasa Indonesia (konten turunan regulasi, seperti artikel KB).

import type { FaqItem } from './types';

/** Entri FAQ bersumber regulasi — id stabil FAQ-01, FAQ-02, dst. */
export const FAQ_REGULASI: FaqItem[] = [
  {
    id: 'FAQ-01',
    pertanyaan: 'Apa saja jenis PNBP yang berlaku di LPP RRI saat ini?',
    jawaban:
      'Ada tujuh jenis, yaitu jasa penyiaran, jasa pendidikan dan pelatihan, jasa sertifikasi kompetensi wartawan radio, jasa penggunaan sarana dan prasarana siaran sesuai tugas dan fungsi, jasa digitalisasi penyiaran, jasa produksi program, dan royalti atas kekayaan intelektual produksi penyiaran. Tarif lima jenis pertama tercantum dalam Lampiran PP, sedangkan jasa produksi program dan royalti dilaksanakan berdasarkan kontrak kerja sama.',
    sumber: 'PP 68/2020 Pasal 1 ayat (1)–(4)',
  },
  {
    id: 'FAQ-02',
    pertanyaan:
      'Berapa tarif jasa penyiaran, misalnya iklan, dialog interaktif, dan sandiwara radio?',
    jawaban:
      'Tarif dalam Lampiran PP 68/2020 adalah batas tarif tertinggi. Siaran iklan (spot/jingle/filler/advertorial) Rp1.400.000 per 60 detik (Regular Time) dan Rp1.700.000 (Prime Time); Adlibs Rp1.300.000 (Regular) dan Rp1.800.000 (Prime) per 60 detik; Dialog Interaktif Rp21.000.000 (Regular) dan Rp24.000.000 (Prime) per 50 menit; Sandiwara Radio/Majalah Udara Rp13.000.000 (Regular) dan Rp14.500.000 (Prime) per 30 menit.',
    sumber: 'PP 68/2020 Lampiran I.A–D; Penjelasan Pasal 1 ayat (2)',
  },
  {
    id: 'FAQ-03',
    pertanyaan: 'Berapa tarif sewa auditorium, studio, dan sound system RRI?',
    jawaban:
      'Auditorium paket dengan sound system Rp7.500.000 per 4 jam (tambahan Rp750.000 per jam), dan paket dengan sound system, kursi, dan meja Rp10.000.000 per 4 jam (tambahan Rp1.000.000 per jam). Sound system di luar auditorium/studio sampai 1.000 Watt Rp3.000.000 per 4 jam (tambahan Rp300.000 per jam), dan di atas 1.000–5.000 Watt Rp6.000.000 per 6 jam (tambahan Rp600.000 per jam). Studio untuk penyelenggaraan siaran Rp2.000.000 per 3 jam (tambahan Rp200.000 per jam).',
    sumber: 'PP 68/2020 Lampiran IV.A–B',
  },
  {
    id: 'FAQ-04',
    pertanyaan: 'Berapa tarif iklan di website rri.co.id?',
    jawaban:
      'Iklan pada bagian atas (top line) Rp39.000.000 per 7 hari, bagian tengah (top center) dan bagian tengah bawah (bottom center) masing-masing Rp23.000.000 per 7 hari, dan advertorial Rp6.500.000 per berita per hari. Pada tampilan desktop, bagian kanan atas (top right) Rp16.000.000 per 7 hari dan bagian kanan bawah (bottom right) Rp14.000.000 per 7 hari.',
    sumber: 'PP 68/2020 Lampiran V.A–B',
  },
  {
    id: 'FAQ-05',
    pertanyaan:
      'Apakah tarif PNBP bisa Rp0? Kegiatan apa saja yang bisa dikenai tarif Rp0?',
    jawaban:
      'Bisa. Dengan pertimbangan tertentu, tarif PNBP dapat ditetapkan sampai dengan Rp0,00 atau 0%, dengan besaran, persyaratan, dan tata cara yang diatur peraturan LPP RRI setelah mendapat persetujuan Menteri Keuangan. Siaran tertentu yang dapat dikenai tarif Rp0,00 adalah kegiatan kenegaraan, pertahanan dan keamanan, sosial dan budaya, keagamaan, kebencanaan, dan kemanusiaan, yang dapat dilakukan dalam bentuk kerja sama dengan lembaga radio internasional, kedutaan besar negara sahabat, Kementerian/Lembaga, dan Pemerintah Daerah.',
    sumber: 'PP 68/2020 Pasal 6 ayat (1)–(3); Perdirut 5/2023 Pasal 9 ayat (1)–(3)',
  },
  {
    id: 'FAQ-06',
    pertanyaan: 'Siapa yang menetapkan waktu Prime Time dan Regular Time?',
    jawaban:
      'Penetapan waktu Prime Time dan Regular Time ditetapkan oleh masing-masing satuan kerja LPP RRI. Tarif jasa penyiaran sendiri dikelompokkan ke dalam dua klasifikasi waktu siaran tersebut.',
    sumber: 'Perdirut 5/2023 Pasal 4 ayat (1)–(2)',
  },
  {
    id: 'FAQ-07',
    pertanyaan: 'Apa itu tarif 60% dan siapa yang bisa mendapatkannya?',
    jawaban:
      'Terhadap PNBP jasa penyiaran, diklat, sertifikasi wartawan radio, penggunaan sarana prasarana siaran, dan digitalisasi penyiaran dapat dikenakan tarif sebesar 60% dari besaran tarif yang berlaku pada LPP RRI, dengan mempertimbangkan strategi bisnis, persaingan usaha, bagi masyarakat tidak mampu, mahasiswa berprestasi, dan usaha mikro, kecil, dan menengah. Untuk diklat dengan metode e-learning, tarif 60% berlaku untuk umum tanpa pengecualian dan tanpa mengajukan surat permohonan.',
    sumber: 'Perdirut 5/2023 Pasal 5 ayat (1)–(3)',
  },
  {
    id: 'FAQ-08',
    pertanyaan:
      'Berapa nilai minimal perjanjian agar jasa penyiaran atau digitalisasi bisa dikenai tarif 60%?',
    jawaban:
      'Total nilai layanan paling sedikit Rp100 juta per perjanjian untuk Pusat Pemberitaan RRI, Rp75 juta per perjanjian untuk RRI Jakarta, Rp50 juta per perjanjian untuk Satker Tipe B, dan Rp30 juta per perjanjian untuk Satker Tipe C. (Angka Rp75 juta terverifikasi dari gambar halaman 9 Perdirut 5/2023; lapisan teks menuliskannya secara ambigu.)',
    sumber: 'Perdirut 5/2023 Pasal 5 ayat (4) huruf b',
  },
  {
    id: 'FAQ-09',
    pertanyaan:
      'Bagaimana cara mengajukan tarif 60% untuk jasa pendidikan dan pelatihan?',
    jawaban:
      'Dengan menyampaikan surat permohonan yang ditandatangani oleh pimpinan sekolah/perguruan tinggi dan organisasi nirlaba kepada Pimpinan LPP RRI, sesuai contoh format Lampiran II. Pelajar dan mahasiswa harus melampirkan bukti penetapan sebagai pelajar/mahasiswa berprestasi, sedangkan organisasi nirlaba melampirkan akte pendirian atau bukti surat pendirian sebagai organisasi nirlaba secara sah. Pimpinan LPP RRI berhak memberikan persetujuan atau penolakan sesuai Lampiran III.',
    sumber: 'Perdirut 5/2023 Pasal 5 ayat (4) huruf a dan Pasal 6 ayat (1)–(2)',
  },
  {
    id: 'FAQ-10',
    pertanyaan: 'Apa itu Tarif Penyesuaian dan bagaimana rumusnya?',
    jawaban:
      'Tarif Penyesuaian adalah tarif yang diberlakukan atas pertimbangan persaingan usaha dan strategi bisnis untuk jasa penyiaran, dengan rumus: Tarif Penyesuaian = Faktor Penyesuaian (%) × besaran nilai nominal tarif pada Lampiran Peraturan Direktur Utama LPP RRI (Rp). Besaran persentase ditetapkan Kepala Satuan Kerja dengan mempertimbangkan usulan nilai kontrak dari pengguna jasa dan harga pembanding berdasarkan nilai rata-rata kontrak layanan jasa penyiaran sejenis yang dilakukan radio swasta di wilayah kerja satker bersangkutan. Faktor penyesuaian tidak berlaku untuk permohonan layanan yang diajukan instansi pemerintah secara langsung (tanpa pihak ketiga).',
    sumber: 'Perdirut 5/2023 Pasal 8 ayat (1)–(3); Pasal 1 butir 15–16',
  },
  {
    id: 'FAQ-11',
    pertanyaan:
      'Kapan tarif PNBP boleh sebesar nilai nominal yang tercantum dalam kontrak kerja sama?',
    jawaban:
      'Untuk jasa produksi program dan royalti atas kekayaan intelektual produksi penyiaran, tarifnya memang sebesar nilai nominal dalam kontrak kerja sama. Penempatan alat pada menara siaran juga dilaksanakan berdasarkan kontrak dengan tarif sebesar nominal kontrak. Selain itu, jasa penyiaran dan jasa digitalisasi penyiaran — selain yang tercantum dalam Lampiran PP — dapat dilaksanakan berdasarkan kontrak kerja sama dengan tarif sebesar nominal dalam kontrak, dan kontrak tersebut dapat berupa dukungan layanan.',
    sumber:
      'PP 68/2020 Pasal 1 ayat (3)–(4), Pasal 2 ayat (1)–(2), Pasal 3 ayat (1)–(3); Perdirut 11/2023 Pasal 2 ayat (1)–(2)',
  },
  {
    id: 'FAQ-12',
    pertanyaan:
      'Mitra apa saja yang dapat mengajukan pengenaan tarif sebesar nilai nominal dalam kontrak kerja sama?',
    jawaban:
      'Antara lain Kementerian/Lembaga, Instansi Pemerintah Daerah (provinsi dan/atau kabupaten dan/atau kota), Usaha Mikro, Kecil dan Menengah (UMKM), Pelaku Seni dan Budaya, dan mitra lainnya. Tata caranya dengan mengajukan surat permohonan kepada Direktur Utama LPP RRI atau Kepala Satuan Kerja sesuai format Lampiran I Perdirut 11/2023.',
    sumber: 'Perdirut 11/2023 Pasal 3 ayat (7)–(9)',
  },
  {
    id: 'FAQ-13',
    pertanyaan: 'Apa itu dukungan layanan dan apa syarat nilainya?',
    jawaban:
      'Dukungan layanan adalah barang dan/atau jasa yang diberikan mitra kerja untuk mendukung kegiatan Satuan Kerja di lingkungan LPP RRI. Barang dan/atau jasa tersebut dinilai sesuai harga pasar setempat, dan nilainya harus sama dan/atau lebih besar dari nilai jasa penyiaran dan/atau jasa digitalisasi penyiaran yang diberikan oleh LPP RRI. Dukungan layanan dapat diberikan untuk jasa penyiaran dan jasa digitalisasi penyiaran, berdasarkan Calendar of Event pada masing-masing satuan kerja.',
    sumber:
      'Juknis PNBP 13/2025 Pasal 1 butir 29 dan Pasal 2 ayat (3); Perdirut 11/2023 Pasal 12 ayat (1)–(3)',
  },
  {
    id: 'FAQ-14',
    pertanyaan:
      'Berapa denda keterlambatan pembayaran PNBP dan bagaimana cara menghitungnya?',
    jawaban:
      'Wajib Bayar yang tidak membayar melampaui jatuh tempo dikenakan sanksi administratif berupa denda sebesar 2% per bulan dari bagian yang terutang, dan bagian dari bulan dihitung 1 bulan penuh. Denda dikenakan paling lama 24 bulan, dan pengenaan denda harus menjadi bagian yang tak terpisahkan atas dokumen perjanjian kerja sama. Contoh dalam Juknis: utang Rp100.000.000 jatuh tempo 26 Desember 2023, denda mulai dihitung 27 Desember 2023 sebesar Rp2.000.000 per bulan, kumulatif menjadi Rp4.000.000 pada bulan ke-2, Rp6.000.000 pada bulan ke-3, hingga Rp48.000.000 pada bulan ke-24.',
    sumber: 'Juknis PNBP 13/2025 Pasal 21 ayat (1)–(3) dan (5)',
  },
  {
    id: 'FAQ-15',
    pertanyaan:
      'Apakah denda keterlambatan berlaku untuk piutang sewa aset atau sewa menara?',
    jawaban:
      'Tidak. Pengenaan denda tidak diberlakukan atas Piutang PNBP yang berasal dari pengelolaan Aset, karena seluruh Perjanjian Kerja Sama pengelolaan Aset pembayarannya dilakukan di muka, termasuk sewa menara.',
    sumber: 'Juknis PNBP 13/2025 Pasal 21 ayat (4)',
  },
  {
    id: 'FAQ-16',
    pertanyaan:
      'Berapa lama jatuh tempo pembayaran invoice dan kapan Surat Penagihan (SPn) diterbitkan?',
    jawaban:
      'Jatuh tempo pembayaran oleh klien atas Surat Permohonan Pembayaran dan invoice adalah 17 hari kerja. Invoice, billing SIMPONI, dan Surat Permohonan Pembayaran disampaikan kepada klien selambat-lambatnya 3 hari kerja setelah jasa diberikan. SPn 1 diterbitkan paling lambat 7 hari kerja sejak jatuh tempo, beserta denda 2% per bulan; bila 1 bulan sejak SPn 1 belum lunas, diterbitkan SPn 2 dengan denda 4%; bila 1 bulan sejak SPn 2 belum lunas, diterbitkan SPn 3 dengan denda 6% dan tembusan kepada PUPN; bila 3 bulan sejak SPn 3 belum lunas, piutang macet diserahkan pengurusannya kepada PUPN.',
    sumber: 'Juknis PNBP 13/2025 Pasal 8 ayat (1) dan (3)–(8)',
  },
  {
    id: 'FAQ-17',
    pertanyaan: 'Bagaimana piutang PNBP diklasifikasikan?',
    jawaban:
      'Piutang PNBP diakui saat timbul hak tagih, yaitu saat Petugas Penyetor menerbitkan invoice. Klasifikasinya: Piutang Lancar (belum lunas sampai tanggal jatuh tempo); Piutang Kurang Lancar (30 hari kalender sejak tanggal SPn 1 tidak dilakukan pelunasan); Piutang Diragukan (30 hari kalender sejak tanggal SPn 2); dan Piutang Macet (30 hari kalender sejak tanggal SPn 3).',
    sumber: 'Juknis PNBP 13/2025 Pasal 18 dan Pasal 19 ayat (1)–(5)',
  },
  {
    id: 'FAQ-18',
    pertanyaan:
      'Berapa penyisihan piutang tak tertagih untuk tiap klasifikasi piutang?',
    jawaban:
      'Piutang disajikan dalam neraca pada nilai yang dapat direalisasikan (net realizable value) dengan membentuk penyisihan piutang tak tertagih berdasarkan kualitas piutang: Lancar 0,5%, Kurang Lancar 10%, Diragukan 50%, dan Macet 100% (piutang telah diserahkan kepada Panitia Urusan Piutang Negara/DJKN).',
    sumber: 'Juknis PNBP 13/2025 Pasal 20 ayat (5)',
  },
  {
    id: 'FAQ-19',
    pertanyaan:
      'Bagaimana cara pembayaran PNBP — apakah bisa di muka, termin, atau di akhir?',
    jawaban:
      'Pembayaran PNBP fungsional (kecuali sewa menara) dapat dilakukan dengan tiga metode: pembayaran di muka; pembayaran atas Kontrak Pekerjaan Tahunan dengan mekanisme termin, di mana termin pertama dilakukan dengan syarat 50% dari jumlah paket volume siar dalam perjanjian kerja sama; atau pembayaran di akhir setelah layanan diberikan. Pembayaran PNBP atas Pengelolaan Aset dilakukan secara sekaligus paling lambat 2 hari kerja sebelum penandatanganan PKS, dengan menyetor ke Rekening Kas Umum Negara.',
    sumber: 'Juknis PNBP 13/2025 Pasal 10 ayat (1)–(3)',
  },
  {
    id: 'FAQ-20',
    pertanyaan:
      'Siapa saja petugas pengelola PNBP dan apa tugas Petugas Operasional?',
    jawaban:
      'Petugas Pengelola PNBP terdiri dari Bendahara Penerimaan, Petugas Operasional, Petugas Operator Siaran, dan Petugas Penyetor, yang ditunjuk melalui Surat Keputusan. Petugas Operasional bertugas membuat perjanjian kerja sama (PKS), membuat nota kesepahaman (MoU), membuat nota penyiaran, membuat rekapitulasi perjanjian kerja sama, menyampaikan invoice kepada klien, menyelesaikan penagihan dan pembayaran, serta melakukan rekonsiliasi antara data kontrak kerja sama dengan data penerimaan yang telah disetor ke Kas Negara.',
    sumber: 'Juknis PNBP 13/2025 Pasal 7 ayat (1)–(4)',
  },
  {
    id: 'FAQ-21',
    pertanyaan: 'Bagaimana target PNBP satuan kerja disusun?',
    jawaban:
      'Setiap satuan kerja menyusun target PNBP untuk 1 tahun ke depan dengan memperhitungkan realisasi penerimaan 3 tahun sebelumnya, perkiraan tahun berjalan, rencana realisasi 1 tahun ke depan, dan rencana realisasi 3 tahun ke depan. Penyusunan menggunakan Aplikasi SIMPONI V2, yang hanya dilaksanakan oleh Direktorat Layanan dan Pengembangan Usaha. Target disampaikan kepada Direktur Utama cq. Direktur Keuangan dan Direktur Layanan dan Pengembangan Usaha paling lambat bulan Februari tahun anggaran berjalan, dengan melampirkan data pendukung, dan harus dicantumkan dalam RKAKL masing-masing satuan kerja.',
    sumber:
      'Juknis PNBP 13/2025 Pasal 3, Pasal 4 ayat (1)–(4), Pasal 5 ayat (1)–(2), Pasal 6 ayat (1)',
  },
  {
    id: 'FAQ-22',
    pertanyaan:
      'Berapa lama maksimal masa sewa penempatan alat di menara siaran dan bagaimana prosedurnya?',
    jawaban:
      'Masa sewa kontrak penempatan alat pada menara siaran maksimal 3 tahun, dan tarifnya sebesar nilai nominal yang tercantum dalam kontrak kerja sama. Prosedurnya: mitra melakukan uji kekuatan menara menggunakan jasa konsultan uji menara dengan biaya ditanggung penyewa/mitra, lalu mengajukan surat izin penggunaan kepada Kepala Satuan Kerja; Kepala Satuan Kerja mengajukan izin kepada Direktur Teknologi dan Media Baru dengan melampirkan hasil uji kekuatan menara; Direktur berhak menyetujui atau menolak, dan Kepala Satuan Kerja menjawab surat izin kepada mitra. Uji kekuatan dilakukan untuk setiap penyewa baru dan/atau perpanjangan sewa, dan masa validasi hasil uji berlaku maksimal 30 hari kerja; jenis menara yang disewakan adalah Self Supporting.',
    sumber: 'Perdirut 11/2023 Pasal 5 ayat (1)–(3) dan Pasal 7 (hal. 11–13)',
  },
  {
    id: 'FAQ-23',
    pertanyaan:
      'Seberapa jauh di bawah antena RRI antena mitra dipasang di menara?',
    jawaban:
      'Pemasangan antena mitra 10 meter di bawah antena sistem pemancar RRI. Penambahan komponen antena sudah diperhitungkan sejak awal kontrak sebagai pemesanan beban, ditinjau dari data perhitungan kekuatan menara.',
    sumber: 'Perdirut 11/2023 Pasal 8 ayat (1) (hal. 13)',
  },
  {
    id: 'FAQ-24',
    pertanyaan: 'Dokumen apa saja yang digunakan dalam alur kerja sama?',
    jawaban:
      'Dokumen-dokumen yang dipakai antara lain Perikatan/Perjanjian Kerja Sama (PKS) sebagai dokumen acuan pelaksanaan kerja sama, Nota Kesepahaman (MoU), Nota Penyiaran, Media Order, Bukti Siar, Berita Acara Penyelesaian Pekerjaan, Invoice, dan Term of Reference (TOR). Dalam siklus penagihan PNBP, dokumen yang dipakai adalah Surat Permohonan Pembayaran, Invoice, billing SIMPONI, Surat Penagihan (SPn), Kartu Piutang, kwitansi, dan Bukti Setor/Billing SIMPONI atau SIMAN V.2 sebagai lampiran PKS. Perlu dicatat: tidak ada satu pun dari 9 dokumen ini yang memuat daftar "dokumen wajib" yang eksplisit per jenis kerja sama/sewa — daftar di atas adalah kumpulan dokumen/format yang disebut dalam peraturan dan pedoman.',
    sumber:
      'Pedoman LPU 2019 Daftar Lampiran (30 format) dan BAB I (definisi dokumen); Juknis PNBP 13/2025 Pasal 1 butir 12, 16, 17, 20 dan Pasal 10 ayat (4)',
  },
  {
    id: 'FAQ-25',
    pertanyaan:
      'Apa yang dimaksud dengan fasilitas dibebaskan dari PPN atas barang strategis?',
    jawaban:
      'Impor dan/atau penyerahan Barang Kena Pajak tertentu yang bersifat strategis dibebaskan dari pengenaan PPN, dengan menggunakan Surat Keterangan Bebas (SKB) PPN atau tanpa SKB PPN. Barang yang dibebaskan antara lain mesin dan peralatan pabrik yang merupakan satu kesatuan dan digunakan langsung dalam proses menghasilkan Barang Kena Pajak (tidak termasuk suku cadang), barang hasil usaha kelautan dan perikanan, ternak, bibit/benih, serta pakan ternak dan pakan ikan. Bila barang yang telah dibebaskan digunakan tidak sesuai tujuan semula atau dipindahtangankan, PPN-nya wajib dibayar kembali paling lambat 1 bulan, dan keterlambatan pembayaran dikenai sanksi administrasi berupa bunga sesuai ketentuan perpajakan. Peraturan ini mengatur PPN, bukan PNBP.',
    sumber:
      'PMK 115/PMK.03/2021 Pasal 2 ayat (1)–(2), Pasal 3 ayat (1), dan Pasal 23 ayat (4) dan (6)',
  },
];
