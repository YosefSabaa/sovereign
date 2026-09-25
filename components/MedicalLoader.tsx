'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function MedicalLoader() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setShow(true);
    const timer = setTimeout(() => setShow(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-gradient-to-br from-navy-900 via-navy-700 to-teal-900 flex flex-col items-center justify-center z-[100]"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1, 1.15, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="relative"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-2xl glow-pulse">
              <svg
                className="w-14 h-14 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-teal-400"
              animate={{ scale: [1, 1.8], opacity: [1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>

          <motion.p
            className="mt-8 text-white text-2xl font-black tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Sovereign
          </motion.p>

          <svg
            className="absolute bottom-20 w-full max-w-2xl h-24"
            viewBox="0 0 800 100"
          >
            <motion.path
              d="M0 50 L200 50 L220 50 L230 20 L240 80 L250 50 L270 50 L280 40 L290 60 L300 50 L500 50 L520 50 L530 20 L540 80 L550 50 L570 50 L580 40 L590 60 L600 50 L800 50"
              fill="none"
              stroke="#2dd4bf"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}