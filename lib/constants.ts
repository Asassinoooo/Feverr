export const GIG_CATEGORIES = [
  'Design',
  'Writing',
  'Technology',
  'Marketing',
  'Business',
  'Video'
] as const;

export type GigCategory = (typeof GIG_CATEGORIES)[number];
