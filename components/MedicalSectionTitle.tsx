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
        <div className="h-1 w-12 bg-gradient-to-r from-transparent to-teal-500 rounded-full" />
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Icon className="text-teal-500" size={24} />
        </motion.div>
        <div className="h-1 w-12 bg-gradient-to-l from-transparent to-teal-500 rounded-full" />
      </div>
      <h2 className={`text-3xl md:text-5xl font-black text-navy-700 mb-3 ${centered ? '' : ''}`}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}