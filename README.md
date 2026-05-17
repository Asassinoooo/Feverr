# 🚀 Feverr — Premium Freelancer Marketplace with JigsawCoin Integration

Feverr adalah platform marketplace penyedia jasa freelance (seperti Fiverr) premium yang dirancang khusus untuk pasar Indonesia. Platform ini mengintegrasikan teknologi modern dengan infrastruktur database tangguh, caching tingkat tinggi, serta fitur unik berupa **integrasi penukaran saldo dua arah (Bidirectional Swap) dengan JigsawCoin (JGC)**.

---

## 🛠️ Fitur Utama (Core Features)

### 1. Sistem Pengguna Multi-Peran (Multi-Role User System)
*   **Buyer & Seller**: Pengguna dapat bertindak sebagai pembeli jasa, penjual jasa, atau keduanya secara bersamaan.
*   **Profil Profesional**: Setiap pengguna memiliki portofolio, bio, peringkat agregat (ratings), ulasan (reviews), dan detail kontak yang aman.

### 2. Manajemen Jasa & Pencarian Cepat (Gig Catalog & Server-Side Search)
*   **CRUD Gig Lengkap**: Penjual dapat membuat, memperbarui, mengaktifkan/menonaktifkan, dan mengunggah gambar portofolio untuk jasa mereka.
*   **Unggah Gambar via Cloudinary**: Sistem upload media portofolio yang aman dan andal menggunakan integrasi Cloudinary Cloud Storage.
*   **Pencarian Cepat dengan Caching Redis**: Halaman pencarian teroptimasi menggunakan Next.js Server Components. Query pencarian difilter langsung di database dengan dukungan caching Redis untuk performa maksimal dan meminimalkan beban database.

### 3. Integrasi Dompet & Swap JigsawCoin Dua Arah (Bidirectional Swap)
Platform Feverr mendukung transaksi keuangan menggunakan Rupiah (IDR) dan mata uang kripto/eksternal JigsawCoin (JGC).
*   **Kurs Tetap**: 1 JGC = Rp1.000 (dan sebaliknya).
*   **Konversi Dua Arah (Bidirectional)**:
    *   **JGC → IDR**: Tukarkan JigsawCoin Anda ke saldo Rupiah Feverr untuk memesan jasa.
    *   **IDR → JGC**: Tukarkan kembali sisa saldo Rupiah Anda menjadi JigsawCoin untuk ditarik keluar.
*   **Server-Side Proxy API**: Seluruh komunikasi dengan API JigsawCoin dilindungi di sisi server (`app/api/wallet/...`) guna menyembunyikan API Key dari client-side dan menghindari kendala CORS.

### 4. Transaksi & Alur Pemesanan (Order Flow & Ledgers)
*   **Siklus Hidup Pesanan**: Alur pemesanan lengkap mulai dari status `pending` -> `in_progress` -> `delivered` -> `completed` / `cancelled`.
*   **Ledger Konsisten**: Setiap penukaran saldo dan transaksi pemesanan tercatat di tabel `transactions` sebagai audit trail (`debit` / `credit`).
*   **Buku Saldo Aman**: Database menjamin saldo pengguna tidak pernah bernilai negatif (`CHECK balance >= 0`) untuk menjaga integritas transaksi.

### 5. Chat Pesanan Real-time (Order Chat Box)
*   **Komunikasi Terintegrasi**: Pembeli dan penjual dapat saling mengirim pesan secara langsung di halaman detail pesanan untuk memantau kemajuan pekerjaan.

---

## 🗄️ Skema Database (PostgreSQL)

Berikut adalah struktur tabel yang digunakan dalam PostgreSQL (Neon Serverless DB):

```mermaid
erDiagram
    USERS ||--o{ GIGS : "has"
    USERS ||--o{ ORDERS : "buys/sells"
    USERS ||--o{ REVIEWS : "writes/receives"
    USERS ||--o{ TRANSACTIONS : "performs"
    USERS ||--o{ MESSAGES : "sends"
    GIGS ||--o{ ORDERS : "ordered"
    ORDERS ||--|| REVIEWS : "reviewed"
    ORDERS ||--o{ MESSAGES : "contains"

    USERS {
        int user_id PK
        varchar username UNIQUE
        varchar email UNIQUE
        varchar password_hash
        varchar name
        text bio
        text avatar_url
        user_role_enum role
        decimal balance
        decimal average_rating
        varchar global_user_id
        timestamp created_at
    }

    GIGS {
        int gig_id PK
        int seller_id FK
        varchar title
        text description
        varchar category
        text_array tags
        decimal price
        int delivery_days
        text_array portfolio_images
        boolean is_active
        decimal average_rating
        int review_count
        timestamp created_at
    }

    ORDERS {
        int order_id PK
        int buyer_id FK
        int gig_id FK
        int seller_id FK
        order_status_enum status
        text buyer_instructions
        text_array delivery_files
        decimal total_price
        timestamp created_at
        timestamp updated_at
    }

    REVIEWS {
        int review_id PK
        int order_id FK UNIQUE
        int gig_id FK
        int buyer_id FK
        int seller_id FK
        int rating
        text comment
        timestamp created_at
    }

    TRANSACTIONS {
        int transaction_id PK
        int user_id FK
        transaction_type_enum type
        decimal amount
        text description
        int related_order_id FK
        timestamp created_at
    }

    MESSAGES {
        int message_id PK
        int order_id FK
        int sender_id FK
        text content
        timestamp created_at
    }
```

---

## 💻 Tech Stack

*   **Frontend & Routing**: Next.js 16 (App Router), React 19, Tailwind CSS.
*   **Backend & Server-side API**: Next.js Route Handlers (API Routes).
*   **Autentikasi & Sesi**: NextAuth.js v5 (dengan JWT strategy).
*   **Database**: Neon Serverless PostgreSQL.
*   **Caching & Caching Pencarian**: Serverless Redis (`ioredis`).
*   **Penyimpanan Portofolio**: Cloudinary Cloud SDK.
*   **Integrasi Pihak Ketiga**: JigsawCoin REST API.

---

## 📂 Struktur Direktori Proyek

```text
├── app/                  # Folder Utama Next.js App Router
│   ├── (account)/        # Rute Pengguna Terautentikasi (Settings, Wallet)
│   ├── (auth)/           # Rute Autentikasi (Login, Register)
│   ├── (buyer)/          # Dashboard Pembeli & Detail Pesanan Buyer
│   ├── (public)/         # Halaman Publik (Detail Gig, Search, Profile)
│   ├── (seller)/         # Dashboard Penjual (My Gigs, Order Management)
│   ├── api/              # API Route Handlers (Backend Routes)
│   └── layout.tsx        # Layout Utama Aplikasi
├── components/           # Komponen UI Reusable (GigCard, Order Chat, dll)
├── lib/                  # Utilities, DB Connectors, & Konstanta Global
│   ├── api.ts            # Client-side API Fetch Helper
│   ├── auth.ts           # Konfigurasi NextAuth v5 & Sinkronisasi JGC
│   ├── constants.ts      # Data Statis & Kategori Global
│   ├── db.ts             # PG Pool Client untuk PostgreSQL
│   └── redis.ts          # Koneksi Client Redis
├── public/               # File Statis (Logo, SVG, dll)
├── scripts/              # Script Migrasi Database (init-db, seed-db)
├── .env                  # Variabel Lingkungan Lokal (Sensitif)
├── dump.sql              # Schema Database DDL PostgreSQL
├── package.json          # Manajemen Dependensi Node.js
└── next.config.ts        # Konfigurasi Next.js Compiler
```

---

## 🔑 Konfigurasi Variabel Lingkungan (.env)

Untuk menjalankan proyek ini, buatlah file `.env` di direktori utama dan lengkapi variabel berikut:

```env
# 1. Database (PostgreSQL - Neon DB)
POSTGRES_STRING="postgresql://username:password@ep-proud-cloud.ap-southeast-1.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require"

# 2. NextAuth (Autentikasi Rahasia)
AUTH_SECRET="kunci-rahasia-nextauth-32bit-base64"
NEXTAUTH_SECRET="kunci-rahasia-nextauth-32bit-base64"

# 3. JigsawCoin API
JIGSAWCOIN_API="api-key-jgc-anda"

# 4. Redis (Opsional untuk Caching Pencarian, Biarkan Kosong untuk Nonaktif)
REDIS_URL="rediss://default:password@redis-server-instance.upstash.io:6379"

# 5. Cloudinary Storage (Untuk Portfolio Media Upload)
CLOUDINARY_CLOUD_NAME="cloud_name_anda"
CLOUDINARY_API_KEY="api_key_cloudinary_anda"
CLOUDINARY_API_SECRET="api_secret_cloudinary_anda"
```

---

## 🚀 Cara Menjalankan secara Lokal

### 1. Clone & Install Dependensi
```bash
git clone https://github.com/Asassinoooo/Feverr.git
cd Feverr
npm install
```

### 2. Inisialisasi Database
Jalankan script migrasi berikut untuk membuat tabel dan data awal (seeding) ke PostgreSQL Anda:
```bash
# Inisialisasi struktur tabel
node scripts/init-db.js

# Isi data contoh (Gigs, Users default)
node scripts/seed-db.js
```

### 3. Jalankan Dev Server
```bash
npm run dev
```
Aplikasi dapat diakses melalui browser Anda di alamat: **`http://localhost:3000`**

### 4. Build untuk Produksi
Sebelum deploy ke Vercel atau VPS, pastikan kode berhasil dicompile secara optimal:
```bash
npm run build
npm start
```

---

## 🔒 Catatan Keamanan & Praktik Terbaik
1.  **SSL PostgreSQL**: Gunakan mode `sslmode=verify-full` pada connection string di produksi untuk enkripsi dan autentikasi server database yang maksimal.
2.  **Server-Side Proxy**: Jangan pernah memanggil API JigsawCoin langsung dari halaman frontend Client Component menggunakan `fetch()`. Gunakan helper di [api.ts](file:///d:/Feverr/Feverr/lib/api.ts) yang mengarah ke API Route Next.js agar API Key Anda tetap aman di sisi server.
3.  **Redis Fallback**: Sistem caching pencarian dirancang secara *fail-safe*. Jika koneksi Redis gagal atau `REDIS_URL` tidak didefinisikan, pencarian akan tetap berfungsi normal dengan langsung mengambil data dari PostgreSQL.

---

*Dikembangkan dengan penuh dedikasi untuk portofolio freelance premium modern Indonesia.* 🇮🇩
