'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { HelpCircle, Plus, Minus } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

const FAQS = [
  {
    qAr: 'كم تستغرق مدة الشحن؟',
    aAr: 'التوصيل داخل الدقهلية ودمياط خلال 24-48 ساعة. المحافظات الأخرى خلال 2-4 أيام عمل.',
    qEn: 'How long does shipping take?',
    aEn: 'Delivery within Dakahlia and Damietta takes 24-48 hours. Other governorates take 2-4 business days.'
  },
  {
    qAr: 'ما هي طرق الدفع المتاحة؟',
    aAr: 'الدفع عبر فودافون كاش فقط حالياً. قم بالتحويل ثم ارفع صورة الإيصال وسيتم تأكيد الطلب خلال ساعات.',
    qEn: 'What payment methods do you accept?',
    aEn: 'Only Vodafone Cash for now. Transfer the amount, upload the receipt, and we will confirm your order within hours.'
  },
  {
    qAr: 'هل يمكنني إرجاع المنتج؟',
    aAr: 'نعم، يمكنك الإرجاع خلال 14 يوم من الاستلام بشرط أن يكون المنتج في حالته الأصلية.',
    qEn: 'Can I return a product?',
    aEn: 'Yes, you can return within 14 days of receiving, provided the product is in its original condition.'
  },
  {
    qAr: 'هل المنتجات طبية معتمدة؟',
    aAr: 'جميع منتجاتنا مطابقة للمعايير الطبية ومعتمدة من الجهات المختصة.',
    qEn: 'Are the products medically certified?',
    aEn: 'All our products comply with medical standards and are certified by the relevant authorities.'
  },
  {
    qAr: 'هل يوجد خصومات للطلاب؟',
    aAr: 'نعم، يوجد خصم دائم 10% لطلاب الطب بكود SOVEREIGN10. تواصل معنا على واتساب لخصومات إضافية للطلبات الكبيرة.',
    qEn: 'Do you offer student discounts?',
    aEn: 'Yes, a permanent 10% discount for medical students with code SOVEREIGN10. Contact us on WhatsApp for bulk discounts.'
  }
];

export default function FAQSection() {
  const locale = useLocale();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20 px-4 bg-white relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-purple-500 rounded-full" />
            <HelpCircle className="text-purple-500" size={20} />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-purple-500 rounded-full" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-navy-700 mb-3">
            {locale === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-gray-600 text-lg">
            {locale === 'ar'
              ? 'إجابات على أكثر الأسئلة تكراراً'
              : 'Answers to the most common questions'}
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="space-y-3"
        >
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                variants={staggerItem}
                className={`bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                  isOpen ? 'border-teal-400 shadow-lg' : 'border-gray-100'
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full p-5 flex items-center justify-between gap-4 text-start hover:bg-white/50 transition-colors"
                >
                  <span className="font-bold text-navy-700 text-start flex-1">
                    {locale === 'ar' ? faq.qAr : faq.qEn}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isOpen ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                        {locale === 'ar' ? faq.aAr : faq.aEn}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}