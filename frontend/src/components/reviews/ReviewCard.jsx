import { Calendar, Edit, Star, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function ReviewCard({
    review,
    onEdit,
    onDelete,
}) {
    const { t } = useTranslation('account');
    const movie = review?.movie;

    return (
        <article className="group overflow-hidden rounded-2xl border border-marquee-line bg-marquee-panel transition-all duration-200 hover:border-marquee-gold/40">
            <div className="flex gap-5 p-5">
                <Link
                    to={`/movies/${movie?._id}`}
                    className="relative shrink-0 overflow-hidden rounded-xl"
                >
                    <img
                        src={movie?.posterUrl}
                        alt={movie?.title || t('reviewMoviePoster')}
                        className="h-36 w-24 object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                </Link>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <Link
                                to={`/movies/${movie?._id}`}
                                className="block truncate font-display text-xl font-semibold tracking-wide text-marquee-cream transition-colors hover:text-marquee-goldBright"
                            >
                                {movie?.title || t('reviewUnknownMovie')}
                            </Link>

                            <div className="mt-2 flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={15}
                                        className={
                                            star <= review.rating
                                                ? 'fill-marquee-gold text-marquee-gold'
                                                : 'text-marquee-line'
                                        }
                                    />
                                ))}

                                <span className="ml-2 text-xs font-medium text-marquee-muted">
                                    {review.rating}/5
                                </span>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <button
                                type="button"
                                onClick={() => onEdit(review)}
                                aria-label={t('editDelReview')}
                                className="group/action relative flex h-9 w-9 items-center justify-center rounded-full border border-marquee-gold/20 bg-marquee-gold/5 text-marquee-gold transition-all duration-200 hover:border-marquee-gold/50 hover:bg-marquee-gold/10 hover:text-marquee-goldBright"
                            >
                                <Edit
                                    size={16}
                                    className="transition-transform duration-200 group-hover/action:scale-110"
                                />

                                <span className="pointer-events-none absolute right-0 top-full z-20 mt-2 whitespace-nowrap rounded-md border border-marquee-gold/20 bg-marquee-panel2 px-2.5 py-1.5 text-xs text-marquee-gold opacity-0 shadow-xl transition-opacity group-hover/action:opacity-100">
                                    {t('editReview')}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => onDelete(review)}
                                aria-label={t('deleteReview')}
                                className="group/action relative flex h-9 w-9 items-center justify-center rounded-full border border-red-500/20 bg-red-500/5 text-red-400 transition-all duration-200 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
                            >
                                <Trash2
                                    size={16}
                                    className="transition-transform duration-200 group-hover/action:scale-110"
                                />

                                <span className="pointer-events-none absolute right-0 top-full z-20 mt-2 whitespace-nowrap rounded-md border border-red-500/20 bg-marquee-panel2 px-2.5 py-1.5 text-xs text-red-300 opacity-0 shadow-xl transition-opacity group-hover/action:opacity-100">
                                    {t('deleteReview')}
                                </span>
                            </button>
                        </div>
                    </div>

                    <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-marquee-muted">
                        {review.comment}
                    </p>

                    <div className="mt-5 flex items-center gap-2 text-xs text-marquee-muted">
                        <Calendar size={14} />

                        <span>
                            {new Date(review.createdAt).toLocaleDateString(
                                undefined,
                                {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                }
                            )}
                        </span>

                        {review.updatedAt &&
                            review.updatedAt !== review.createdAt && (
                                <>
                                    <span className="text-marquee-line">
                                        •
                                    </span>

                                    <span>{t('reviewEdited')}</span>
                                </>
                            )}
                    </div>
                </div>
            </div>
        </article>
    );
}