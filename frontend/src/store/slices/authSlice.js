import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: { sessionEnabled: false, sessionChecked: false, loggingOut: false },
    reducers: {
        enableSession(state) {
            state.sessionEnabled = true;
            state.loggingOut = false;
        },
        beginSessionCheck(state) {
            state.sessionEnabled = true;
            state.sessionChecked = false;
            state.loggingOut = false;
        },
        completeSessionCheck(state) {
            state.sessionChecked = true;
        },
        disableSession(state) {
            state.sessionEnabled = false;
            state.sessionChecked = true;
            state.loggingOut = false;
        },
        beginLogout(state) {
            state.sessionEnabled = false;
            state.sessionChecked = true;
            state.loggingOut = true;
        },
        finishLogout(state) {
            state.sessionEnabled = false;
            state.sessionChecked = true;
            state.loggingOut = false;
        },
    },
});

export const {
    enableSession,
    beginSessionCheck,
    completeSessionCheck,
    disableSession,
    beginLogout,
    finishLogout,
} = authSlice.actions;
export default authSlice.reducer;
