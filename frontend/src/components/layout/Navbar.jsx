import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClickOutside } from '../../hooks/useClickOutside';
import NavLinks from './NavLinks';

const DESKTOP_QUERY = '(min-width: 1024px)'; // must match Tailwind `lg`

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);

  useClickOutside(headerRef, close, open);

  useEffect(() => {
    if (!open) return;
    const mql = window.matchMedia(DESKTOP_QUERY);
    const handleBreakpoint = (e) => e.matches && close();
    const handleKeyDown = (e) => e.key === 'Escape' && close();

    mql.addEventListener('change', handleBreakpoint);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      mql.removeEventListener('change', handleBreakpoint);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, close]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-[60] border-b border-marquee-line bg-marquee-bg/90 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <Link to="/" className="flex shrink-0 items-center gap-2" onClick={close}>
          <span className="whitespace-nowrap font-display text-2xl tracking-wide text-marquee-goldBright sm:text-3xl">
            GOLD<span className="text-marquee-cream">CINEMA</span>
          </span>
        </Link>

        <div className="hidden lg:block">
          <NavLinks />
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-marquee-gold/30 bg-marquee-gold/5 text-marquee-gold transition-colors hover:bg-marquee-gold/10 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute inset-x-0 top-full border-b border-marquee-line bg-marquee-bg/95 shadow-2xl shadow-black/50 backdrop-blur-xl lg:hidden"
          >
            <div className="mx-auto max-h-[calc(100dvh-4.5rem)] max-w-6xl overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
              <NavLinks mobile onNavigate={close} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}