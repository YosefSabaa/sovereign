'use client';
import { motion } from 'framer-motion';

type Props = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  showText?: boolean;
  animated?: boolean;
  className?: string;
};

const SIZES = {
  sm: { img: 40, text: 'text-lg', subtext: 'text-[8px]' },
  md: { img: 60, text: 'text-xl', subtext: 'text-[10px]' },
  lg: { img: 100, text: 'text-3xl', subtext: 'text-xs' },
  xl: { img: 160, text: 'text-5xl', subtext: 'text-sm' }
};

export default function Logo({
  size = 'md',
  variant = 'light',
  showText = true,
  animated = false,
  className = ''
}: Props) {
  const s = SIZES[size];
  const textColor = variant === 'light' ? '#f8fafc' : '#1e3a5f';

  const content = (
    <div className={`flex flex-col items-center ${className}`}>
      <img
        src="/logo.png"
        alt="Sovereign"
        width={s.img}
        height={s.img}
        style={{
          width: s.img,
          height: 'auto',
          objectFit: 'contain',
          filter:
            variant === 'light'
              ? 'brightness(0) invert(1) drop-shadow(0 0 20px rgba(212, 175, 55, 0.3))'
              : 'none'
        }}
      />
      {showText && (
        <>
          <p
            className={`font-black mt-3 ${s.text}`}
            style={{
              color: textColor,
              letterSpacing: '0.3em'
            }}
          >
            SOVEREIGN
          </p>
          <p
            className={`mt-1 font-semibold ${s.subtext}`}
            style={{
              color:
                variant === 'light'
                  ? 'rgba(212, 175, 55, 0.8)'
                  : 'rgba(212, 175, 55, 1)',
              letterSpacing: '0.4em'
            }}
          >
            MEDICAL SCRUBS
          </p>
        </>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}