import { Moon, Sun } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../store/slices/themeSlice';

export default function ThemeToggle() {
    const mode = useSelector((state) => state.theme.mode);
    const dispatch = useDispatch();

    return (
        <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-marquee-muted transition-colors duration-200 hover:bg-white/[0.03] hover:text-marquee-gold"
        >
            {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
    );
}