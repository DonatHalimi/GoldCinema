export default function SeatSelectionHeader({ showtime, movie }) {
    return (
        <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-marquee-goldDim">
                {new Date(showtime.startTime).toLocaleDateString()}
                {' · '}
                {new Date(showtime.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                })}
            </p>

            <h1 className="font-serif text-3xl font-bold text-marquee-cream">
                {movie.title}
            </h1>
        </div>
    );
}