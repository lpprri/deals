// Dual bahasa ID/EN — Fase 1 (spek dual-bahasa, keputusan pengguna
// 22/11/2026: web menjadi dual bahasa dengan toggle ID/EN, default
// tetap Inggris).
//
// Satu sumber bahasa untuk seluruh aplikasi (landing + publik + admin
// + login). Tanpa pustaka i18n baru: konteks React + kamus bertipe
// (pola yang sama seperti landingI18n.ts dulu). Modul dan halaman
// membaca bahasa dari konteks ini, bukan dari prop berantai.
//
// Kunci localStorage disatukan menjadi 'rri-bahasa' ('id' | 'en').
// Migrasi satu kali: bila 'rri-bahasa' belum ada tetapi kunci lama
// 'rri-bahasa-landing' (Beranda) ada, nilainya dipakai — setelah itu
// kunci lama tidak lagi dibaca. Bila tidak ada keduanya, atau nilainya
// rusak, default 'en'. Pola baca/tulis mengikuti Beranda.tsx dulu dan
// App.tsx untuk 'rri-sidebar-ciut': baca sekali di inisialisasi state,
// tulis di useEffect, bungkus try/catch untuk mode privat.
//
// useBahasa() di luar provider mengembalikan default Inggris (bukan
// throw) supaya komponen bersama tetap aman dirender di mana saja.

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

export type Bahasa = 'id' | 'en';

const KUNCI_BAHASA = 'rri-bahasa';
const KUNCI_LAMA = 'rri-bahasa-landing';

function bacaBahasaTersimpan(): Bahasa {
  try {
    const tersimpan = localStorage.getItem(KUNCI_BAHASA);
    if (tersimpan === 'id' || tersimpan === 'en') return tersimpan;
    const lama = localStorage.getItem(KUNCI_LAMA);
    if (lama === 'id' || lama === 'en') return lama;
  } catch {
    // Penyimpanan tidak tersedia (mode privat, dsb.) — pakai default.
  }
  return 'en';
}

export interface KonteksBahasa {
  bahasa: Bahasa;
  setBahasa: (bahasa: Bahasa) => void;
}

const LanguageContext = createContext<KonteksBahasa>({
  bahasa: 'en',
  setBahasa: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [bahasa, setBahasa] = useState<Bahasa>(bacaBahasaTersimpan);

  useEffect(() => {
    try {
      localStorage.setItem(KUNCI_BAHASA, bahasa);
    } catch {
      // Penyimpanan tidak tersedia (mode privat, dsb.) — abaikan saja.
    }
  }, [bahasa]);

  const nilai = useMemo<KonteksBahasa>(
    () => ({ bahasa, setBahasa }),
    [bahasa],
  );

  // Tanpa JSX (file .ts): createElement, bukan <Provider>.
  return createElement(
    LanguageContext.Provider,
    { value: nilai },
    children,
  );
}

export function useBahasa(): KonteksBahasa {
  return useContext(LanguageContext);
}
