import { useEffect } from 'react';

export default function useEscapeKey(onEscape, enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onEscape(event);
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onEscape, enabled]);
}