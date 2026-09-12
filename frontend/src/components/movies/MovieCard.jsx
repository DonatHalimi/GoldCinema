import { Link } from 'react-router-dom';
import FavouriteButton from '../FavouriteButton';

export default function MovieCard({ movie }) {
  const truncateText = (input, maxLength = 20) => {
    if (!input) return '';

    const text = Array.isArray(input) ? input.join(' / ') : String(input);

    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const fullGenres = movie.genres?.join(' / ');

  return (
    <div className="relative">
      <Link to={`/movies/${movie._id}`} className="group block overflow-hidden rounded-lg border border-marquee-line bg-marquee-panel transition hover:border-marquee-gold hover:shadow-glow">
        <div className="aspect-[2/3] overflow-hidden bg-marquee-panel2">
          <img
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <FavouriteButton itemType="movie" itemId={movie._id} className="absolute right-2 top-2" />
        </div>
        <div className="p-4">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-marquee-goldDim">
            <span title={fullGenres}>
              {truncateText(movie.genres, 20)}
            </span>
            <span aria-hidden="true">•</span>
            <span>{movie.rating}</span>
          </div>
          <h3 className="font-serif text-xl font-semibold text-marquee-cream" title={movie.title}>
            {truncateText(movie.title, 18)}
          </h3>
          <p className="mt-1 text-sm text-marquee-muted">{movie.duration} min • ${movie.price.toFixed(2)}</p>
        </div>
        <FavouriteButton itemType="movie" itemId={movie._id} className="absolute right-2 top-2" />
      </Link>
    </div>
  );
}