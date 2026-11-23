import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = 'gc-locale';
const SUPPORTED = ['en', 'sq', 'sr-Latn'];

function getInitialLocale() {
    if (typeof window === 'undefined') return 'en';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.includes(stored)) return stored;
    const nav = navigator.language;
    return SUPPORTED.find((l) => nav.startsWith(l)) || 'en';
}

const localeSlice = createSlice({
    name: 'locale',
    initialState: { current: getInitialLocale() },
    reducers: {
        setLocale(state, action) {
            state.current = action.payload;
        },
    },
});

export const { setLocale } = localeSlice.actions;

export default localeSlice.reducer;