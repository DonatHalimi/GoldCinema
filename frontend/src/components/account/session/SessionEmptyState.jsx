import { Laptop } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SessionEmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-marquee-line py-12 text-center"
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-marquee-line bg-marquee-panel2 text-marquee-goldDim">
                <Laptop size={22} />
            </div>

            <div>
                <p className="text-sm font-medium text-marquee-cream">Only this device</p>

                <p className="mt-1 text-xs text-marquee-muted">No other active sessions found.</p>
            </div>
        </motion.div>
    );
}