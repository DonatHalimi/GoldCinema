import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />

      <ToastContainer
        position="top-right"
        autoClose={4000}
        newestOnTop
        stacked
        limit={5}
        theme="dark"
      />
    </AuthProvider>
  </BrowserRouter>
);
