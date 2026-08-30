import { ArrowLeft, Film, MapPin, MonitorPlay } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getItemById } from '../api/admin';
import FavouriteButton from '../components/FavouriteButton';

export default function Cinema() {
    const { id } = useParams();

    const [cinema, setCinema] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCinema = async () => {
            setLoading(true);

            try {
                const res = await getItemById('cinemas', id);
                setCinema(res.data);
            } catch (err) {
                console.error('Error fetching cinema:', err);

                toast.error(
                    err.message || 'Failed to load cinema'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCinema();
    }, [id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-marquee-bg px-6 py-20 text-center text-marquee-muted">
                <p className="animate-pulse text-sm">
                    Loading cinema...
                </p>
            </main>
        );
    }

    if (!cinema) {
        return (
            <main className="min-h-screen bg-marquee-bg px-6 py-20 text-center">
                <h1 className="font-serif text-3xl text-marquee-cream">
                    Cinema not found
                </h1>

                <Link
                    to="/"
                    className="mt-6 inline-flex items-center gap-2 text-sm text-marquee-gold hover:text-marquee-goldBright"
                >
                    <ArrowLeft size={16} />
                    Back to home
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-marquee-bg text-marquee-cream">
            <section className="relative overflow-hidden border-b border-marquee-line">
                <div className="absolute inset-0 bg-gradient-to-br from-marquee-panel2 via-marquee-bg to-black" />

                <div className="absolute inset-0 opacity-20 bg-film-grain" />

                <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
                    <Link
                        to="/"
                        className="mb-10 inline-flex items-center gap-2 text-sm text-marquee-muted transition hover:text-marquee-gold"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </Link>

                    <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-marquee-line bg-marquee-panel shadow-glow">
                                <Film
                                    size={44}
                                    strokeWidth={1.2}
                                    className="text-marquee-gold"
                                />
                            </div>

                            <div>
                                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-marquee-goldDim">
                                    Cinema
                                </div>

                                <h1 className="font-display text-5xl tracking-wide text-marquee-goldBright md:text-6xl">
                                    {cinema.name}
                                </h1>

                                {cinema.location && (
                                    <div className="mt-3 flex items-center gap-2 text-sm text-marquee-muted">
                                        <MapPin
                                            size={16}
                                            className="text-marquee-gold"
                                        />

                                        <span>
                                            {cinema.location.address}
                                            {cinema.location.city && (
                                                <>
                                                    {' · '}
                                                    {cinema.location.city}
                                                </>
                                            )}
                                            {cinema.location.country && (
                                                <>
                                                    {' · '}
                                                    {cinema.location.country}
                                                </>
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <FavouriteButton
                            itemType="cinema"
                            itemId={cinema._id}
                            className="h-10 w-10"
                        />
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border border-marquee-line bg-marquee-panel p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <Film
                                size={20}
                                className="text-marquee-gold"
                            />

                            <h2 className="font-serif text-xl text-marquee-cream">
                                Cinema Formats
                            </h2>
                        </div>

                        {cinema.type?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {cinema.type.map((type) => (
                                    <span
                                        key={type}
                                        className="rounded-full border border-marquee-line bg-marquee-panel2 px-3 py-1.5 text-xs uppercase tracking-wider text-marquee-gold"
                                    >
                                        {type}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-marquee-muted">
                                No formats available.
                            </p>
                        )}
                    </div>

                    <div className="rounded-xl border border-marquee-line bg-marquee-panel p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <MonitorPlay
                                size={20}
                                className="text-marquee-gold"
                            />

                            <h2 className="font-serif text-xl text-marquee-cream">
                                Features
                            </h2>
                        </div>

                        {cinema.features?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {cinema.features.map((feature) => (
                                    <span
                                        key={feature}
                                        className="rounded-full border border-marquee-line bg-marquee-panel2 px-3 py-1.5 text-xs text-marquee-muted"
                                    >
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-marquee-muted">
                                No additional features listed.
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6 rounded-xl border border-marquee-line bg-marquee-panel p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="font-serif text-2xl text-marquee-cream">
                                Screens
                            </h2>

                            <p className="mt-1 text-sm text-marquee-muted">
                                Available screens at this cinema.
                            </p>
                        </div>

                        <span className="rounded-full border border-marquee-line bg-marquee-panel2 px-3 py-1 text-xs text-marquee-gold">
                            {cinema.screens?.length || 0} screens
                        </span>
                    </div>

                    {cinema.screens?.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {cinema.screens.map((screen) => (
                                <div
                                    key={screen._id}
                                    className="rounded-lg border border-marquee-line bg-marquee-panel2 p-4 transition hover:border-marquee-gold"
                                >
                                    <div className="flex items-center gap-3">
                                        <MonitorPlay
                                            size={20}
                                            className="text-marquee-gold"
                                        />

                                        <div>
                                            <h3 className="font-medium text-marquee-cream">
                                                {screen.name ||
                                                    `Screen ${screen.number || ''}`}
                                            </h3>

                                            {screen.type && (
                                                <p className="mt-1 text-xs text-marquee-muted">
                                                    {screen.type}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed border-marquee-line bg-marquee-panel2 px-6 py-10 text-center">
                            <MonitorPlay
                                size={32}
                                className="mx-auto mb-3 text-marquee-goldDim"
                            />

                            <p className="text-sm text-marquee-muted">
                                No screens have been added to this cinema yet.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}