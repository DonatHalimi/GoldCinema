import { Film, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import FavouriteButton from '../FavouriteButton';

export default function CinemaCard({ cinema }) {
    return (
        <Link
            to={`/cinemas/${cinema._id}`}
            className="group block overflow-hidden rounded-lg border border-marquee-line bg-marquee-panel transition hover:border-marquee-gold hover:shadow-glow"
        >
            <div className="relative flex h-48 items-center justify-center overflow-hidden bg-marquee-panel2">
                <div className="absolute inset-0 bg-gradient-to-br from-marquee-panel2 via-marquee-panel to-black/80" />

                <Film
                    size={64}
                    strokeWidth={1}
                    className="relative text-marquee-goldDim transition duration-500 group-hover:scale-110 group-hover:text-marquee-gold"
                />

                <FavouriteButton
                    itemType="cinema"
                    itemId={cinema._id}
                    className="absolute right-3 top-3"
                />
            </div>

            <div className="p-4">
                <h3 className="font-serif text-xl font-semibold text-marquee-cream">
                    {cinema.name}
                </h3>

                <div className="mt-2 flex items-start gap-2 text-sm text-marquee-muted">
                    <MapPin
                        size={16}
                        className="mt-0.5 shrink-0 text-marquee-gold"
                    />

                    <span>
                        {cinema.location?.address}
                        {cinema.location?.city && (
                            <>
                                {' · '}
                                {cinema.location.city}
                            </>
                        )}
                    </span>
                </div>

                {cinema.type?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {cinema.type.map((type) => (
                            <span
                                key={type}
                                className="rounded-full border border-marquee-line bg-marquee-panel2 px-2.5 py-1 text-[10px] uppercase tracking-wider text-marquee-goldDim"
                            >
                                {type}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}