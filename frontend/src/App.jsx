import { ToastContainer } from 'react-toastify';
import Navbar from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import AppRoutes from './components/routes/AppRoutes';
import tailwindConfig from '../tailwind.config.js';
import ToTop from './components/layout/ToTop.jsx';

const toastTheme = tailwindConfig.toastTheme;

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-marquee-bg">
      <Navbar />

      <main className="flex-1">
        <AppRoutes />
      </main>

      <Footer />

      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        newestOnTop
        stacked
        theme={!toastTheme}
        hideProgressBar
        closeOnClick
      />
      <ToTop />
    </div>
  );
}