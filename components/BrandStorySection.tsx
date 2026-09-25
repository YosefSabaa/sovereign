'use client';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import {
  Heart, Award, Users, Sparkles, Stethoscope, Target
} from 'lucide-react';
import {
  fadeInLeft, fadeInRight, heartbeat
} from '@/lib/animations';

export default function BrandStorySection() {
  const locale = useLocale();

  const values = [
    {
      icon: Heart,
      titleAr: 'شغف طبي',
      titleEn: 'Medical Passion',
      descAr: 'شغفنا بالطب يدفعنا لتقديم أفضل المنتجات',
      descEn: 'Our passion for medicine drives us',
      gradient: 'from-red-400 to-pink-600'
    },
    {
      icon: Award,
      titleAr: 'جودة عالية',
      titleEn: 'Premium Quality',
      descAr: 'نختار كل منتج بعناية فائقة',
      descEn: 'We select every product with care',
      gradient: 'from-yellow-400 to-orange-600'
    },
    {
      icon: Users,
      titleAr: 'مجتمع طلابي',
      titleEn: 'Student Community',
      descAr: 'نبني مجتمع داعم لطلاب الطب في مصر',
      descEn: 'Building a supportive community',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      icon: Target,
      titleAr: 'أسعار مناسبة',
      titleEn: 'Fair Prices',
      descAr: 'أسعار تناسب ميزانية طلاب الطب',
      descEn: 'Prices that fit student budget',
      gradient: 'from-teal-400 to-teal-600'
    }
  ];

  return (
    <section
      className="py-20 px-4 relative overflow-hidden"
      style={{ background: 'var(--color-bg-surface)' }}
    >
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInLeft}
          >
            <motion.div
              animate={heartbeat}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6"
              style={{
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: 'var(--color-secondary-500)'
              }}
            >
              <Sparkles size={14} />
              {locale === 'ar' ? 'قصتنا' : 'Our Story'}
            </motion.div>

            <h2
              className="text-3xl md:text-5xl font-black mb-6 leading-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {locale === 'ar' ? (
                <>
                  وُلدنا من قلب{' '}
                  <span style={{ color: 'var(--color-secondary-500)' }}>
                    الطب
                  </span>{' '}
                  لخدمة طلاب الطب
                </>
              ) : (
                <>
                  Born from the heart of{' '}
                  <span style={{ color: 'var(--color-secondary-500)' }}>
                    medicine
                  </span>{' '}
                  to serve medical students
                </>
              )}
            </h2>

            <p
              className="text-lg leading-relaxed mb-6"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {locale === 'ar'
                ? 'بدأت Sovereign من فكرة بسيطة: توفير منتجات طبية عالية الجودة بأسعار تناسب طلاب الطب في مصر. نعرف تماماً احتياجاتكم لأننا كنا في مكانكم.'
                : 'Sovereign started with a simple idea: providing high-quality medical products at prices suitable for medical students in Egypt.'}
            </p>

            <p
              className="leading-relaxed mb-8"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {locale === 'ar'
                ? 'اليوم، نفتخر بخدمة آلاف الطلاب والأطباء في جميع أنحاء مصر، ونواصل التزامنا بتقديم أفضل تجربة تسوق طبية.'
                : 'Today, we proudly serve thousands of students and doctors across Egypt.'}
            </p>

            {/* Values grid */}
            <div className="grid grid-cols-2 gap-4">
              {values.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}
                  >
                    <v.icon size={18} className="text-white" />
                  </div>
                  <div>
                    <p
                      className="font-bold text-sm"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {locale === 'ar' ? v.titleAr : v.titleEn}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {locale === 'ar' ? v.descAr : v.descEn}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInRight}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Rotating rings */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '4px solid rgba(212, 175, 55, 0.3)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              >
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full shadow-lg"
                  style={{ background: 'var(--color-secondary-500)' }}
                />
              </motion.div>

              <motion.div
                className="absolute inset-8 rounded-full"
                style={{ border: '4px dashed rgba(212, 175, 55, 0.2)' }}
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              />

              {/* Center icon */}
              <motion.div
                className="absolute inset-20 rounded-full backdrop-blur-md flex items-center justify-center shadow-2xl glow-pulse"
                style={{
                  background: 'linear-gradient(to bottom right, rgba(212, 175, 55, 0.2), rgba(30, 58, 95, 0.4))',
                  border: '2px solid rgba(212, 175, 55, 0.5)'
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Stethoscope
                    size={100}
                    style={{ color: 'var(--color-secondary-400)' }}
                    strokeWidth={1.5}
                  />
                </motion.div>
              </motion.div>

              {/* Floating badges */}
              {[
                {
                  icon: Heart,
                  text: '5000+',
                  gradient: 'from-red-400 to-pink-600',
                  pos: 'top-0 right-1/3'
                },
                {
                  icon: Award,
                  text: '4.9★',
                  gradient: 'from-yellow-400 to-orange-600',
                  pos: 'bottom-4 right-0'
                },
                {
                  icon: Users,
                  text: '24/7',
                  gradient: 'from-blue-400 to-blue-600',
                  pos: 'bottom-4 left-0'
                }
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  className={`absolute ${badge.pos} rounded-2xl shadow-xl p-3 flex items-center gap-2`}
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid rgba(212, 175, 55, 0.2)'
                  }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                >
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${badge.gradient} flex items-center justify-center`}
                  >
                    <badge.icon size={16} className="text-white" />
                  </div>
                  <span
                    className="font-black text-sm"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {badge.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}