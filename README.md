# KelilingLab — MPI Keliling Bangun Datar

Media Pembelajaran Interaktif (MPI) untuk materi keliling bangun datar **Persegi**, **Persegi Panjang**, dan **Segitiga**, lengkap dengan simulasi interaktif, asesmen 10 soal, papan skor, sistem reward/lencana, ekspor CSV, dan sertifikat siap cetak.

## Deploy ke Vercel

Aplikasi ini sudah dikonfigurasi dengan `vercel.json` (Vite static build ke direktori `dist` dengan SPA fallback). Tidak memerlukan environment variable atau backend tambahan.

### Cara 1: Melalui Dashboard Vercel (GitHub / GitLab / Bitbucket)
1. Unggah proyek ini ke repositori GitHub.
2. Buka [vercel.com/new](https://vercel.com/new) dan impor repositori tersebut.
3. Vercel otomatis mendeteksi konfigurasi dari `vercel.json`:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Klik **Deploy**.

### Cara 2: Melalui Vercel CLI
```bash
npm install -g vercel
vercel
# Untuk deploy produksi:
vercel --prod
```

## Menjalankan Secara Lokal

```bash
npm install
npm run dev
```

## Pengujian & Build Produksi

```bash
npm test
npm run lint
npm run build
npm run preview
```
