export const GIG_CATEGORIES = [
  'Desain',
  'Penulisan',
  'Teknologi',
  'Marketing',
  'Bisnis',
  'Video'
] as const;

export type GigCategory = (typeof GIG_CATEGORIES)[number];
