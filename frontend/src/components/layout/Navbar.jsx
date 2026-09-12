import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useCallback, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClickOutside } from '../../hooks/useClickOutside';
import NavLinks from './NavLinks';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);

  useClickOutside(panelRef, close, open);

  return (
    <header className="sticky top-0 z-40 border-b border-marquee-line bg-marquee-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2" onClick={close}>
          <span className="font-display text-3xl tracking-wide text-marquee-goldBright">
            GOLD<span className="text-marquee-cream">CINEMA</span>
          </span>
        </Link>

        <div className="hidden md:block">
          <NavLinks />
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls={menuId}
          aria-haspopup="true"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-marquee-cream md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            ref={panelRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-marquee-line bg-marquee-bg md:hidden"
          >
            <div className="px-6 py-4">
              <NavLinks mobile onNavigate={close} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}