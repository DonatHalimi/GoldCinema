import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import {
  User,
  Ticket,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = user?.name
    ? user.name.split(' ')[0]
    : user?.email?.split('@')[0] || 'User';

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

        <nav className="flex items-center gap-6 font-body text-sm">
          <Link
            to="/"
            className="text-marquee-muted transition hover:text-marquee-gold"
          >
            Now Showing
          </Link>

          {!user ? (
            <Link
              to="/login"
              className="rounded-full bg-marquee-gold px-5 py-1.5 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright"
            >
              Sign in
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-marquee-line bg-marquee-panel2 px-4 py-2 text-marquee-cream transition hover:border-marquee-gold"
              >
                <User size={18} />
                <span>{displayName}</span>

                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${open ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-xl border border-marquee-line bg-marquee-panel shadow-2xl">
                  <div className="border-b border-marquee-line px-4 py-4">
                    <p className="font-semibold text-marquee-cream">
                      {displayName}
                    </p>

                    <p className="mt-1 text-xs text-marquee-muted">
                      {user.email}
                    </p>

                  </div>
                  {(user.role === 'admin' || user.role?.name?.toLowerCase() === 'admin') && (
                    <Link
                      to="/admin/users"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-marquee-muted transition hover:bg-marquee-panel2 hover:text-marquee-gold"
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>
                  )}
                  <Link
                    to="/tickets"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-marquee-muted transition hover:bg-marquee-panel2 hover:text-marquee-gold"
                  >
                    <Ticket size={18} />
                    My Tickets
                  </Link>

                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="flex w-full items-center gap-3 border-t border-marquee-line px-4 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                  >
                    <LogOut size={18} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}