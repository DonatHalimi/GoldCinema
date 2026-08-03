import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  return (
    <Link
      to={`/movies/${movie._id}`}
      className="group block overflow-hidden rounded-lg border border-marquee-line bg-marquee-panel transition hover:border-marquee-gold hover:shadow-glow"
    >
      <div className="aspect-[2/3] overflow-hidden bg-marquee-panel2">
        <img
          src={movie.posterUrl}
          alt={`${movie.title} poster`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-marquee-goldDim">
          {movie.genres?.join(' / ')}
          <span aria-hidden="true">&middot;</span>
          <span>{movie.rating}</span>
        </div>
        <h3 className="font-serif text-xl font-semibold text-marquee-cream">{movie.title}</h3>
        <p className="mt-1 text-sm text-marquee-muted">{movie.duration} min &middot; ${movie.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}