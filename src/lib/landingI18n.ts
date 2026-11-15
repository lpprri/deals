// Kamus dual bahasa (Indonesia + Inggris) untuk landing page publik
// "Partnership LPP RRI".
//
// ATURAN (keputusan pengguna 2026-11-15):
// - Landing page DUAL BAHASA dengan tombol pilihan bahasa, default Bahasa
//   Indonesia. Dashboard/aplikasi tetap Inggris penuh — kamus ini HANYA
//   untuk landing page.
// - Semua teks di sini adalah TEKS UI. Tidak ada data karangan: angka,
//   tarif, dan daftar yang belum ada datanya ditulis sebagai placeholder
//   jujur, bukan diisi dengan nilai rekaan.
// - Kontak (jawaban §8 pengguna 2026-11-15): alamat pakai fakta yang ada
//   ("Kantor Pusat LPP RRI, Jakarta"); telepon/email DUMMY yang jelas
//   ditandai "(contoh)"/"(sample)"; jam layanan 08.00–16.00 WIB. Jangan
//   publikasikan email pribadi siapa pun.
// - Our Clients HANYA menampilkan perusahaan/institusi resmi YANG MEMILIKI
//   LOGO; logo klien belum ada filenya, jadi registry kosong + empty state
//   (kunci klienKosong/klienKosongDesk) — tanpa monogram teks.
// - Kunci-kunci di bawah adalah KONTRAK antar worker landing page: jangan
//   ubah nama kunci. Worker 2 memakai layanan*/ruangan*/lahan*, Worker 3
//   memakai lacak*/tentang*, Worker 1 (file ini + Beranda.tsx) memakai
//   sisanya — tetapi SEMUA kunci ditulis di sini agar KAMUS lengkap.

export type BahasaLanding = 'id' | 'en';

export interface KamusLanding {
  navBeranda: string;
  navLayanan: string;
  navKolaborasi: string;
  navLacak: string;
  navTentang: string;
  navKontak: string;
  navMasuk: string;
  navBahasa: string;
  heroJudul: string;
  heroSubjudul: string;
  heroCtaAjukan: string;
  heroCtaLacak: string;
  heroStatSatker: string;
  heroStatKlien: string;
  heroStatKontrak: string;
  layananJudul: string;
  layananSubjudul: string;
  layananDisplayAds: string;
  layananDisplayAdsDesk: string;
  layananPublishEvent: string;
  layananPublishEventDesk: string;
  layananSupportProgram: string;
  layananSupportProgramDesk: string;
  layananBookRoom: string;
  layananBookRoomDesk: string;
  layananRentSpace: string;
  layananRentSpaceDesk: string;
  layananAjukan: string;
  layananSubAdlibs: string;
  layananSubSpot: string;
  layananSubGreeting: string;
  layananSubLiveBroadcast: string;
  layananSubLiveReport: string;
  layananSubNewsCoverage: string;
  layananSubPodcast: string;
  kolaborasiJudul: string;
  kolaborasiSubjudul: string;
  kolaborasiJoinEvent: string;
  kolaborasiJoinEventDesk: string;
  kolaborasiMediaPartner: string;
  kolaborasiMediaPartnerDesk: string;
  ruanganJudul: string;
  ruanganPilihKota: string;
  ruanganPilihJenis: string;
  ruanganPilihKegiatan: string;
  ruanganTanggal: string;
  ruanganJenisAuditorium: string;
  ruanganJenisRapat: string;
  ruanganJenisMultipurpose: string;
  ruanganJenisAula: string;
  ruanganKegiatanPernikahan: string;
  ruanganKegiatanLomba: string;
  ruanganKegiatanMeeting: string;
  ruanganKegiatanPameran: string;
  ruanganKegiatanLainnya: string;
  ruanganKapasitas: string;
  ruanganTarif: string;
  ruanganTarifContoh: string;
  ruanganKosong: string;
  ruanganKosongDesk: string;
  ruanganAjukan: string;
  lahanJudul: string;
  lahanPilihKota: string;
  lahanKosong: string;
  lahanKosongDesk: string;
  lahanAjukan: string;
  lahanCocokUntuk: string;
  lahanLuas: string;
  lahanTarifEstimasi: string;
  tentangJudul: string;
  profilJudul: string;
  profilIsi: string;
  kontakJudul: string;
  kontakAlamat: string;
  kontakTelepon: string;
  kontakEmail: string;
  kontakJam: string;
  kontakContoh: string;
  klienJudul: string;
  klienKosong: string;
  klienKosongDesk: string;
  faqJudul: string;
  faq1Q: string;
  faq1A: string;
  faq2Q: string;
  faq2A: string;
  faq3Q: string;
  faq3A: string;
  faq4Q: string;
  faq4A: string;
  caraJudul: string;
  caraLangkah1Judul: string;
  caraLangkah1Desk: string;
  caraLangkah2Judul: string;
  caraLangkah2Desk: string;
  caraLangkah3Judul: string;
  caraLangkah3Desk: string;
  ctaJudul: string;
  ctaDesk: string;
  ctaTombol: string;
  footerDesk: string;
  footerLayanan: string;
  footerTentang: string;
  footerBantuan: string;
  footerHakCipta: string;
  umumKembaliBeranda: string;
}

export const KAMUS: Record<BahasaLanding, KamusLanding> = {
  id: {
    navBeranda: 'Beranda',
    navLayanan: 'Layanan',
    navKolaborasi: 'Kolaborasi',
    navLacak: 'Lacak',
    navTentang: 'Tentang Kami',
    navKontak: 'Hubungi Kami',
    navMasuk: 'Masuk',
    navBahasa: 'Bahasa',
    heroJudul: 'Bermitra dengan RRI, Suara Anda Menjangkau Indonesia',
    heroSubjudul:
      'Iklankan usaha Anda, publikasikan acara, dukung program, pesan ruangan, atau sewa lahan di jaringan RRI di seluruh Indonesia — tanpa perlu membuat akun.',
    heroCtaAjukan: 'Ajukan Permohonan',
    heroCtaLacak: 'Lacak Kerja Sama',
    heroStatSatker: 'Satuan kerja di seluruh Indonesia',
    heroStatKlien: 'Klien tercatat',
    heroStatKontrak: 'Kontrak tercatat',
    layananJudul: 'Layanan Kami',
    layananSubjudul:
      'Lima cara bermitra dengan RRI — semua pengajuan dibuat tanpa akun dan diproses oleh Operator Layanan & Pengembangan Usaha.',
    layananDisplayAds: 'Display an Ads',
    layananDisplayAdsDesk:
      'Tampilkan iklan Anda di siaran RRI: adlibs, spot iklan, dan greeting.',
    layananPublishEvent: 'Publish an Event',
    layananPublishEventDesk:
      'Publikasikan acara Anda lewat siaran langsung, laporan langsung, dan liputan berita RRI.',
    layananSupportProgram: 'Support a Program',
    layananSupportProgramDesk:
      'Dukung podcast RRI sebagai mitra pendukung program.',
    layananBookRoom: 'Book a Room',
    layananBookRoomDesk:
      'Pesan ruangan RRI untuk kegiatan Anda: auditorium, ruang rapat, ruang multi-purpose, atau aula.',
    layananRentSpace: 'Rent a Space',
    layananRentSpaceDesk:
      'Sewa lahan RRI untuk kegiatan usaha Anda — ajukan dulu, tarif dikonfirmasi Operator.',
    layananAjukan: 'Ajukan',
    layananSubAdlibs: 'Adlibs',
    layananSubSpot: 'Spot Iklan',
    layananSubGreeting: 'Greeting',
    layananSubLiveBroadcast: 'Live Broadcast',
    layananSubLiveReport: 'Live Report',
    layananSubNewsCoverage: 'Liputan Berita',
    layananSubPodcast: 'Podcast',
    kolaborasiJudul: 'Kolaborasi',
    kolaborasiSubjudul:
      'Bermitra lebih dekat dengan RRI — ikuti acara kami atau jadi media partner.',
    kolaborasiJoinEvent: 'Join Our Event',
    kolaborasiJoinEventDesk:
      'Ikuti acara RRI sebagai peserta atau mitra pelaksana — ajukan keikutsertaan Anda lewat formulir pengajuan.',
    kolaborasiMediaPartner: 'Be Media Partner',
    kolaborasiMediaPartnerDesk:
      'Jadi media partner RRI — liput dan sebarkan program serta acara RRI bersama kami.',
    ruanganJudul: 'Pesan Ruangan',
    ruanganPilihKota: 'Pilih kota',
    ruanganPilihJenis: 'Pilih jenis ruangan',
    ruanganPilihKegiatan: 'Pilih jenis kegiatan',
    ruanganTanggal: 'Tanggal kegiatan',
    ruanganJenisAuditorium: 'Auditorium',
    ruanganJenisRapat: 'Ruang Rapat',
    ruanganJenisMultipurpose: 'Ruang Multi-Purpose',
    ruanganJenisAula: 'Aula',
    ruanganKegiatanPernikahan: 'Pernikahan',
    ruanganKegiatanLomba: 'Lomba',
    ruanganKegiatanMeeting: 'Pertemuan',
    ruanganKegiatanPameran: 'Pameran',
    ruanganKegiatanLainnya: 'Lainnya',
    ruanganKapasitas: 'Kapasitas',
    ruanganTarif: 'Tarif',
    ruanganTarifContoh: 'Tarif contoh — tarif resmi dikonfirmasi Operator',
    ruanganKosong: 'Belum ada ruangan yang dipublikasikan',
    ruanganKosongDesk:
      'Katalog ruangan masih disiapkan Operator. Ajukan dulu kebutuhan Anda lewat formulir pengajuan — jenis ruangan, kegiatan, dan tanggal.',
    ruanganAjukan: 'Ajukan Pemesanan Ruangan',
    lahanJudul: 'Sewa Lahan',
    lahanPilihKota: 'Pilih kota',
    lahanKosong: 'Belum ada lahan yang dipublikasikan',
    lahanKosongDesk:
      'Lahan yang dapat disewa masih disiapkan Operator. Ajukan dulu kebutuhan lahan Anda lewat formulir pengajuan.',
    lahanAjukan: 'Ajukan Sewa Lahan',
    lahanCocokUntuk: 'Cocok untuk',
    lahanLuas: 'Luas',
    lahanTarifEstimasi: 'Tarif estimasi',
    tentangJudul: 'Tentang Kami',
    profilJudul: 'Profil',
    profilIsi:
      'Lembaga Penyiaran Publik Radio Republik Indonesia (LPP RRI) adalah lembaga penyiaran publik Indonesia. Direktorat Layanan & Pengembangan Usaha mengelola kerja sama, layanan siaran, dan pemanfaatan aset RRI bersama 69 satuan kerja di seluruh Indonesia.',
    kontakJudul: 'Hubungi Kami',
    kontakAlamat: 'Kantor Pusat LPP RRI, Jakarta',
    kontakTelepon: '(021) 000-0000',
    kontakEmail: 'contoh@rri.go.id',
    kontakJam: '08.00–16.00 WIB',
    kontakContoh: '(contoh)',
    klienJudul: 'Klien Kami',
    klienKosong: 'Belum ada logo klien yang ditampilkan',
    klienKosongDesk:
      'Hanya perusahaan atau institusi resmi yang memiliki logo yang ditampilkan di sini. Logo klien belum tersedia, sehingga bagian ini masih kosong.',
    faqJudul: 'Pertanyaan yang Sering Diajukan',
    faq1Q: 'Bagaimana cara mengajukan kerja sama dengan RRI?',
    faq1A:
      'Isi formulir pengajuan publik di halaman ini — tanpa akun dan tanpa login. Tulis jenis layanan, judul, dan uraian kebutuhan Anda. Pengajuan Anda masuk antrean Operator dan berstatus Menunggu sampai diproses.',
    faq2Q: 'Bagaimana cara melacak kerja sama saya?',
    faq2A:
      'Masukkan nomor PKS atau nomor tagihan Anda di halaman Lacak. Yang tampil hanya detail kerja sama dari nomor itu — kontrak, dokumen, dan tagihan — tanpa daftar atau pencarian nama.',
    faq3Q: 'Siapa yang memproses pengajuan saya?',
    faq3A:
      'Operator Staf Layanan & Pengembangan Usaha di satuan kerja terkait. Operator memeriksa pengajuan, dan bila disetujui, pengajuan menjadi Prospek baru yang dilanjutkan lewat penawaran, order, dan kontrak.',
    faq4Q: 'Bisakah saya memesan ruangan atau menyewa lahan lewat halaman ini?',
    faq4A:
      'Ya — ajukan lewat formulir pengajuan dengan memilih jenis ruangan atau lahan, kegiatan, dan tanggal. Ini pengajuan dulu, bukan kalender ketersediaan langsung; tarif dan ketersediaan dikonfirmasi Operator.',
    caraJudul: 'Cara Kerja',
    caraLangkah1Judul: 'Ajukan tanpa akun',
    caraLangkah1Desk:
      'Isi formulir pengajuan publik: jenis layanan, judul, dan uraian kebutuhan Anda. Tidak perlu mendaftar atau masuk.',
    caraLangkah2Judul: 'Operator memeriksa & menyetujui',
    caraLangkah2Desk:
      'Operator Layanan & Pengembangan Usaha memeriksa pengajuan Anda. Bila disetujui, pengajuan menjadi Prospek dan dilanjutkan ke penawaran, order, hingga kontrak.',
    caraLangkah3Judul: 'Lacak dengan nomor PKS/tagihan',
    caraLangkah3Desk:
      'Setelah kerja sama berjalan, masukkan nomor PKS atau nomor tagihan di halaman Lacak untuk melihat kontrak, dokumen, dan tagihan Anda.',
    ctaJudul: 'Siap bermitra dengan RRI?',
    ctaDesk:
      'Ajukan permohonan Anda sekarang — tanpa akun, tanpa login. Operator kami akan memeriksa dan menindaklanjutinya.',
    ctaTombol: 'Ajukan Permohonan',
    footerDesk:
      'Portal kerja sama Lembaga Penyiaran Publik Radio Republik Indonesia — iklan, acara, program, ruangan, dan lahan, di seluruh Indonesia.',
    footerLayanan: 'Layanan',
    footerTentang: 'Tentang',
    footerBantuan: 'Bantuan',
    footerHakCipta: '© 2026 LPP RRI. Hak cipta dilindungi undang-undang.',
    umumKembaliBeranda: 'Kembali ke Beranda',
  },
  en: {
    navBeranda: 'Home',
    navLayanan: 'Services',
    navKolaborasi: 'Collaboration',
    navLacak: 'Track',
    navTentang: 'About Us',
    navKontak: 'Contact Us',
    navMasuk: 'Sign in',
    navBahasa: 'Language',
    heroJudul: 'Partner with RRI — Your Voice Reaches Indonesia',
    heroSubjudul:
      "Advertise your business, publish an event, support a programme, book a room, or rent space across RRI's network nationwide — no account needed.",
    heroCtaAjukan: 'Submit a Request',
    heroCtaLacak: 'Track Your Partnership',
    heroStatSatker: 'Work units across Indonesia',
    heroStatKlien: 'Registered clients',
    heroStatKontrak: 'Registered contracts',
    layananJudul: 'Our Services',
    layananSubjudul:
      'Five ways to partner with RRI — every request is made without an account and handled by a Service & Business Development Operator.',
    layananDisplayAds: 'Display an Ads',
    layananDisplayAdsDesk:
      'Put your advertisement on RRI broadcasts: adlibs, ad spots, and greetings.',
    layananPublishEvent: 'Publish an Event',
    layananPublishEventDesk:
      'Publish your event through RRI live broadcasts, live reports, and news coverage.',
    layananSupportProgram: 'Support a Program',
    layananSupportProgramDesk:
      'Support an RRI podcast as a programme partner.',
    layananBookRoom: 'Book a Room',
    layananBookRoomDesk:
      'Book an RRI room for your activity: auditorium, meeting room, multipurpose room, or hall.',
    layananRentSpace: 'Rent a Space',
    layananRentSpaceDesk:
      'Rent RRI land for your business activity — submit a request first; the rate is confirmed by the Operator.',
    layananAjukan: 'Submit a Request',
    layananSubAdlibs: 'Adlibs',
    layananSubSpot: 'Ad Spot',
    layananSubGreeting: 'Greeting',
    layananSubLiveBroadcast: 'Live Broadcast',
    layananSubLiveReport: 'Live Report',
    layananSubNewsCoverage: 'News Coverage',
    layananSubPodcast: 'Podcast',
    kolaborasiJudul: 'Collaboration',
    kolaborasiSubjudul:
      'Partner even closer with RRI — join our events or become a media partner.',
    kolaborasiJoinEvent: 'Join Our Event',
    kolaborasiJoinEventDesk:
      'Join an RRI event as a participant or implementing partner — submit your request through the form.',
    kolaborasiMediaPartner: 'Be Media Partner',
    kolaborasiMediaPartnerDesk:
      'Become an RRI media partner — cover and share RRI programmes and events with us.',
    ruanganJudul: 'Book a Room',
    ruanganPilihKota: 'Choose a city',
    ruanganPilihJenis: 'Choose a room type',
    ruanganPilihKegiatan: 'Choose an activity type',
    ruanganTanggal: 'Activity date',
    ruanganJenisAuditorium: 'Auditorium',
    ruanganJenisRapat: 'Meeting Room',
    ruanganJenisMultipurpose: 'Multipurpose Room',
    ruanganJenisAula: 'Hall',
    ruanganKegiatanPernikahan: 'Wedding',
    ruanganKegiatanLomba: 'Competition',
    ruanganKegiatanMeeting: 'Meeting',
    ruanganKegiatanPameran: 'Exhibition',
    ruanganKegiatanLainnya: 'Other',
    ruanganKapasitas: 'Capacity',
    ruanganTarif: 'Rate',
    ruanganTarifContoh: 'Sample rate — the official rate is confirmed by the Operator',
    ruanganKosong: 'No rooms published yet',
    ruanganKosongDesk:
      'The room catalogue is still being prepared by the Operator. Submit your needs through the request form first — room type, activity, and date.',
    ruanganAjukan: 'Request a Room Booking',
    lahanJudul: 'Rent Space',
    lahanPilihKota: 'Choose a city',
    lahanKosong: 'No land published yet',
    lahanKosongDesk:
      'Land available for rent is still being prepared by the Operator. Submit your land needs through the request form first.',
    lahanAjukan: 'Request Land Rental',
    lahanCocokUntuk: 'Suitable for',
    lahanLuas: 'Area',
    lahanTarifEstimasi: 'Estimated rate',
    tentangJudul: 'About Us',
    profilJudul: 'Profile',
    profilIsi:
      'Lembaga Penyiaran Publik Radio Republik Indonesia (LPP RRI) is Indonesia’s public broadcasting institution. The Directorate of Service & Business Development manages partnerships, broadcast services, and the use of RRI assets together with 69 work units across Indonesia.',
    kontakJudul: 'Contact Us',
    kontakAlamat: 'LPP RRI Head Office, Jakarta',
    kontakTelepon: '(021) 000-0000',
    kontakEmail: 'contoh@rri.go.id',
    kontakJam: '08:00–16:00 WIB',
    kontakContoh: '(sample)',
    klienJudul: 'Our Clients',
    klienKosong: 'No client logos displayed yet',
    klienKosongDesk:
      'Only official companies or institutions that have a logo are shown here. Client logos are not yet available, so this section is still empty.',
    faqJudul: 'Frequently Asked Questions',
    faq1Q: 'How do I submit a partnership request to RRI?',
    faq1A:
      'Fill in the public request form on this page — no account and no sign-in needed. Write the service type, a title, and the details of your request. Your request joins the Operator queue with the status Pending until it is processed.',
    faq2Q: 'How do I track my partnership?',
    faq2A:
      'Enter your PKS number or invoice number on the Track page. Only the details of that partnership are shown — contract, documents, and invoices — with no list or name search.',
    faq3Q: 'Who processes my request?',
    faq3A:
      'A Service & Business Development Operator at the relevant work unit. The Operator reviews the request, and if it is approved, the request becomes a new Prospect, continued through quotation, order, and contract.',
    faq4Q: 'Can I book a room or rent land through this page?',
    faq4A:
      'Yes — submit a request through the form, choosing the room or land type, activity, and date. This is a request first, not a live availability calendar; the rate and availability are confirmed by the Operator.',
    caraJudul: 'How It Works',
    caraLangkah1Judul: 'Submit without an account',
    caraLangkah1Desk:
      'Fill in the public request form: service type, title, and details of your request. No registration or sign-in needed.',
    caraLangkah2Judul: 'The Operator reviews & approves',
    caraLangkah2Desk:
      'A Service & Business Development Operator reviews your request. If approved, it becomes a Prospect and continues to quotation, order, and contract.',
    caraLangkah3Judul: 'Track with your PKS/invoice number',
    caraLangkah3Desk:
      'Once your partnership is underway, enter your PKS or invoice number on the Track page to see your contract, documents, and invoices.',
    ctaJudul: 'Ready to partner with RRI?',
    ctaDesk:
      'Submit your request now — no account, no sign-in. Our Operator will review it and follow up.',
    ctaTombol: 'Submit a Request',
    footerDesk:
      'The partnership portal of Lembaga Penyiaran Publik Radio Republik Indonesia — advertising, events, programmes, rooms, and land, across Indonesia.',
    footerLayanan: 'Services',
    footerTentang: 'About',
    footerBantuan: 'Help',
    footerHakCipta: '© 2026 LPP RRI. All rights reserved.',
    umumKembaliBeranda: 'Back to Home',
  },
};
