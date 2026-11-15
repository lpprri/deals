// Registry logo klien untuk section "Our Clients" di landing page.
//
// SENGAJA KOSONG — hanya perusahaan/institusi resmi YANG MEMILIKI LOGO
// yang ditampilkan di landing page. Logo klien belum ada filenya, jadi
// registry ini kosong dan section Our Clients menampilkan empty state
// yang jujur (bukan daftar nama, bukan monogram/inisial teks).
//
// Bila suatu hari logo klien disediakan, tambahkan satu entri per klien
// di DAFTAR_LOGO_KLIEN dengan logo yang di-embed sebagai base64 data URI
// dalam file .ts ini — pola yang sama seperti gedungRri.ts (foto gedung
// RRI untuk panel login). JANGAN fetch logo dari web (logo bisa berubah
// atau hilang tanpa pemberitahuan, dan hotlinking aset pihak lain tidak
// dapat diandalkan), dan JANGAN memakai monogram/inisial teks sebagai
// pengganti logo — klien tanpa file logo tidak ditampilkan sama sekali.
//
// Satu entri = satu institusi. `klienId` adalah pengenal stabil (mis.
// id klien di AppData bila klien itu sudah tercatat, atau slug singkat);
// `nama` dipakai sebagai alt text dan label aksesibilitas; `logoDataUri`
// adalah data URI lengkap, mis. "data:image/png;base64,....".

export interface LogoKlien {
  klienId: string;
  nama: string;
  logoDataUri: string;
}

export const DAFTAR_LOGO_KLIEN: LogoKlien[] = [];
