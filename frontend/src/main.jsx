import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { FavouritesProvider } from './context/FavouriteContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>
        <FavouritesProvider>
          <App />
        </FavouritesProvider>
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
);
