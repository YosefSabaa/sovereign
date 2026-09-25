'use client';
import { motion } from 'framer-motion';
import { LucideIcon, Heart } from 'lucide-react';
import { fadeInUp } from '@/lib/animations';

type Props = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  centered?: boolean;
};

export default function MedicalSectionTitle({
  title,
  subtitle,
  icon: Icon = Heart,
  centered = true
}: Props) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={fadeInUp}
      className={centered ? 'text-center mb-12' : 'mb-12'}
    >
      <div className={`flex items-center gap-3 mb-4 ${centered ? 'justify-center' : ''}`}>
        <div
          className="h-1 w-12 rounded-full"
          style={{ background: 'linear-gradient(to right, transparent, var(--color-secondary-500))' }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Icon size={24} style={{ color: 'var(--color-secondary-500)' }} />
        </motion.div>
        <div
          className="h-1 w-12 rounded-full"
          style={{ background: 'linear-gradient(to left, transparent, var(--color-secondary-500))' }}
        />
      </div>
      <h2
        className="text-3xl md:text-5xl font-black mb-3"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="text-lg max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}