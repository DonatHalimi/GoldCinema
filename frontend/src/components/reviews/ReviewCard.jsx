import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import StarRating from './StarRating';

export default function ReviewCard({ review, onEdit, onDelete }) {
    const movie = review.movie;

    return (
        <div className="flex gap-4 rounded-lg border border-marquee-line bg-marquee-bg p-4">
            {movie?.posterUrl ? (
                <Link to={`/movies/${movie._id}`} className="flex-shrink-0">
                    <img
                        src={movie.posterUrl}
                        alt={`${movie.title} poster`}
                        className="h-28 w-20 rounded object-cover"
                    />
                </Link>
            ) : (
                <div className="flex h-28 w-20 flex-shrink-0 items-center justify-center rounded bg-marquee-panel2 text-xs text-marquee-muted">
                    No poster
                </div>
            )}

            <div className="flex-1">
                {movie ? (
                    <Link
                        to={`/movies/${movie._id}`}
                        className="font-serif text-lg font-semibold text-marquee-cream hover:text-marquee-gold"
                    >
                        {movie.title}
                    </Link>
                ) : (
                    <p className="font-serif text-lg font-semibold text-marquee-muted">
                        Movie no longer available
                    </p>
                )}

                <div className="mt-1">
                    <StarRating value={review.rating} readOnly size={16} />
                </div>

                <p className="mt-2 whitespace-pre-wrap text-sm text-marquee-muted">{review.comment}</p>

                <p className="mt-2 text-xs uppercase tracking-wide text-marquee-goldDim">
                    Reviewed{' '}
                    {new Date(review.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    })}
                </p>

                <div className="mt-3 flex justify-end gap-4 text-sm">
                    <button
                        onClick={() => onEdit(review)}
                        className="flex items-center gap-1 text-marquee-gold hover:text-marquee-goldBright"
                    >
                        <Pencil size={14} /> Edit
                    </button>
                    <button
                        onClick={() => onDelete(review)}
                        className="flex items-center gap-1 text-marquee-marquee hover:text-red-400"
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            </div>
        </div>
    );
}