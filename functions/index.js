// Cloud Function `lacakKerjaSama` — akses publik Lacak Kerja Sama
// (KOREKSI 2026-11-15: klien tidak punya login/akun; klien mengakses
// dokumen kerja samanya dengan memasukkan nomor PKS / nomor tagihan).
//
// KENAPA PERLU FUNCTION (bukan hanya Firestore Rules):
// - Lookup lewat nomor TAGIHAN + daftar terkait (tagihan, dokumen,
//   pembayaran per kontrak) membutuhkan query/list di Firestore.
//   Rules TIDAK bisa membatasi query/list ke satu kontrak saja — bila
//   list diizinkan, siapa pun bisa mendaftar semua dokumen.
// - Function ini memeriksa kode server-side (Admin SDK, melewati rules)
//   dan hanya mengembalikan data SATU kontrak yang cocok. Tidak ada
//   jalan untuk mendaftar atau menghitung kontrak lain dari function ini.
// - Lookup lewat nomor PKS saja sebenarnya bisa lewat get-by-ID publik
//   (lihat blok "Akses publik Lacak" di firestore.rules), tapi daftar
//   terkaitnya tetap butuh function ini — jadi function adalah SATU
//   jalur lengkap untuk mode Firestore.
//
// CARA DEPLOY (sekali, oleh operator aplikasi):
//   1. Pasang Firebase CLI bila belum ada:  npm install -g firebase-tools
//   2. Masuk:  firebase login
//   3. Masuk ke folder repo ini, lalu:  cd functions && npm install && cd ..
//   4. Tambahkan bagian functions ke firebase.json bila belum ada:
//        "functions": { "source": "functions" }
//      (file ini sudah ditambahkan koordinator — periksa isinya.)
//   5. Deploy hanya function ini:
//        firebase deploy --only functions:lacakKerjaSama
//      Region: asia-southeast2 (Jakarta — sama dengan lokasi Firestore).
//   6. Paket Spark umumnya cukup: function ini hanya mengakses Firestore
//      (layanan Google). Bila console meminta upgrade, aktifkan Blaze
//      (pay-as-you-go) dan periksa tagihan.
//   7. Periksa di Firebase console → Functions: status "Active", tanpa error.
//
// CARA PAKAI DARI APLIKASI (belum diimplementasikan — tindak lanjut):
//   Di App.tsx / Lacak.tsx, bila Firebase terkonfigurasi, panggil:
//     import { getFunctions, httpsCallable } from 'firebase/functions';
//     const lacak = httpsCallable(getFunctions(app, 'asia-southeast2'), 'lacakKerjaSama');
//     const hasil = await lacak({ kode });
//   Bila `hasil.data.ditemukan` false → tampilkan "Nomor tidak ditemukan".
//   Bila function belum di-deploy / gagal → fallback ke data seed
//   (mode contoh) seperti sekarang, dan tampilkan catatan jujur.
//   TIDAK ADA secret di file ini: Admin SDK memakai kredensial default
//   lingkungan Cloud Functions.
//
// STATUS: STUB — ditulis dari dokumentasi Firebase, BELUM diuji deploy
// maupun dipanggil dari aplikasi. Jangan klaim Lacak mode Firestore
// sudah berfungsi penuh sebelum langkah 5–7 di atas selesai dan
// pemanggilan dari aplikasi diimplementasikan + diverifikasi live.

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();

const db = getFirestore();

function docDenganId(snap) {
  return { id: snap.id, ...snap.data() };
}

/**
 * Lacak satu kerja sama berdasarkan kode transaksi (nomor PKS atau nomor
 * tagihan). Callable — boleh dipanggil tanpa login (akses publik).
 * Kembalian: { ditemukan: false } bila tidak ada yang cocok, atau
 * { ditemukan: true, kontrak, tagihan, dokumen, pembayaran } — hanya
 * data kontrak yang cocok itu, tanpa data kontrak lain.
 */
exports.lacakKerjaSama = onCall(
  { region: 'asia-southeast2' },
  async (request) => {
    const kodeMentah = request.data && request.data.kode;
    if (typeof kodeMentah !== 'string' || kodeMentah.trim() === '') {
      throw new HttpsError(
        'invalid-argument',
        'Kode transaksi wajib diisi (nomor PKS atau nomor tagihan).',
      );
    }
    const kode = kodeMentah.trim();
    if (kode.length > 100) {
      throw new HttpsError('invalid-argument', 'Kode transaksi terlalu panjang.');
    }

    // 1. Cari kontrak berdasarkan nomorPks (persis, case-sensitive —
    //    nomor PKS di sumber memakai huruf besar; normalisasi huruf
    //    dilakukan di sisi klien sebelum memanggil).
    let kontrakSnap = null;
    const kontrakQuery = await db
      .collection('kontrak')
      .where('nomorPks', '==', kode)
      .limit(1)
      .get();
    if (!kontrakQuery.empty) {
      kontrakSnap = kontrakQuery.docs[0];
    } else {
      // 2. Cari tagihan berdasarkan nomor, lalu ambil kontraknya.
      const tagihanQuery = await db
        .collection('tagihan')
        .where('nomor', '==', kode)
        .limit(1)
        .get();
      if (tagihanQuery.empty) {
        return { ditemukan: false };
      }
      const kontrakId = tagihanQuery.docs[0].data().kontrakId;
      if (typeof kontrakId !== 'string' || kontrakId === '') {
        return { ditemukan: false };
      }
      // ID dokumen kontrak adalah bentuk encodeURIComponent dari id
      // entitas (firestoreStore.ts: kodeIdDokumen) — '/' tidak boleh
      // ada di ID dokumen Firestore.
      kontrakSnap = await db
        .collection('kontrak')
        .doc(encodeURIComponent(kontrakId))
        .get();
      if (!kontrakSnap.exists) {
        return { ditemukan: false };
      }
    }

    const kontrak = docDenganId(kontrakSnap);

    // 3. Daftar terkait — HANYA untuk kontrak yang cocok ini.
    const [tagihanSnap, dokumenSnap] = await Promise.all([
      db.collection('tagihan').where('kontrakId', '==', kontrak.id).get(),
      db.collection('dokumen').where('kontrakId', '==', kontrak.id).get(),
    ]);
    const tagihan = tagihanSnap.docs.map(docDenganId);
    const dokumen = dokumenSnap.docs.map(docDenganId);

    // Pembayaran menaut ke tagihan (operator 'in' dibatasi 30 nilai —
    // satu kontrak nyata hanya punya 1 tagihan, tapi tetap di-chunk).
    const pembayaran = [];
    const tagihanIds = tagihan.map((t) => t.id);
    for (let i = 0; i < tagihanIds.length; i += 30) {
      const potong = tagihanIds.slice(i, i + 30);
      const bayarSnap = await db
        .collection('pembayaran')
        .where('tagihanId', 'in', potong)
        .get();
      pembayaran.push(...bayarSnap.docs.map(docDenganId));
    }

    return { ditemukan: true, kontrak, tagihan, dokumen, pembayaran };
  },
);
