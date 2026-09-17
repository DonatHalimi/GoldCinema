import { configureStore } from '@reduxjs/toolkit';
import localeReducer from './slices/localeSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        locale: localeReducer,
    },
});