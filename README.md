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
    *   **JGC $\rightarrow$ IDR**: Tukarkan JigsawCoin Anda ke saldo Rupiah Feverr untuk memesan jasa.
    *   **IDR $\rightarrow$ JGC**: Tukarkan kembali sisa saldo Rupiah Anda menjadi JigsawCoin untuk ditarik keluar.
*   **Server-Side Proxy API**: Seluruh komunikasi dengan API JigsawCoin dilindungi di sisi server (`app/api/wallet/...`) guna menyembunyikan API Key dari client-side dan menghindari kendala CORS.

### 4. Transaksi & Alur Pemesanan (Order Flow & Ledgers)
*   **Siklus Hidup Pesanan**: Alur pemesanan lengkap mulai dari status `pending` -> `in_progress` -> `delivered` -> `completed` / `cancelled`.
*   **Ledger Konsisten**: Setiap penukaran saldo dan transaksi pemesanan tercatat di tabel `transactions` sebagai audit trail (`debit` / `credit`).
*   **Buku Saldo Aman**: Database menjamin saldo pengguna tidak pernah bernilai negatif (`CHECK balance >= 0`) untuk menjaga integritas transaksi.

### 5. Chat Pesanan Real-time (Order Chat Box)
*   **Komunikasi Terintegrasi**: Pembeli dan penjual dapat saling mengirim pesan secara langsung di halaman detail pesanan untuk memantau kemajuan pekerjaan.

---

## 📊 Diagram & Model Arsitektur

### 1. Entity Relationship Diagram (ERD)
Struktur tabel yang digunakan dalam PostgreSQL database:
```mermaid
erDiagram
    Users ||--o{ Gigs : "creates"
    Users ||--o{ Orders : "places (buyer)"
    Gigs ||--o{ Orders : "is ordered"
    Orders ||--|| Reviews : "has"
    Users ||--o{ Reviews : "writes (reviewer)"
    Users ||--o{ Reviews : "receives (seller)"
    Orders ||--o{ Messages : "contains"
    Users ||--o{ Messages : "sends"
    Users ||--o{ Transactions : "performs"

    Users {
        uuid user_id PK
        string username
        string email
        decimal balance
        decimal average_rating
        text bio
        string avatar_url
        timestamp created_at
    }

    Gigs {
        uuid gig_id PK
        uuid seller_id FK
        string title
        text description
        decimal price
        string category_id
        boolean is_active
        timestamp created_at
    }

    Orders {
        uuid order_id PK
        uuid buyer_id FK
        uuid gig_id FK
        enum status
        decimal total_price
        text instructions
        timestamp created_at
    }

    Reviews {
        uuid review_id PK
        uuid order_id FK
        uuid reviewer_id FK
        uuid seller_id FK
        int rating
        text comment
        timestamp created_at
    }

    Messages {
        uuid message_id PK
        uuid order_id FK
        uuid sender_id FK
        text content
        timestamp created_at
    }

    Transactions {
        uuid transaction_id PK
        uuid user_id FK
        enum type
        decimal amount
        string description
        uuid related_order_id FK
        timestamp created_at
    }
```

### 2. User Journey Flowchart
Alur perjalanan pengguna bertransaksi di Feverr:
```mermaid
graph TD
    Start([User Landing]) --> Search[Search Gigs]
    Search --> Select[Select Gig]
    Select --> Checkout[Checkout/Payment]
    Checkout --> CreateOrder[Order Created]
    CreateOrder --> SetInstructions[Buyer Provides Instructions]
    SetInstructions --> InProgress[Seller: In Progress]
    InProgress --> Chat[Buyer & Seller Chat]
    Chat --> Delivery[Seller: Deliver Project]
    Delivery --> Review[Buyer: Review & Complete]
    Review --> End([Order Finished])

    subgraph Wallet
        Deposit[Deposit Jigsawcoin] --> Balance[Check Balance]
        Balance --> Withdraw[Withdraw]
    end

    subgraph SellerManagement
        CreateGig[Create New Gig] --> ManageGig[Manage/Edit Gigs]
        ManageGig --> Dashboard[Seller Dashboard]
    end
```

### 3. UML Class Diagram
Representasi relasi orientasi objek di sisi backend Feverr:
```mermaid
classDiagram
    class User {
        +UUID user_id
        +String username
        +String email
        +Decimal balance
        +Decimal average_rating
        +Text bio
        +String avatar_url
    }

    class Gig {
        +UUID gig_id
        +UUID seller_id
        +String title
        +Text description
        +Decimal price
        +String category
        +Boolean is_active
    }

    class Order {
        +UUID order_id
        +UUID buyer_id
        +UUID gig_id
        +OrderStatus status
        +Decimal total_price
        +String instructions
    }

    class Review {
        +UUID review_id
        +UUID order_id
        +UUID reviewer_id
        +UUID seller_id
        +Int rating
        +Text comment
    }

    class Message {
        +UUID message_id
        +UUID order_id
        +UUID sender_id
        +Text content
    }

    class Transaction {
        +UUID transaction_id
        +UUID user_id
        +TransactionType type
        +Decimal amount
    }

    User "1" -- "0..*" Gig : sells
    User "1" -- "0..*" Order : buys
    Gig "1" -- "0..*" Order : part of
    Order "1" -- "0..1" Review : results in
    Order "1" -- "0..*" Message : contains
    User "1" -- "0..*" Transaction : participates in
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
