'use client';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Users, Package, Star, Truck, Heart, Award } from 'lucide-react';
import { staggerContainer, staggerItem, heartbeat } from '@/lib/animations';

export default function StatsSection() {
  const locale = useLocale();

  const stats = [
    {
      icon: Users,
      value: '5000+',
      labelAr: 'طالب طب',
      labelEn: 'Medical Students',
      gradient: 'from-teal-400 to-teal-600'
    },
    {
      icon: Package,
      value: '500+',
      labelAr: 'منتج طبي',
      labelEn: 'Medical Products',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      icon: Star,
      value: '4.9/5',
      labelAr: 'تقييم العملاء',
      labelEn: 'Customer Rating',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Truck,
      value: '48h',
      labelAr: 'شحن سريع',
      labelEn: 'Fast Delivery',
      gradient: 'from-purple-400 to-purple-600'
    },
    {
      icon: Heart,
      value: '99%',
      labelAr: 'رضا العملاء',
      labelEn: 'Satisfaction',
      gradient: 'from-red-400 to-pink-600'
    },
    {
      icon: Award,
      value: '100%',
      labelAr: 'جودة مضمونة',
      labelEn: 'Quality Assured',
      gradient: 'from-green-400 to-emerald-600'
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom right, var(--color-primary-900), var(--color-primary-700), var(--color-secondary-700))`
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(212, 175, 55, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(212, 175, 55, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <motion.div
            animate={heartbeat}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-6"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff'
            }}
          >
            <Heart size={16} className="fill-white text-white" />
            {locale === 'ar' ? 'أرقامنا تتحدث' : 'Our Numbers Speak'}
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-black text-white mb-3">
            {locale === 'ar' ? 'لماذا يثق بنا الآلاف؟' : 'Trusted by Thousands'}
          </h2>

          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {locale === 'ar'
              ? 'أرقام حقيقية تعكس التزامنا بالجودة والخدمة'
              : 'Real numbers reflecting our commitment to quality'}
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              whileHover={{ y: -8, scale: 1.03 }}
              className="relative rounded-2xl p-5 text-center transition-colors group overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
              />

              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className={`relative w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-lg`}
              >
                <stat.icon size={24} className="text-white" />
              </motion.div>

              <p className="relative text-3xl font-black text-white mb-1">
                {stat.value}
              </p>

              <p className="relative text-xs text-white/70 font-semibold">
                {locale === 'ar' ? stat.labelAr : stat.labelEn}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}