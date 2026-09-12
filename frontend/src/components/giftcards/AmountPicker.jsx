import { AnimatePresence, motion } from 'framer-motion';
import { DollarSign, Sparkles } from 'lucide-react';
import { useState } from 'react';

const PRESETS = [25, 50, 100, 150, 200];
const MIN_AMOUNT = 5;
const MAX_AMOUNT = 500;

export default function AmountPicker({ value, onChange, error }) {
    const isCustom = value !== null && !PRESETS.includes(value);
    const [showCustomInput, setShowCustomInput] = useState(isCustom || value === '');

    const handlePresetClick = (amount) => {
        setShowCustomInput(false);
        onChange(amount);
    };

    const handleCustomToggle = () => {
        const nextState = !showCustomInput;
        setShowCustomInput(nextState);
        if (nextState && !isCustom) {
            onChange(value || 25);
        }
    };

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-marquee-muted">
                    Card amount
                </label>
                {value && (
                    <span className="text-xs font-medium text-marquee-gold">
                        Selected: ${value}
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {PRESETS.map((amount) => {
                    const isSelected = value === amount && !showCustomInput;
                    return (
                        <motion.button
                            key={amount}
                            type="button"
                            onClick={() => handlePresetClick(amount)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={`relative rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${isSelected
                                ? 'bg-marquee-gold text-marquee-bg shadow-lg shadow-marquee-gold/20'
                                : 'border border-marquee-line bg-marquee-panel2 text-marquee-muted hover:border-marquee-gold/50 hover:text-marquee-cream'
                                }`}
                        >
                            ${amount}
                            {isSelected && (
                                <motion.div
                                    layoutId="amount-pill-glow"
                                    className="absolute inset-0 rounded-full border border-marquee-gold/40"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    );
                })}

                <motion.button
                    type="button"
                    onClick={handleCustomToggle}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${showCustomInput
                        ? 'border border-marquee-gold bg-marquee-gold/10 text-marquee-gold'
                        : 'border border-marquee-line bg-marquee-panel2 text-marquee-muted hover:border-marquee-gold/50 hover:text-marquee-cream'
                        }`}
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    Custom
                </motion.button>
            </div>

            <AnimatePresence>
                {showCustomInput && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -8 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -8 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 rounded-xl border border-marquee-line bg-marquee-panel2 p-6 flex flex-col items-center text-center">

                            <span className="text-xs text-marquee-muted uppercase tracking-wider mb-3">
                                Enter custom amount or use slider
                            </span>

                            <div className="relative w-44 group mb-6">
                                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-marquee-gold/40 to-marquee-goldBright/10 opacity-60 blur-sm transition group-focus-within:opacity-100" />

                                <div className="relative flex items-center justify-center rounded-xl border border-marquee-line bg-marquee-bg px-4 py-3 transition group-focus-within:border-marquee-gold">
                                    <DollarSign className="h-4 w-4 text-marquee-gold shrink-0 mr-1" />
                                    <input
                                        type="number"
                                        min={MIN_AMOUNT}
                                        max={MAX_AMOUNT}
                                        step="1"
                                        value={value === null ? '' : value}
                                        onChange={(e) =>
                                            onChange(
                                                e.target.value === ''
                                                    ? ''
                                                    : Number(e.target.value)
                                            )
                                        }
                                        placeholder="25"
                                        className="w-20 bg-transparent text-xl font-bold text-marquee-cream text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="text-xs font-semibold text-marquee-muted/60 uppercase tracking-widest pl-1 select-none">
                                        USD
                                    </span>
                                </div>
                            </div>

                            <div className="w-full pt-4 border-t border-marquee-line/50 flex items-center gap-4">
                                <span className="text-xs font-semibold text-marquee-muted">${MIN_AMOUNT}</span>
                                <input
                                    type="range"
                                    min={MIN_AMOUNT}
                                    max={MAX_AMOUNT}
                                    step="1"
                                    value={value || MIN_AMOUNT}
                                    onChange={(e) => onChange(Number(e.target.value))}
                                    className="w-full accent-marquee-gold cursor-pointer h-1.5 bg-marquee-line rounded-lg"
                                />
                                <span className="text-xs font-semibold text-marquee-muted">${MAX_AMOUNT}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && <p className="mt-1.5 text-xs text-marquee-marquee">{error}</p>}
        </div>
    );
}