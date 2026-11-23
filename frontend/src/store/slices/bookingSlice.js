import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    cinemaId: null,
    screenId: null,
    movieId: null,
    ticketPrice: 0,
    showtimeId: null,
    selectedSeats: [],
    selectedSeatTypes: {},
    holdId: null,
    holdExpiresAt: null,
    status: 'idle',
};

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        setBookingContext(state, action) {
            const { cinemaId, screenId, movieId, showtimeId, ticketPrice } = action.payload;
            if (state.showtimeId !== showtimeId) {
                state.selectedSeats = [];
                state.selectedSeatTypes = {};
                state.holdId = null;
                state.holdExpiresAt = null;
                state.status = 'idle';
            }
            state.cinemaId = cinemaId || null;
            state.screenId = screenId || null;
            state.movieId = movieId || null;
            state.ticketPrice = Number(ticketPrice) || 0;
            state.showtimeId = showtimeId || null;
        },
        toggleSelectedSeat(state, action) {
            const { id, type = 'standard' } = action.payload;
            if (state.selectedSeats.includes(id)) {
                state.selectedSeats = state.selectedSeats.filter((seatId) => seatId !== id);
                delete state.selectedSeatTypes[id];
            } else if (state.selectedSeats.length < 10) {
                state.selectedSeats.push(id);
                state.selectedSeatTypes[id] = type;
            }
        },
        restoreSelectedSeats(state, action) {
            const seats = Array.isArray(action.payload) ? action.payload : [];
            const uniqueSeats = [...new Map(seats.map((seat) => {
                const item = typeof seat === 'string' ? { id: seat, type: 'standard' } : seat;
                return [item.id, item];
            })).values()];
            state.selectedSeats = uniqueSeats.slice(0, 10).map((seat) => seat.id);
            state.selectedSeatTypes = Object.fromEntries(
                uniqueSeats.slice(0, 10).map((seat) => [seat.id, seat.type || 'standard'])
            );
        },
        setBookingHold(state, action) {
            state.holdId = action.payload.id || action.payload.holdId || null;
            state.holdExpiresAt = action.payload.expiresAt || null;
            state.status = 'held';
        },
        setBookingStatus(state, action) {
            state.status = action.payload;
        },
        clearBookingSelection(state) {
            state.selectedSeats = [];
            state.selectedSeatTypes = {};
            state.holdId = null;
            state.holdExpiresAt = null;
            state.status = 'idle';
        },
        clearBooking(state) {
            Object.assign(state, initialState);
        },
    },
});

export const {
    setBookingContext,
    toggleSelectedSeat,
    restoreSelectedSeats,
    setBookingHold,
    setBookingStatus,
    clearBookingSelection,
    clearBooking,
} = bookingSlice.actions;
export default bookingSlice.reducer;
