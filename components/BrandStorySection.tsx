'use client';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Heart, Award, Users, Sparkles, Stethoscope, Target } from 'lucide-react';
import { fadeInLeft, fadeInRight, staggerContainer, staggerItem, heartbeat } from '@/lib/animations';

export default function BrandStorySection() {
  const locale = useLocale();

  const values = [
    {
      icon: Heart,
      titleAr: 'شغف طبي',
      titleEn: 'Medical Passion',
      descAr: 'شغفنا بالطب يدفعنا لتقديم أفضل المنتجات',
      descEn: 'Our passion for medicine drives us to deliver the best',
      color: 'from-red-400 to-pink-600'
    },
    {
      icon: Award,
      titleAr: 'جودة عالية',
      titleEn: 'Premium Quality',
      descAr: 'نختار كل منتج بعناية فائقة',
      descEn: 'We select every product with extreme care',
      color: 'from-yellow-400 to-orange-600'
    },
    {
      icon: Users,
      titleAr: 'مجتمع طلابي',
      titleEn: 'Student Community',
      descAr: 'نبني مجتمع داعم لطلاب الطب في مصر',
      descEn: 'Building a supportive community for medical students',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: Target,
      titleAr: 'أسعار مناسبة',
      titleEn: 'Fair Prices',
      descAr: 'أسعار تناسب ميزانية طلاب الطب',
      descEn: 'Prices that fit medical students budget',
      color: 'from-teal-400 to-teal-600'
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInLeft}
          >
            <motion.div
              animate={heartbeat}
              className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 px-4 py-2 rounded-full text-sm font-bold mb-6"
            >
              <Sparkles size={14} />
              {locale === 'ar' ? 'قصتنا' : 'Our Story'}
            </motion.div>

            <h2 className="text-3xl md:text-5xl font-black text-navy-700 mb-6 leading-tight">
              {locale === 'ar' ? (
                <>
                  وُلدنا من قلب <span className="text-teal-500">الطب</span> لخدمة
                  طلاب الطب
                </>
              ) : (
                <>
                  Born from the heart of{' '}
                  <span className="text-teal-500">medicine</span> to serve medical
                  students
                </>
              )}
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              {locale === 'ar'
                ? 'بدأت Sovereign من فكرة بسيطة: توفير منتجات طبية عالية الجودة بأسعار تناسب طلاب الطب في مصر. نعرف تماماً احتياجاتكم لأننا كنا في مكانكم.'
                : 'Sovereign started with a simple idea: providing high-quality medical products at prices suitable for medical students in Egypt. We know your needs because we were in your shoes.'}
            </p>

            <p className="text-gray-600 leading-relaxed mb-8">
              {locale === 'ar'
                ? 'اليوم، نفتخر بخدمة آلاف الطلاب والأطباء في جميع أنحاء مصر، ونواصل التزامنا بتقديم أفضل تجربة تسوق طبية.'
                : 'Today, we proudly serve thousands of students and doctors across Egypt, continuing our commitment to deliver the best medical shopping experience.'}
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
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center flex-shrink-0 shadow-md`}
                  >
                    <v.icon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-navy-700 text-sm">
                      {locale === 'ar' ? v.titleAr : v.titleEn}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
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
            <div className="relative aspect-square">
              {/* Rotating rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-teal-400/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-teal-400 rounded-full shadow-lg shadow-teal-400/50" />
              </motion.div>

              <motion.div
                className="absolute inset-8 rounded-full border-4 border-dashed border-teal-400/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              />

              {/* Center icon */}
              <motion.div
                className="absolute inset-20 rounded-full bg-gradient-to-br from-teal-400/30 to-teal-600/30 backdrop-blur-md border-2 border-teal-400/50 flex items-center justify-center shadow-2xl"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Stethoscope size={120} className="text-teal-500" strokeWidth={1.5} />
                </motion.div>
              </motion.div>

              {/* Floating badges */}
              {[
                { icon: Heart, text: locale === 'ar' ? '5000+' : '5000+', color: 'from-red-400 to-pink-600', pos: 'top-0 right-1/3' },
                { icon: Award, text: locale === 'ar' ? '4.9★' : '4.9★', color: 'from-yellow-400 to-orange-600', pos: 'bottom-4 right-0' },
                { icon: Users, text: locale === 'ar' ? '24/7' : '24/7', color: 'from-blue-400 to-blue-600', pos: 'bottom-4 left-0' }
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  className={`absolute ${badge.pos} bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2 border border-gray-100`}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center`}>
                    <badge.icon size={16} className="text-white" />
                  </div>
                  <span className="font-black text-navy-700 text-sm">{badge.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}