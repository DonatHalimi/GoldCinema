import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import i18next from '../i18n';
import { apiSlice } from './api/apiSlice';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import checkoutReducer from './slices/checkoutSlice';
import localeReducer from './slices/localeSlice';
import { setLocale } from './slices/localeSlice';
import themeReducer from './slices/themeSlice';
import { setTheme, toggleTheme } from './slices/themeSlice';

const listenerMiddleware = createListenerMiddleware();
const TRANSITION_CLASS = 'theme-transition';
const TRANSITION_MS = 420;
let transitionTimer = null;

listenerMiddleware.startListening({
    matcher: (action) => setTheme.match(action) || toggleTheme.match(action),
    effect: (_, listenerApi) => {
        const mode = listenerApi.getState().theme.mode;
        if (typeof document === 'undefined') return;

        const root = document.documentElement;
        root.classList.add(TRANSITION_CLASS);
        window.requestAnimationFrame(() => root.setAttribute('data-theme', mode));
        if (transitionTimer) window.clearTimeout(transitionTimer);
        transitionTimer = window.setTimeout(() => {
            root.classList.remove(TRANSITION_CLASS);
            transitionTimer = null;
        }, TRANSITION_MS);
        window.localStorage.setItem('gc-theme', mode);
    },
});

listenerMiddleware.startListening({
    actionCreator: setLocale,
    effect: (action) => {
        document.documentElement.setAttribute('lang', action.payload);
        window.localStorage.setItem('gc-locale', action.payload);
        return i18next.changeLanguage(action.payload);
    },
});

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer,
        booking: bookingReducer,
        checkout: checkoutReducer,
        theme: themeReducer,
        locale: localeReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware).concat(apiSlice.middleware),
    devTools: import.meta.env.DEV,
});