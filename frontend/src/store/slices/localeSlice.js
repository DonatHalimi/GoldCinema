import { createSlice } from "@reduxjs/toolkit";
import i18next from 'i18next';

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
            document.documentElement.setAttribute('lang', action.payload);
            window.localStorage.setItem(STORAGE_KEY, action.payload);
            i18next.changeLanguage(action.payload);
        },
    },
});

export const { setLocale } = localeSlice.actions;

export default localeSlice.reducer;