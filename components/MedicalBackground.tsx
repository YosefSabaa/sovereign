'use client';
import { motion } from 'framer-motion';

export default function MedicalBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-700 to-teal-900" />

      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(45, 212, 191, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(45, 212, 191, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <motion.div
        className="absolute w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
        style={{ top: '10%', left: '5%' }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
        style={{ bottom: '10%', right: '5%' }}
        animate={{
          x: [0, -80, 0],
          y: [0, -60, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg
        className="absolute bottom-0 left-0 w-full h-32 opacity-20"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0 60 L200 60 L220 60 L230 20 L240 100 L250 60 L270 60 L280 40 L290 80 L300 60 L500 60 L520 60 L530 20 L540 100 L550 60 L570 60 L580 40 L590 80 L600 60 L800 60 L820 60 L830 20 L840 100 L850 60 L870 60 L880 40 L890 80 L900 60 L1200 60"
          fill="none"
          stroke="#14b8a6"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 0] }}
          transition={{
            pathLength: { duration: 3, repeat: Infinity },
            opacity: { duration: 3, repeat: Infinity }
          }}
        />
      </svg>

      <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 dna-helix">
        <svg width="150" height="400" viewBox="0 0 150 400">
          {[...Array(20)].map((_, i) => (
            <motion.circle
              key={i}
              cx={75 + Math.sin(i * 0.5) * 40}
              cy={i * 20}
              r="6"
              fill="#2dd4bf"
              animate={{
                cx: [
                  75 + Math.sin(i * 0.5) * 40,
                  75 - Math.sin(i * 0.5) * 40,
                  75 + Math.sin(i * 0.5) * 40
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.1
              }}
            />
          ))}
        </svg>
      </div>

      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-teal-400/20 font-black"
          style={{
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 20}%`,
            fontSize: `${40 + i * 10}px`
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 8 + i,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          ✚
        </motion.div>
      ))}
    </div>
  );
}