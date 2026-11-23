import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Accessibility,
  Armchair,
  Sofa,
  User,
} from 'lucide-react';
import { selectCanAddSeat, selectIsSeatSelected, selectSelectedSeatCount } from '../../store/selectors/bookingSelectors';

const MAX_SEATS = 10;

const STATUS_STYLES = {
  available:
    'border-[rgb(var(--color-available)/0.5)] bg-[rgb(var(--color-available)/0.12)] text-[rgb(var(--color-available))] hover:border-[rgb(var(--color-available)/0.9)] hover:bg-[rgb(var(--color-available)/0.2)]',
  held:
    'cursor-not-allowed border-marquee-gold bg-marquee-gold/20 text-marquee-gold',
  booked:
    'cursor-not-allowed border-[rgb(var(--color-booked)/0.4)] bg-[rgb(var(--color-booked)/0.15)] text-[rgb(var(--color-booked))]',
  selected:
    'border-marquee-goldBright bg-marquee-gold text-marquee-bg shadow-glow scale-105',
};

const SEAT_ICONS = {
  standard: User,
  recliner: Armchair,
  wheelchair: Accessibility,
  'love-seat': Sofa,
};

const SeatButton = memo(function SeatButton({ seat, onToggle }) {
  const isSelected = useSelector((state) => selectIsSeatSelected(state, seat.id));
  const canAddSeat = useSelector(selectCanAddSeat);
  const isDisabled = seat.status !== 'available' && !isSelected;
  const disableNewSelection = !isSelected && !isDisabled && !canAddSeat;
  const visualStatus = isSelected ? 'selected' : seat.status;
  const SeatIcon = SEAT_ICONS[seat.type] || User;

  return (
    <button
      type="button"
      disabled={isDisabled || disableNewSelection}
      onClick={() => onToggle(seat.id)}
      aria-pressed={isSelected}
      aria-label={`${seat.id} ${seat.type || 'standard'} seat, ${visualStatus}`}
      className={[
        'flex h-10 w-10 items-center justify-center rounded-t-lg border-2 transition-all',
        STATUS_STYLES[visualStatus],
        disableNewSelection && !isDisabled ? 'cursor-not-allowed opacity-40' : '',
      ].join(' ')}
    >
      <div className="flex flex-col items-center leading-none">
        <SeatIcon size={14} />
        <span className="text-[9px]">{seat.number}</span>
      </div>
    </button>
  );
});

function SeatMap({ seats, onToggle }) {
  const selectedCount = useSelector(selectSelectedSeatCount);
  const rows = useMemo(() => {
    const grouped = {};
    seats.forEach((seat) => {
      const rowLetter = seat.id.match(/^[A-Z]+/)[0];
      if (!grouped[rowLetter]) grouped[rowLetter] = [];
      grouped[rowLetter].push(seat);
    });
    return grouped;
  }, [seats]);

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
                return (
                  <SeatButton
                    key={seat.id}
                    seat={seat}
                    onToggle={onToggle}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-marquee-muted">
        <Legend swatchClass="border-[rgb(var(--color-available)/0.5)] bg-[rgb(var(--color-available)/0.12)]" label="Available" />
        <Legend swatchClass="border-marquee-goldBright bg-marquee-gold" label="Selected" />
        <Legend swatchClass="border-marquee-gold bg-marquee-gold/20" label="Held" />
        <Legend swatchClass="border-[rgb(var(--color-booked)/0.4)] bg-[rgb(var(--color-booked)/0.15)]" label="Booked" />
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-8 text-xs text-marquee-muted pt-3">
        <SeatTypeLegend icon={User} label="Standard Seat" />
        <SeatTypeLegend icon={Armchair} label="Recliner" />
        <SeatTypeLegend icon={Sofa} label="Love Seat" />
        <SeatTypeLegend icon={Accessibility} label="Wheelchair Accessible" />
      </div>
      {selectedCount >= MAX_SEATS && (
        <p className="mt-4 text-center text-xs text-marquee-goldDim">
          Maximum {MAX_SEATS} seats per booking.
        </p>
      )}
    </div>
  );
}

export default memo(SeatMap);

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