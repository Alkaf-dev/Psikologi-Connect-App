const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
export const resolveAsset = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export const MASCOTS = {
  'memegang-buku': {
    gif: resolveAsset('/images/psychology/mascot/memegang-buku.gif'),
    poster: resolveAsset('/images/psychology/mascot/memegang-buku-poster.png'),
    title: 'Data akademik rapi dan siap dibaca.',
    message: 'Kelola mata kuliah dan data mahasiswa dengan teliti agar setiap kegiatan belajar berjalan lancar.',
    alt: 'Maskot Psikologi Connect memegang buku',
    width: 112,
    height: 200,
  },
  membaca: {
    gif: resolveAsset('/images/psychology/mascot/membaca.gif'),
    poster: resolveAsset('/images/psychology/mascot/membaca-poster.png'),
    title: 'Baca tugas dengan saksama.',
    message: 'Periksa instruksi, deadline, dan tautan pengumpulan sebelum mulai mengerjakan.',
    alt: 'Maskot Psikologi Connect sedang membaca',
    width: 112,
    height: 200,
  },
  semangat: {
    gif: resolveAsset('/images/psychology/mascot/semangat.gif'),
    poster: resolveAsset('/images/psychology/mascot/semangat-poster.png'),
    title: 'Semangat berkolaborasi!',
    message: 'Kelompok yang solid membuat tugas dan diskusi terasa lebih ringan.',
    alt: 'Maskot Psikologi Connect memberi semangat',
    width: 112,
    height: 200,
  },
  laptop: {
    gif: resolveAsset('/images/psychology/mascot/laptop.gif'),
    poster: resolveAsset('/images/psychology/mascot/laptop-poster.png'),
    title: 'Siap masuk ke ruang akademik digital?',
    message: 'Gunakan email atau NIM terdaftar, pilih Prodi, lalu mulai akses jadwal, tugas, dan pengumuman.',
    alt: 'Maskot Psikologi Connect di depan laptop',
    width: 180,
    height: 101,
  },
  kewalahan: {
    gif: resolveAsset('/images/psychology/mascot/kewalahan.gif'),
    poster: resolveAsset('/images/psychology/mascot/kewalahan-poster.png'),
    title: 'Tugas menumpuk? Mulai dari satu langkah kecil.',
    message: 'Urutkan tugas berdasarkan deadline terdekat, pecah menjadi bagian kecil, dan kerjakan satu per satu.',
    alt: 'Maskot Psikologi Connect merasa kewalahan',
    width: 112,
    height: 200,
  },
  minum: {
    gif: resolveAsset('/images/psychology/mascot/minum.gif'),
    poster: resolveAsset('/images/psychology/mascot/minum-poster.png'),
    title: 'Ngopi dulu, santai sebentar.',
    message: 'Banyak tugas menanti, tetapi semuanya bisa dikerjakan satu per satu. Isi energi dulu, ya.',
    alt: 'Maskot Psikologi Connect sedang minum',
    width: 112,
    height: 200,
  },
  menunjuk: {
    gif: resolveAsset('/images/psychology/mascot/menunjuk.gif'),
    poster: resolveAsset('/images/psychology/mascot/menunjuk-poster.png'),
    title: 'Informasi dan pengumpulan ada di sini.',
    message: 'Cek pengumuman terbaru dan pastikan tugas dikumpulkan melalui tautan yang benar.',
    alt: 'Maskot Psikologi Connect menunjuk informasi',
    width: 112,
    height: 200,
  },
  tertidur: {
    gif: resolveAsset('/images/psychology/mascot/tertidur.gif'),
    poster: resolveAsset('/images/psychology/mascot/tertidur-poster.png'),
    title: 'Belum ada jadwal. Waktu yang tepat untuk istirahat.',
    message: 'Cukup tidur membantu fokus. Atur ulang prioritas belajar saat sudah siap kembali.',
    alt: 'Maskot Psikologi Connect tertidur',
    width: 180,
    height: 101,
  },
  berpikir: {
    gif: resolveAsset('/images/psychology/mascot/berpikir.gif'),
    poster: resolveAsset('/images/psychology/mascot/berpikir-poster.png'),
    title: 'Susun program studi dengan matang.',
    message: 'Pastikan setiap Prodi aktif dan terhubung dengan mata kuliah serta pengguna yang tepat.',
    alt: 'Maskot Psikologi Connect sedang berpikir',
    width: 112,
    height: 200,
  },
  berjalan: {
    gif: resolveAsset('/images/psychology/mascot/berjalan.gif'),
    poster: resolveAsset('/images/psychology/mascot/berjalan-poster.png'),
    title: 'Jadwal membantu menjaga ritme akademik.',
    message: 'Lihat waktu, ruang, dan tautan kelas agar aktivitas belajar hari ini lebih terarah.',
    alt: 'Maskot Psikologi Connect berjalan',
    width: 112,
    height: 200,
  },
  'memeluk-hati': {
    gif: resolveAsset('/images/psychology/mascot/memeluk-hati.gif'),
    poster: resolveAsset('/images/psychology/mascot/memeluk-hati-poster.png'),
    title: 'Tidak ada notifikasi baru.',
    message: 'Tugas aktif dan jadwal terdekat akan muncul di sini. Tetap tenang dan istirahat cukup.',
    alt: 'Maskot Psikologi Connect memeluk hati',
    width: 112,
    height: 200,
  },
}

export const EXTRA_MASCOTS = {
  melambai: {
    gif: resolveAsset('/images/psychology/mascot/melambai.gif'),
    poster: resolveAsset('/images/psychology/mascot/melambai-poster.png'),
    alt: 'Maskot Psikologi Connect melambai',
    width: 112,
    height: 200,
  },
  'berjalan-toggle': {
    gif: resolveAsset('/images/psychology/mascot/berjalan-toggle.gif'),
    poster: resolveAsset('/images/psychology/mascot/berjalan-toggle-poster.png'),
    alt: 'Maskot Psikologi Connect',
    width: 56,
    height: 100,
  },
}

export const LAUNCHER_STATE_KEYS = {
  idle: 'berjalan-toggle',
  greeting: 'melambai',
  studying: 'laptop',
  supportive: 'memeluk-hati',
  thinking: 'berpikir',
  success: 'memeluk-hati',
  sleepy: 'tertidur',
}

export function getMascot(key) {
  return MASCOTS[key] || EXTRA_MASCOTS[key] || null
}

export function getLauncherMascot(state) {
  return getMascot(LAUNCHER_STATE_KEYS[state] || LAUNCHER_STATE_KEYS.idle)
}
