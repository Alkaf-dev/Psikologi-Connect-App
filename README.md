# Psikologi Connect

Aplikasi portal akademik Prodi Psikologi STIT Muhammadiyah Kediri.

Repo ini berisi dua bagian:

- Frontend React + Vite di root repo.
- Backend Laravel 12 + Filament + REST API di folder `backend/`.

## Prasyarat

- PHP 8.2+ dengan ekstensi `openssl`, `pdo`, `mbstring`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`, `gd`, `intl`, dan `zip`
- Composer 2
- Node.js 20+ dan npm
- Git

## Clone repo

```bash
git clone https://github.com/Alkaf-dev/psikologi-connect-app.git
cd psikologi-connect-app
```

## 1. Jalankan backend

```bash
cd backend
composer install
```

Buat file environment:

```powershell
copy .env.example .env
```

```bash
# macOS/Linux
cp .env.example .env
```

Lalu siapkan aplikasi dan data demo:

```bash
php artisan key:generate
php artisan sheets:setup --demo
php scripts/create-pjmk-users.php
php artisan serve --host=127.0.0.1 --port=8000
```

API berjalan di `http://127.0.0.1:8000/api/v1`.
Dokumentasi API ada di `backend/docs/openapi.yaml`.

Jika port `8000` sudah dipakai proses lain, gunakan port lain:

```bash
php artisan serve --host=127.0.0.1 --port=8001
```

Sesuaikan `VITE_API_BASE_URL` di frontend jika port backend diubah.

## 2. Jalankan frontend

Buka terminal baru dari root repo:

```bash
npm install
```

Buat file environment frontend:

```powershell
copy .env.example .env
```

```bash
# macOS/Linux
cp .env.example .env
```

Isi `.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Jalankan:

```bash
npm run dev
```

Buka `http://localhost:5173`.

## Akun demo

Semua akun memakai password `password`.

| Login | Role |
| --- | --- |
| `eka` | pjmk |
| `yusa` | pjmk |
| `rusdian` | pjmk |
| `ahya` | pjmk |
| `miqdad` | pjmk |
| `lora` | pjmk |
| `firsta` | pjmk |
| `ica` | pjmk |
| `alkaf` | pjmk |
| `wahyu` | pjmk |
| `rara` | pjmk |
| `bayu` | pjmk |

Login bisa memakai username, email, atau NIM. Pilih Prodi **Psikologi** saat login.

Akun admin bawaan demo tetap tersedia:

| Login | Role |
| --- | --- |
| `admin@psikologi.test` | super_admin |
| `pjmk@psikologi.test` | pjmk |

## Build frontend untuk produksi

Jika frontend dan backend berada di origin yang sama dan `/api` diproxy ke backend:

```powershell
$env:VITE_API_BASE_URL='/api/v1'; npm run build
```

```bash
# macOS/Linux
VITE_API_BASE_URL=/api/v1 npm run build
```

Hasil build ada di `dist/`. Sajikan `dist/` sebagai SPA dan arahkan request `/api` ke backend Laravel.

## Data demo

Backend mode demo memakai file `backend/storage/app/private/demo-sheets.json`.
File tersebut tidak di-commit karena berisi data lokal.

- `php artisan sheets:setup --demo` membuat data awal.
- `php scripts/create-pjmk-users.php` membuat atau memperbarui 12 akun PJMK.
- Untuk mengulang dari awal, hapus `backend/storage/app/private/demo-sheets.json`, lalu jalankan kedua perintah tersebut lagi.

## Panel Laravel opsional

Jika ingin memakai panel Filament di `backend`:

```bash
cd backend
npm install
npm run build
```

Lalu buka `http://127.0.0.1:8000/app`.
