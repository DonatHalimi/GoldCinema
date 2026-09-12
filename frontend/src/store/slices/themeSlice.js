import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'gc-theme';

function getInitialMode() {
    if (typeof window === 'undefined') return 'dark';

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;

    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    window.localStorage.setItem(STORAGE_KEY, mode);
}

const themeSlice = createSlice({
    name: 'theme',
    initialState: { mode: getInitialMode() },
    reducers: {
        toggleTheme(state) {
            state.mode = state.mode === 'dark' ? 'light' : 'dark';
            applyTheme(state.mode);
        },
        setTheme(state, action) {
            state.mode = action.payload;
            applyTheme(state.mode);
        },
    },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;