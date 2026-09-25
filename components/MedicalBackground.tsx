'use client';
import { motion } from 'framer-motion';

export default function MedicalBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom right, var(--color-primary-900), var(--color-primary-700), var(--color-secondary-700))`
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(212, 175, 55, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(212, 175, 55, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Glowing orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl"
        style={{
          top: '10%',
          left: '5%',
          background: 'rgba(212, 175, 55, 0.2)'
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-80 h-80 rounded-full blur-3xl"
        style={{
          bottom: '10%',
          right: '5%',
          background: 'rgba(30, 58, 95, 0.3)'
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, -60, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ECG Line at bottom */}
      <svg
        className="absolute bottom-0 left-0 w-full h-32 opacity-20"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0 60 L200 60 L220 60 L230 20 L240 100 L250 60 L270 60 L280 40 L290 80 L300 60 L500 60 L520 60 L530 20 L540 100 L550 60 L570 60 L580 40 L590 80 L600 60 L800 60 L820 60 L830 20 L840 100 L850 60 L870 60 L880 40 L890 80 L900 60 L1200 60"
          fill="none"
          stroke="#d4af37"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 0] }}
          transition={{
            pathLength: { duration: 3, repeat: Infinity },
            opacity: { duration: 3, repeat: Infinity }
          }}
        />
      </svg>

      {/* DNA Helix - Right side */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: 'center' }}
        >
          <svg width="150" height="400" viewBox="0 0 150 400">
            {[...Array(20)].map((_, i) => (
              <motion.circle
                key={i}
                cx={75 + Math.sin(i * 0.5) * 40}
                cy={i * 20}
                r="6"
                fill="#d4af37"
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
        </motion.div>
      </div>

      {/* ========================================
          🎨 اللوجوهات المتحركة - بيضاء واضحة
          ======================================== */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => {
          const positions = [
            { left: '6%', top: '12%', size: 100, delay: 0 },
            { left: '82%', top: '18%', size: 80, delay: 0.5 },
            { left: '12%', top: '68%', size: 90, delay: 1 },
            { left: '78%', top: '72%', size: 110, delay: 1.5 },
            { left: '48%', top: '6%', size: 75, delay: 2 },
            { left: '28%', top: '42%', size: 85, delay: 2.5 }
          ];
          const pos = positions[i];

          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: pos.left,
                top: pos.top,
                width: pos.size,
                height: pos.size
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 360, 0],
                scale: [1, 1.1, 1],
                opacity: [0.15, 0.25, 0.15]
              }}
              transition={{
                duration: 12 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: pos.delay
              }}
            >
              {/* ✅ استخدام mask بدل filter عشان اللوجو يبقى أبيض نقي */}
              <div
                className="w-full h-full"
                style={{
                  maskImage: 'url(/logo.png)',
                  WebkitMaskImage: 'url(/logo.png)',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                  background: '#ffffff',
                  filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.3))'
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* ========================================
          ✨ Sparkles ذهبية
          ======================================== */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${10 + i * 11}%`,
            top: `${15 + (i % 4) * 20}%`,
            width: 4,
            height: 4,
            background: '#d4af37'
          }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.4
          }}
        />
      ))}
    </div>
  );
}