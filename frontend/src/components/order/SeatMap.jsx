import {
  Armchair,
  Sofa,
  Accessibility,
  User,
} from 'lucide-react';

const MAX_SEATS = 10;

const STATUS_STYLES = {
  available:
    'border-emerald-700 bg-emerald-950/60 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-900/60 hover:text-emerald-200',
  held:
    'cursor-not-allowed border-amber-700/60 bg-amber-950/40 text-amber-500/70',
  booked:
    'cursor-not-allowed border-red-800/60 bg-red-950/40 text-red-500/60',
  selected:
    'border-marquee-goldBright bg-marquee-gold text-marquee-bg shadow-glow scale-105',
};

const SEAT_ICONS = {
  standard: User,
  recliner: Armchair,
  wheelchair: Accessibility,
  'love-seat': Sofa,
};

export default function SeatMap({ seats, selected, onToggle }) {
  const rows = {};
  seats.forEach((seat) => {
    const rowLetter = seat.id.match(/^[A-Z]+/)[0];
    if (!rows[rowLetter]) rows[rowLetter] = [];
    rows[rowLetter].push(seat);
  });

  return (
    <div className="select-none">
      <div className="mx-auto mb-10 h-2 w-3/4 rounded-full bg-gradient-to-r from-transparent via-marquee-gold/60 to-transparent shadow-glow" />
      <p className="mb-10 text-center text-xs uppercase tracking-[0.3em] text-marquee-muted">
        Screen
      </p>

      <div className="flex flex-col items-center gap-3">
        {Object.entries(rows).map(([rowLetter, rowSeats]) => (
          <div key={rowLetter} className="flex items-center gap-3">
            <span className="w-6 text-right font-mono text-sm text-marquee-muted">
              {rowLetter}
            </span>
            <div className="flex gap-2.5">
              {rowSeats.map((seat) => {
                const isSelected = selected.includes(seat.id);
                const isDisabled =
                  seat.status !== 'available' && !isSelected;
                const disableNewSelection =
                  !isSelected && !isDisabled && selected.length >= MAX_SEATS;

                const visualStatus = isSelected ? 'selected' : seat.status;

                const SeatIcon = SEAT_ICONS[seat.type] || User;

                return (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={isDisabled || disableNewSelection}
                    onClick={() => onToggle(seat.id)}
                    className={[
                      'flex h-10 w-10 items-center justify-center rounded-t-lg border-2 transition-all',
                      STATUS_STYLES[visualStatus],
                      disableNewSelection && !isDisabled
                        ? 'cursor-not-allowed opacity-40'
                        : '',
                    ].join(' ')}
                  >
                    <div className="flex flex-col items-center leading-none">
                      <SeatIcon size={14} />
                      <span className="text-[9px]">{seat.number}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-marquee-muted">
        <Legend swatchClass="border-emerald-700 bg-emerald-950/60" label="Available" />
        <Legend swatchClass="border-marquee-goldBright bg-marquee-gold" label="Selected" />
        <Legend swatchClass="border-amber-700/60 bg-amber-950/40" label="Held" />
        <Legend swatchClass="border-red-800/60 bg-red-950/40" label="Booked" />
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-8 text-xs text-marquee-muted pt-3">
        <SeatTypeLegend icon={User} label="Standard Seat" />
        <SeatTypeLegend icon={Armchair} label="Recliner" />
        <SeatTypeLegend icon={Sofa} label="Love Seat" />
        <SeatTypeLegend icon={Accessibility} label="Wheelchair Accessible" />
      </div>
      {selected.length >= MAX_SEATS && (
        <p className="mt-4 text-center text-xs text-marquee-goldDim">
          Maximum {MAX_SEATS} seats per booking.
        </p>
      )}
    </div>
  );
}

function Legend({ swatchClass, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-5 w-5 rounded-t border-2 ${swatchClass}`} />
      {label}
    </div>
  );
}

function SeatTypeLegend({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={18} className="text-marquee-gold" />
      <span>{label}</span>
    </div>
  );
}