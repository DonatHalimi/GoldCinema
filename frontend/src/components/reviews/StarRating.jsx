import { Star } from 'lucide-react';

/**
 * Whole-number 5-star rating control.
 * - Display mode: <StarRating value={review.rating} readOnly />
 * - Interactive:  <StarRating value={rating} onChange={setRating} />
 */
export default function StarRating({ value = 0, onChange, readOnly = false, size = 20 }) {
    const stars = [1, 2, 3, 4, 5];

    return (
        <div className="flex items-center gap-1">
            {stars.map((star) => {
                const filled = star <= value;

                if (readOnly) {
                    return (
                        <Star
                            key={star}
                            size={size}
                            className={filled ? 'text-marquee-gold fill-current' : 'text-marquee-line'}
                        />
                    );
                }

                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange?.(star)}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                        className="transition-transform hover:scale-110"
                    >
                        <Star
                            size={size}
                            className={filled ? 'text-marquee-gold fill-current' : 'text-marquee-muted'}
                        />
                    </button>
                );
            })}
        </div>
    );
}