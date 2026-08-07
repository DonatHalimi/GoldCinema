import { ToastContainer } from 'react-toastify';
import Navbar from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import AppRoutes from './components/routes/AppRoutes';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-marquee-bg">
      <Navbar />

      <main className="flex-1">
        <AppRoutes />
      </main>

      <Footer />

      <ToastContainer
        position="top-right"
        autoClose={4000}
        newestOnTop
        stacked
        limit={5}
        theme="dark"
      />
    </div>
  );
}