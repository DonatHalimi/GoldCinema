import { animate } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsVisible(window.scrollY > 100);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToTop = () => {
        animate(window.scrollY, 0, {
            duration: 0.2,
            ease: [0.22, 0.22, 0.36, 0.36],
            onUpdate(latest) {
                window.scrollTo(0, latest);
            },
        });
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className={`to-top-button ${isVisible ? 'visible' : 'hidden'}`}
        >
            <ArrowUp className="to-top-arrow" />
        </button>
    );
}