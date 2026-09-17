import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'gc-theme';
const TRANSITION_CLASS = 'theme-transition';
const TRANSITION_MS = 420;

let transitionTimer = null;

function getInitialMode() {
    if (typeof window === 'undefined') return 'dark';

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;

    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(mode) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    root.classList.add(TRANSITION_CLASS);

    requestAnimationFrame(() => {
        root.setAttribute('data-theme', mode);
    });

    if (transitionTimer) window.clearTimeout(transitionTimer);
    transitionTimer = window.setTimeout(() => {
        root.classList.remove(TRANSITION_CLASS);
        transitionTimer = null;
    }, TRANSITION_MS);

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