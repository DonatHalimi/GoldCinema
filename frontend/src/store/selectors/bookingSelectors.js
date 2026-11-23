import { createSelector } from '@reduxjs/toolkit';

export const selectSelectedSeats = (state) => state.booking.selectedSeats;
export const selectSelectedSeatCount = createSelector(
    [selectSelectedSeats],
    (seats) => seats.length
);
export const selectCanAddSeat = createSelector(
    [selectSelectedSeatCount],
    (count) => count < 10
);
export const selectSelectedSeatTypes = (state) => state.booking.selectedSeatTypes;
export const selectSelectedSeatTotal = createSelector(
    [selectSelectedSeatCount, (state) => state.booking.ticketPrice],
    (count, price) => count * price
);
export const selectSelectedShowtime = (state) => state.booking.showtimeId;
export const selectIsSeatSelected = (state, seatId) => state.booking.selectedSeats.includes(seatId);
export const selectBookingSummary = createSelector(
    [
        (state) => state.booking.movieId,
        selectSelectedShowtime,
        selectSelectedSeats,
        selectSelectedSeatTotal,
        (state) => state.booking.holdExpiresAt,
        (state) => state.booking.status,
    ],
    (movieId, showtimeId, seats, total, holdExpiresAt, status) => ({
        movieId,
        showtimeId,
        seats,
        seatCount: seats.length,
        total,
        holdExpiresAt,
        status,
    })
);
