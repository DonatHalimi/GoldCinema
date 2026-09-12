import { useEffect } from "react";

export function useClickOutside(ref, handler, enabled = true) {
    useEffect(() => {
        if (!enabled) return undefined;

        function handleEvent(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                handler();
            }
        }

        function handleEscape(e) {
            if (e.key === 'Escape') handler();
        }

        document.addEventListener('mousedown', handleEvent);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleEvent);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [ref, handler, enabled]);
}