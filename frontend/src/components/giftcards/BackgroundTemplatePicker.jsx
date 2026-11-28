import { animate, motion, useMotionValue } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const TEMPLATES = [
    {
        id: 'classic-gold',
        labelKey: 'templates.classic-gold',
        imageUrl:
            'https://images.unsplash.com/photo-1721209697441-9b9d17fdb646?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        id: 'birthday',
        labelKey: 'templates.birthday',
        imageUrl:
            'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1000&q=80',
    },
    {
        id: 'vip-access',
        labelKey: 'templates.vip-access',
        imageUrl:
            'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1000&q=80',
    },
    {
        id: 'holiday',
        labelKey: 'templates.holiday',
        imageUrl:
            'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&w=1000&q=80',
    },
    {
        id: 'popcorn-treat',
        labelKey: 'templates.popcorn-treat',
        imageUrl:
            'https://images.unsplash.com/photo-1582639230945-bd2926ad7862?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        id: 'thank-you',
        labelKey: 'templates.thank-you',
        imageUrl:
            'https://images.unsplash.com/photo-1502355984-b735cb2550ce?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        id: 'valentines',
        labelKey: 'templates.valentines',
        imageUrl:
            'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1000&q=80',
    },
    {
        id: 'movie-night',
        labelKey: 'templates.movie-night',
        imageUrl:
            'https://images.unsplash.com/photo-1596445836561-991bcd39a86d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        id: 'midnight-screening',
        labelKey: 'templates.midnight-screening',
        imageUrl:
            'https://images.unsplash.com/photo-1608170825938-a8ea0305d46c?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        id: 'you-deserve-it',
        labelKey: 'templates.you-deserve-it',
        imageUrl:
            'https://images.unsplash.com/photo-1640127249305-793865c2efe1?q=80&w=1103&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        id: 'red-carpet',
        labelKey: 'templates.red-carpet',
        imageUrl:
            'https://images.unsplash.com/photo-1614115866447-c9a299154650?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        id: 'treat-yourself',
        labelKey: 'templates.treat-yourself',
        imageUrl:
            'https://images.unsplash.com/photo-1702308719585-c23a691d0de5?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
];

const swipeConfidenceThreshold = 500;
const swipePower = (offset, velocity) => offset + velocity * 0.2;

const SPRING = {
    type: 'spring',
    stiffness: 500,
    damping: 35,
};

const SLIDE_TRANSITION = {
    type: 'tween',
    duration: 0.22,
    ease: 'easeOut',
};

function TemplateSlide({ template }) {
    const { t } = useTranslation('giftCards');
    const label = t(template.labelKey);

    return (
        <div className="absolute inset-0 select-none">
            {template.imageUrl ? (
                <img
                    src={template.imageUrl}
                    alt={label}
                    draggable={false}
                    className="h-full w-full object-cover pointer-events-none"
                />
            ) : (
                <div className={`h-full w-full ${template.swatchClass}`} />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4 pointer-events-none">
                <div>
                    <p className="text-lg font-semibold text-white">
                        {label}
                    </p>

                    <p className="text-xs text-white/70">
                        {t('templatePicker.slide.tagline')}
                    </p>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-marquee-gold text-black shadow-lg">
                    <Check className="h-4 w-4" />
                </div>
            </div>
        </div>
    );
}

export default function BackgroundTemplatePicker({
    value = 'classic-gold',
    onChange,
    error,
}) {
    const { t } = useTranslation('giftCards');

    const initialIndex = Math.max(
        0,
        TEMPLATES.findIndex((template) => template.id === value)
    );

    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isAnimating, setIsAnimating] = useState(false);

    const containerRef = useRef(null);
    const widthRef = useRef(0);
    const x = useMotionValue(0);

    useEffect(() => {
        const node = containerRef.current;

        if (!node) return undefined;

        const observer = new ResizeObserver((entries) => {
            widthRef.current = entries[0].contentRect.width;
        });

        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    const prevIndex =
        (currentIndex - 1 + TEMPLATES.length) % TEMPLATES.length;

    const nextIndex =
        (currentIndex + 1) % TEMPLATES.length;

    const commitIndex = useCallback(
        (index) => {
            setCurrentIndex(index);
            onChange(TEMPLATES[index].id);
        },
        [onChange]
    );

    const settleTo = useCallback(
        (target, index) => {
            setIsAnimating(true);

            animate(x, target, SLIDE_TRANSITION).then(() => {
                // Change the slide only after the outgoing slide
                // has completely left the viewport.
                commitIndex(index);

                // Reset position immediately after the new slide
                // becomes the current slide.
                x.set(0);

                setIsAnimating(false);
            });
        },
        [x, commitIndex]
    );

    const goToSlide = (index) => {
        if (isAnimating) return;

        x.set(0);
        commitIndex((index + TEMPLATES.length) % TEMPLATES.length);
    };

    const nextSlide = () => {
        if (isAnimating) return;

        settleTo(-widthRef.current || -1, nextIndex);
    };

    const previousSlide = () => {
        if (isAnimating) return;

        settleTo(widthRef.current || 1, prevIndex);
    };

    const handleDragEnd = (event, info) => {
        const width = widthRef.current;

        const swipe = swipePower(
            info.offset.x,
            info.velocity.x
        );

        if (
            swipe < -swipeConfidenceThreshold ||
            info.offset.x < -width * 0.25
        ) {
            settleTo(-width, nextIndex);
        } else if (
            swipe > swipeConfidenceThreshold ||
            info.offset.x > width * 0.25
        ) {
            settleTo(width, prevIndex);
        } else {
            animate(x, 0, SPRING);
        }
    };

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-marquee-muted">
                    {t('templatePicker.label')}
                </label>

                <span className="text-xs text-marquee-muted">
                    {t('templatePicker.counter', {
                        current: currentIndex + 1,
                        total: TEMPLATES.length,
                    })}
                </span>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-marquee-line bg-marquee-panel2">
                <div
                    ref={containerRef}
                    className="relative aspect-[16/7] overflow-hidden"
                >
                    <motion.div
                        style={{ x }}
                        drag={isAnimating ? false : 'x'}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={handleDragEnd}
                        whileDrag={{ cursor: 'grabbing' }}
                        className="absolute inset-0 cursor-grab touch-pan-y"
                    >
                        <div
                            className="absolute inset-y-0"
                            style={{
                                left: '-100%',
                                width: '100%',
                            }}
                        >
                            <TemplateSlide
                                template={TEMPLATES[prevIndex]}
                            />
                        </div>

                        <TemplateSlide
                            template={TEMPLATES[currentIndex]}
                        />

                        <div
                            className="absolute inset-y-0"
                            style={{
                                left: '100%',
                                width: '100%',
                            }}
                        >
                            <TemplateSlide
                                template={TEMPLATES[nextIndex]}
                            />
                        </div>
                    </motion.div>

                    <button
                        type="button"
                        onClick={previousSlide}
                        className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                        aria-label={t('templatePicker.previous')}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                        type="button"
                        onClick={nextSlide}
                        className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                        aria-label={t('templatePicker.next')}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 px-4 py-3">
                    {TEMPLATES.map((template, index) => (
                        <button
                            key={template.id}
                            type="button"
                            onClick={() => goToSlide(index)}
                            aria-label={t('templatePicker.select', {
                                name: t(template.labelKey),
                            })}
                            className="flex h-5 items-center justify-center"
                        >
                            <motion.span
                                animate={{
                                    width:
                                        index === currentIndex ? 22 : 6,
                                    opacity:
                                        index === currentIndex ? 1 : 0.4,
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 25,
                                }}
                                className="block h-1.5 rounded-full bg-marquee-gold"
                            />
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <p className="mt-1 text-xs text-marquee-marquee">
                    {error}
                </p>
            )}
        </div>
    );
}

export { TEMPLATES };
