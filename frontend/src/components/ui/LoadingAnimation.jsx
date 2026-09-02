import { motion } from 'framer-motion';

export const LoadingAnimation = () => {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="flex items-center gap-2">
                {[0, 1, 2].map((index) => (
                    <motion.div
                        key={index}
                        className="h-3 w-3 rounded-full bg-[#C6A15B]"
                        animate={{
                            opacity: [0.35, 1, 0.35],
                            scale: [0.85, 1, 0.85],
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: index * 0.15,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}