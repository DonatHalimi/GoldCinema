import './i18n';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { FavouritesProvider } from './context/FavouriteContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import './index.css';
import { store } from './store/store.js';
import { initGlobalErrorLogging } from './utils/clientLogger.js';

initGlobalErrorLogging();

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <FavouritesProvider>
              <App />
            </FavouritesProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </ErrorBoundary>
);