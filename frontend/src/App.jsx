import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import tailwindConfig from '../tailwind.config.js';
import { Footer } from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import ToTop from './components/layout/ToTop.jsx';
import AppRoutes from './components/routes/AppRoutes';

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