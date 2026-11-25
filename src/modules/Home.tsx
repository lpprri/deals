// Halaman Home di dalam aplikasi admin (koreksi pengguna 15/11/2026,
// merevisi perilaku Home dari PR #34): Home BUKAN landing page dan BUKAN
// logout — tampilan modul biasa yang sengaja kosong untuk saat ini.
// Sesi operator tetap berjalan; landing page hanya tercapai lewat
// Keluar di panel Profil (footer sidebar dihapus 23/11/2026).
// Tanpa data, tanpa fetch, tanpa tombol.

export default function Home() {
  return (
    <p className="rounded-md border border-dashed border-[#2573e2]/40 bg-[#2573e2]/5 px-4 py-6 text-center text-sm text-[#0d2569]/70">
      Halaman ini sengaja dikosongkan untuk saat ini.
    </p>
  );
}
