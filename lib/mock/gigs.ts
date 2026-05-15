import { Gig } from '@/lib/types';

export const mockGigs: Gig[] = [
  {
    id: 'gig-1',
    sellerId: 'user-2',
    title: 'Desain Logo Profesional untuk Brand Anda',
    description:
      'Saya akan membuat logo profesional yang mencerminkan identitas brand Anda. Proses dimulai dari riset, konsep, hingga file final siap cetak.\n\nYang Anda dapatkan:\n- 3 konsep logo awal\n- Revisi tidak terbatas\n- File PNG, SVG, PDF\n- Hak cipta penuh\n\nSaya berpengalaman bekerja dengan klien dari berbagai industri: kuliner, teknologi, fashion, dan pendidikan.',
    category: 'Desain',
    tags: ['logo', 'branding', 'identitas visual', 'desain grafis'],
    price: 250000,
    deliveryDays: 5,
    portfolioImages: [
      'https://picsum.photos/seed/logo1/800/500',
      'https://picsum.photos/seed/logo2/800/500',
      'https://picsum.photos/seed/logo3/800/500',
    ],
    isActive: true,
    rating: 4.9,
    reviewCount: 47,
    createdAt: '2024-01-10T09:00:00Z',
  },
  {
    id: 'gig-2',
    sellerId: 'user-2',
    title: 'Desain UI/UX Aplikasi Mobile & Web',
    description:
      'Saya akan merancang antarmuka aplikasi mobile atau web yang intuitif dan estetis. Menggunakan Figma sebagai tools utama.\n\nTermasuk:\n- Wireframe & prototype\n- Design system & style guide\n- Handoff developer-ready\n- 2 ronde revisi',
    category: 'Desain',
    tags: ['ui/ux', 'figma', 'mobile design', 'web design'],
    price: 500000,
    deliveryDays: 7,
    portfolioImages: [
      'https://picsum.photos/seed/uiux1/800/500',
      'https://picsum.photos/seed/uiux2/800/500',
    ],
    isActive: true,
    rating: 4.7,
    reviewCount: 23,
    createdAt: '2024-02-01T11:00:00Z',
  },
  {
    id: 'gig-3',
    sellerId: 'user-3',
    title: 'Penulisan Artikel SEO Berkualitas Tinggi',
    description:
      'Saya akan menulis artikel blog atau konten website yang dioptimalkan untuk mesin pencari (SEO) sekaligus engaging untuk pembaca.\n\nSpesifikasi:\n- 800–1500 kata per artikel\n- Riset keyword mendalam\n- Struktur heading yang tepat\n- Meta description & alt text\n- Revisi 1x',
    category: 'Penulisan',
    tags: ['seo', 'artikel', 'content writing', 'blog'],
    price: 150000,
    deliveryDays: 3,
    portfolioImages: [
      'https://picsum.photos/seed/writing1/800/500',
      'https://picsum.photos/seed/writing2/800/500',
    ],
    isActive: true,
    rating: 4.8,
    reviewCount: 61,
    createdAt: '2023-12-05T08:30:00Z',
  },
  {
    id: 'gig-4',
    sellerId: 'user-3',
    title: 'Pembuatan Website Landing Page dengan Next.js',
    description:
      'Saya akan membangun landing page modern dan responsif menggunakan Next.js dan Tailwind CSS. Performa tinggi, SEO-ready, dan mudah dikelola.\n\nMeliputi:\n- Desain custom sesuai brand\n- Responsif mobile & desktop\n- Optimasi Core Web Vitals\n- Deploy ke Vercel\n- Source code diserahkan',
    category: 'Teknologi',
    tags: ['next.js', 'web development', 'landing page', 'react'],
    price: 750000,
    deliveryDays: 10,
    portfolioImages: [
      'https://picsum.photos/seed/web1/800/500',
      'https://picsum.photos/seed/web2/800/500',
      'https://picsum.photos/seed/web3/800/500',
    ],
    isActive: true,
    rating: 4.6,
    reviewCount: 18,
    createdAt: '2024-03-10T13:00:00Z',
  },
  {
    id: 'gig-5',
    sellerId: 'user-3',
    title: 'Penerjemahan Dokumen Indonesia–Inggris',
    description:
      'Jasa terjemahan dokumen profesional dari Bahasa Indonesia ke Inggris atau sebaliknya. Akurat, natural, dan tepat waktu.\n\nCocok untuk:\n- Dokumen bisnis\n- Artikel & blog\n- Materi pemasaran\n- Laporan teknis\n\nHarga per 500 kata.',
    category: 'Penulisan',
    tags: ['terjemahan', 'bahasa inggris', 'dokumen', 'translasi'],
    price: 100000,
    deliveryDays: 2,
    portfolioImages: [
      'https://picsum.photos/seed/trans1/800/500',
    ],
    isActive: false,
    rating: 4.5,
    reviewCount: 34,
    createdAt: '2023-10-22T16:00:00Z',
  },
  {
    id: 'gig-6',
    sellerId: 'user-2',
    title: 'Ilustrasi Digital Custom — Karakter & Scene',
    description:
      'Saya akan membuat ilustrasi digital custom sesuai keinginan Anda. Gaya semi-realis hingga kartun tersedia.\n\nPenggunaan:\n- Konten media sosial\n- Buku anak\n- Merchandise\n- Dekorasi personal\n\nFile: PNG resolusi tinggi + PSD',
    category: 'Desain',
    tags: ['ilustrasi', 'digital art', 'karakter', 'custom art'],
    price: 300000,
    deliveryDays: 6,
    portfolioImages: [
      'https://picsum.photos/seed/illust1/800/500',
      'https://picsum.photos/seed/illust2/800/500',
    ],
    isActive: true,
    rating: 4.8,
    reviewCount: 39,
    createdAt: '2024-01-25T09:30:00Z',
  },
];

export function getGigById(id: string): Gig | undefined {
  return mockGigs.find((g) => g.id === id);
}

export function getGigsBySeller(sellerId: string): Gig[] {
  return mockGigs.filter((g) => g.sellerId === sellerId);
}

export function getFeaturedGigs(): Gig[] {
  return [...mockGigs]
    .filter((g) => g.isActive)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
}

export const GIG_CATEGORIES = ['Desain', 'Penulisan', 'Teknologi', 'Marketing', 'Bisnis', 'Video'] as const;
