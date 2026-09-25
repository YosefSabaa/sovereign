'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function MedicalLoader() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setShow(true);
    const timer = setTimeout(() => setShow(false), 2000);
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
          className="fixed inset-0 flex flex-col items-center justify-center z-[100]"
          style={{
            background: `linear-gradient(to bottom right, var(--color-primary-900, #0a1828), var(--color-primary-700, #152945), var(--color-secondary-700, #a16207))`
          }}
        >
          {/* Logo with pulse */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <img
                src="/logo.png"
                alt="Sovereign"
                className="h-32 w-auto object-contain"
                style={{
                  filter:
                    'brightness(0) invert(1) drop-shadow(0 0 30px rgba(212, 175, 55, 0.5))'
                }}
              />
            </motion.div>

            {/* Pulse rings */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: '2px solid rgba(212, 175, 55, 0.4)',
                width: '200px',
                height: '200px',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
              animate={{
                scale: [1, 1.5],
                opacity: [0.8, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{
                border: '2px solid rgba(212, 175, 55, 0.4)',
                width: '200px',
                height: '200px',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
              animate={{
                scale: [1, 1.5],
                opacity: [0.8, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col items-center"
          >
            <p
              className="text-2xl font-black"
              style={{
                color: '#f8fafc',
                letterSpacing: '0.3em'
              }}
            >
              SOVEREIGN
            </p>
            <p
              className="text-xs mt-2 font-semibold"
              style={{
                color: 'rgba(212, 175, 55, 0.9)',
                letterSpacing: '0.4em'
              }}
            >
              MEDICAL SCRUBS
            </p>
          </motion.div>

          {/* Loading line */}
          <motion.div
            className="mt-8 w-48 h-0.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(212, 175, 55, 0.2)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(to right, var(--color-secondary-400, #facc15), var(--color-secondary-500, #d4af37))`
              }}
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* ECG line at bottom */}
          <svg
            className="absolute bottom-20 w-full max-w-2xl h-24"
            viewBox="0 0 800 100"
          >
            <motion.path
              d="M0 50 L200 50 L220 50 L230 20 L240 80 L250 50 L270 50 L280 40 L290 60 L300 50 L500 50 L520 50 L530 20 L540 80 L550 50 L570 50 L580 40 L590 60 L600 50 L800 50"
              fill="none"
              stroke="#d4af37"
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