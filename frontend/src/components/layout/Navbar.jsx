import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import NavLinks from './NavLinks';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-marquee-line bg-marquee-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-3xl tracking-wide text-marquee-goldBright">
            GOLD<span className="text-marquee-cream">CINEMA</span>
          </span>
        </Link>

        <NavLinks />
      </div>
    </header>
  );
}