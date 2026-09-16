import { motion } from 'motion/react';

export default function StreamingIndicator() {
    return (
        <span className="flex items-center gap-1 h-4" aria-label="Haven is typing">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </span>
    );
}