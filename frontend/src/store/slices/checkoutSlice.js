import { createSlice } from '@reduxjs/toolkit';

const checkoutSlice = createSlice({
    name: 'checkout',
    initialState: { provider: 'stripe', orderId: null, status: 'idle' },
    reducers: {
        setPaymentProvider(state, action) {
            state.provider = action.payload;
        },
        setCheckoutOrder(state, action) {
            state.orderId = action.payload || null;
            state.status = action.payload ? 'active' : 'idle';
        },
        setCheckoutStatus(state, action) {
            state.status = action.payload;
        },
        resetCheckout(state) {
            state.provider = 'stripe';
            state.orderId = null;
            state.status = 'idle';
        },
    },
});

export const { setPaymentProvider, setCheckoutOrder, setCheckoutStatus, resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
