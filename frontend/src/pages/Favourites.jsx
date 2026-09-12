import { AnimatePresence, motion } from 'framer-motion';
import { Film, MapPin, MonitorPlay } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyFavourites } from '../api/favourites';
import FavouriteButton from '../components/FavouriteButton';

export default function MyFavourites() {
    const [movies, setMovies] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [tab, setTab] = useState('movies');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getMyFavourites()
            .then(({ movies, cinemas }) => {
                setMovies(movies);
                setCinemas(cinemas);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const list = tab === 'movies' ? movies : cinemas;

    const filters = [
        { label: 'Movies', value: 'movies' },
        { label: 'Cinemas', value: 'cinemas' },
    ];

    const handleRemoveFavourite = (itemType, itemId) => {
        if (itemType === 'movie') {
            setMovies((prev) => prev.filter((movie) => movie._id !== itemId));
        } else {
            setCinemas((prev) => prev.filter((cinema) => cinema._id !== itemId));
        }
    };

    return (
        <div>
            <main>
                <div className="mb-8 flex flex-col gap-4 border-b border-marquee-line pb-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                            My Favourites
                        </h2>

                        <p className="mt-1 text-sm text-marquee-muted">Manage your favourite movies and cinemas</p>
                    </div>

                    <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-marquee-line bg-marquee-bg p-1.5">
                        {filters.map((filter) => {
                            const isActive = tab === filter.value;
                            return (
                                <button
                                    key={filter.value}
                                    onClick={() => setTab(filter.value)}
                                    className={`relative rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${isActive
                                        ? 'text-marquee-line'
                                        : 'text-marquee-muted hover:text-marquee-gold'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeFilterPill"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 380,
                                                damping: 30,
                                            }}
                                            className="absolute inset-0 rounded-full bg-marquee-gold shadow-md"
                                        />
                                    )}

                                    <span className="relative z-10 flex items-center gap-2">
                                        {filter.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {loading && <p className="text-marquee-muted">Loading your favourites...</p>}

                {error && <p className="text-red-400">{error}</p>}

                {!loading && !error && list.length === 0 && (
                    <div className="rounded-xl border border-dashed border-marquee-line bg-marquee-bg p-12 text-center">
                        {tab === 'movies' ? (
                            <Film size={36} className="mx-auto mb-4 text-marquee-goldDim" strokeWidth={1.2} />
                        ) : (
                            <MapPin size={36} className="mx-auto mb-4 text-marquee-goldDim" strokeWidth={1.2} />
                        )}
                        <p className="font-serif text-xl text-marquee-cream">
                            No favourite {tab} yet
                        </p>
                        <p className="mt-2 text-sm text-marquee-muted">
                            {tab === 'movies'
                                ? 'Movies you favourite will appear here'
                                : 'Cinemas you favourite will appear here'}
                        </p>
                    </div>
                )}

                {!loading && list.length > 0 && (
                    <div className="space-y-4">
                        <AnimatePresence initial={false} mode="popLayout">
                            {list.map((item) => (
                                <motion.div
                                    key={item._id}
                                    layout
                                    initial={{
                                        opacity: 0,
                                        x: -20,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        x: '-100vw',
                                        scale: 0.95,
                                    }}
                                    transition={{
                                        duration: 0.4,
                                        ease: 'easeInOut',
                                    }}
                                    className="flex items-center gap-4 rounded-lg border border-marquee-line bg-marquee-bg p-4"
                                >
                                    {tab === 'movies' ? (
                                        <>
                                            <Link
                                                to={`/movies/${item._id}`}
                                                className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-marquee-line"
                                            >
                                                <img
                                                    src={item.posterUrl}
                                                    alt={`${item.title} poster`}
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                            </Link>

                                            <Link to={`/movies/${item._id}`} className="min-w-0 flex-1">
                                                <p className="truncate font-serif text-lg font-semibold text-marquee-cream transition-colors group-hover:text-marquee-goldBright">
                                                    {item.title}
                                                </p>
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-marquee-muted">
                                                    {item.genres?.length > 0 && (
                                                        <span>{item.genres.slice(0, 2).join(' · ')}</span>
                                                    )}
                                                    {item.rating && (
                                                        <>
                                                            <span className="text-marquee-goldDim">•</span>
                                                            <span>{item.rating}</span>
                                                        </>
                                                    )}
                                                    {item.duration && (
                                                        <>
                                                            <span className="text-marquee-goldDim">•</span>
                                                            <span>{item.duration} min</span>
                                                        </>
                                                    )}
                                                </div>
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link to={`/cinemas/${item._id}`} className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-marquee-line bg-marquee-panel2 transition-all group-hover:border-marquee-gold/30">
                                                <Film size={30} strokeWidth={1.2} className="text-marquee-goldDim transition-colors group-hover:text-marquee-gold" />
                                            </Link>

                                            <Link to={`/cinemas/${item._id}`} className="min-w-0 flex-1">
                                                <p className="truncate font-serif text-lg font-semibold text-marquee-cream transition-colors group-hover:text-marquee-goldBright">
                                                    {item.name}
                                                </p>
                                                <div className="mt-1 flex items-center gap-2 text-xs text-marquee-muted">
                                                    <MapPin size={13} className="shrink-0 text-marquee-goldDim" />
                                                    <span className="truncate">
                                                        {item.location?.city}
                                                        {item.location?.country && ` · ${item.location.country}`}
                                                    </span>
                                                </div>
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    {item.type?.map((type) => (
                                                        <span
                                                            key={type}
                                                            className="rounded-md border border-marquee-line bg-marquee-bg px-2 py-0.5 text-[9px] uppercase tracking-wider text-marquee-gold"
                                                        >
                                                            {type}
                                                        </span>
                                                    ))}
                                                    {item.screens?.length > 0 && (
                                                        <span className="flex items-center gap-1 text-[10px] text-marquee-muted">
                                                            <MonitorPlay size={12} />
                                                            {item.screens.length}{' '}
                                                            {item.screens.length === 1 ? 'screen' : 'screens'}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                        </>
                                    )}

                                    <FavouriteButton
                                        itemType={tab === 'movies' ? 'movie' : 'cinema'}
                                        itemId={item._id}
                                        onToggle={(favourited) => {
                                            if (!favourited) {
                                                handleRemoveFavourite(
                                                    tab === 'movies' ? 'movie' : 'cinema',
                                                    item._id
                                                );
                                            }
                                        }}
                                        className="static shrink-0 bg-transparent hover:bg-marquee-panel2"
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}