'use client';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  max = 5,
  size = 'sm',
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' };

  return (
    <span className={`inline-flex items-center gap-0.5 ${sizes[size]}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <span
            key={i}
            onClick={() => interactive && onChange?.(i + 1)}
            className={`${interactive ? 'cursor-pointer' : ''} ${
              filled ? 'text-amber-400' : half ? 'text-amber-300' : 'text-slate-300'
            }`}
          >
            ★
          </span>
        );
      })}
    </span>
  );
}
