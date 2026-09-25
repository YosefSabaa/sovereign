'use client';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Star, Quote, Heart } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

const TESTIMONIALS = [
  {
    nameAr: 'د. أحمد محمود',
    nameEn: 'Dr. Ahmed Mahmoud',
    roleAr: 'طالب بكلية الطب - القاهرة',
    roleEn: 'Medical Student - Cairo',
    commentAr: 'جودة السكرابات ممتازة والألوان بتدوم حتى بعد الغسيل المتكرر. أنصح كل زمايلي.',
    commentEn: 'Amazing quality scrubs, colors last through multiple washes. Highly recommend to all my colleagues.',
    rating: 5,
    initial: 'A',
    gradient: 'from-teal-400 to-teal-600'
  },
  {
    nameAr: 'د. سارة علي',
    nameEn: 'Dr. Sara Ali',
    roleAr: 'طبيبة امتياز - عين شمس',
    roleEn: 'Intern Doctor - Ain Shams',
    commentAr: 'الشحن كان سريع جداً والخدمة احترافية. سماعة الطبية اللي اشتريتها من هنا هي الأفضل.',
    commentEn: 'Super fast shipping and professional service. The stethoscope I bought is the best I have used.',
    rating: 5,
    initial: 'S',
    gradient: 'from-blue-400 to-blue-600'
  },
  {
    nameAr: 'د. محمد حسن',
    nameEn: 'Dr. Mohamed Hassan',
    roleAr: 'طالب بكلية الطب - الإسكندرية',
    roleEn: 'Medical Student - Alexandria',
    commentAr: 'الأسعار مناسبة جداً لطلاب الطب والجودة عالية. Sovereign بقى خياري الأول.',
    commentEn: 'Prices are very suitable for medical students and quality is top-notch. Sovereign is my first choice.',
    rating: 5,
    initial: 'M',
    gradient: 'from-purple-400 to-purple-600'
  }
];

export default function TestimonialsSection() {
  const locale = useLocale();

  return (
    <section
      className="py-20 px-4 relative overflow-hidden"
      style={{ background: 'var(--color-bg-base)' }}
    >
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="h-1 w-12 rounded-full"
              style={{
                background: 'linear-gradient(to right, transparent, var(--color-secondary-500))'
              }}
            />
            <Star
              size={20}
              className="fill-current"
              style={{ color: 'var(--color-secondary-500)' }}
            />
            <div
              className="h-1 w-12 rounded-full"
              style={{
                background: 'linear-gradient(to left, transparent, var(--color-secondary-500))'
              }}
            />
          </div>

          <h2
            className="text-3xl md:text-5xl font-black mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {locale === 'ar' ? 'ماذا يقول طلاب الطب؟' : 'What Students Say'}
          </h2>

          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {locale === 'ar'
              ? 'آراء حقيقية من طلاب وطبيبات يستخدمون منتجاتنا يومياً'
              : 'Real reviews from students using our products daily'}
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              whileHover={{ y: -8 }}
              className="relative rounded-3xl p-6 shadow-lg transition-shadow overflow-hidden group"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid rgba(212, 175, 55, 0.15)'
              }}
            >
              {/* Quote icon */}
              <div
                className="absolute -top-4 -right-4 w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ background: 'rgba(212, 175, 55, 0.1)' }}
              >
                <Quote size={28} style={{ color: 'rgba(212, 175, 55, 0.4)' }} />
              </div>

              {/* Rating */}
              <div className="flex gap-0.5 mb-4 relative z-10">
                {[...Array(t.rating)].map((_, j) => (
                  <Star
                    key={j}
                    size={16}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Comment */}
              <p
                className="leading-relaxed mb-6 relative z-10 min-h-[80px]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                "{locale === 'ar' ? t.commentAr : t.commentEn}"
              </p>

              {/* Author */}
              <div
                className="flex items-center gap-3 pt-4 relative z-10"
                style={{ borderTop: '1px solid rgba(212, 175, 55, 0.15)' }}
              >
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-black text-lg shadow-lg`}
                >
                  {t.initial}
                </div>
                <div className="flex-1">
                  <p
                    className="font-bold text-sm"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {locale === 'ar' ? t.nameAr : t.nameEn}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {locale === 'ar' ? t.roleAr : t.roleEn}
                  </p>
                </div>
                <Heart size={16} className="text-red-400 fill-red-400" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}