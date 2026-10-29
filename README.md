# Psikologi Connect

Aplikasi portal akademik Prodi Psikologi STIT Muhammadiyah Kediri.

Repo ini khusus **frontend React + Vite**. Backend Laravel dan data akademik berada di project/API terpisah.

## Prasyarat

- Node.js 20+ dan npm
- Git

## Clone repo

```bash
git clone https://github.com/Alkaf-dev/psikologi-connect-app.git
cd psikologi-connect-app
```

## Jalankan frontend

```bash
npm install
```

Buat file environment:

```powershell
copy .env.example .env
```

```bash
# macOS/Linux
cp .env.example .env
```

Pilih salah satu isi `.env`:

```env
# API publik
VITE_API_BASE_URL=https://psikologi.abudzargroup.id/api/v1
```

```env
# Backend lokal langsung
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Jalankan:

```bash
npm run dev
```

Buka `http://localhost:5173`.

Jika memakai `/api/v1`, backend harus berjalan di `http://127.0.0.1:8000` karena Vite mem-proxy request `/api` ke sana.

## Backend/API

Frontend ini hanya mengonsumsi REST API. Backend tidak disertakan di repo ini.

- API publik: `https://psikologi.abudzargroup.id/api/v1`
- API lokal (opsional): `http://127.0.0.1:8000/api/v1`
- Dokumentasi API tersedia di project backend terpisah.
- Backend dan datanya harus tetap berjalan agar login dan data bisa diakses.

## Akun demo

Akun demo `pjmk@psikologi.test` dan `admin@psikologi.test` memakai password `password`. Akun PJMK lain mengikuti data backend.

| Login | Role |
| --- | --- |
| `eka` | pjmk |
| `yusa` | pjmk |
| `rusdian` | pjmk |
| `ahya` | pjmk |
| `miqdad` | pjmk |
| `lora` | pjmk |
| `firsta` | pjmk |
| `raisya` | pjmk |
| `alkaf` | pjmk |
| `wahyu` | pjmk |
| `rara` | pjmk |
| `bayu` | pjmk |

Login bisa memakai username, email, atau NIM. Pilih Prodi **Psikologi** saat login.

Jika login akun PJMK tertentu gagal, reset password akun tersebut di backend.

Akun admin bawaan demo:

| Login | Role |
| --- | --- |
| `admin@psikologi.test` | super_admin |
| `pjmk@psikologi.test` | pjmk |

## Build frontend untuk produksi

```bash
npm run build
```

Hasil build ada di `dist/`.

Untuk build production dengan API publik:

```powershell
$env:VITE_API_BASE_URL='https://psikologi.abudzargroup.id/api/v1'; npm run build
```

```bash
# macOS/Linux
VITE_API_BASE_URL=https://psikologi.abudzargroup.id/api/v1 npm run build
```

Sajikan `dist/` sebagai SPA. API publik sudah diakses langsung, jadi tidak perlu proxy `/api`.

## GitHub Pages

1. API publik sudah menjadi default. Set repository variable `VITE_API_BASE_URL` hanya jika ingin override.
2. Buka Settings -> Pages -> Source, pilih **GitHub Actions**.
3. Push ke `main` atau jalankan workflow **Deploy frontend to GitHub Pages**.

Halaman tersedia di `https://alkaf-dev.github.io/Psikologi-Connect-App/`.

Catatan:

- GitHub Pages hanya menyajikan frontend statis; API tetap harus dapat diakses publik.
- `http://127.0.0.1:8000/api/v1` hanya untuk development di komputer yang menjalankan backend; alamat ini tidak bisa dipakai dari GitHub Pages atau HP.
- Deployment sudah diarahkan ke API publik; pastikan API publik tetap online.

## Deploy cepat

Setelah perubahan frontend:

```bash
npm run deploy -- "pesan commit"
```

Atau:

```powershell
.\deploy.ps1 "pesan commit"
```

Script akan commit dan push ke `main`; GitHub Actions menangani deployment GitHub Pages.
