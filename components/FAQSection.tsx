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
    aAr: 'الدفع عبر المحافظ الالكترونية - انستاباي - عند الاستلام. قم بالتحويل ثم ارفع صورة الإيصال وسيتم تأكيد الطلب خلال ساعات.',
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
    aEn: 'All our products comply with medical standards and are certified.'
  },
  {
    qAr: 'هل يوجد خصومات للطلاب؟',
    aAr: 'نعم، يوجد خصم دائم 10% لطلاب الطب بكود SOVEREIGN10.',
    qEn: 'Do you offer student discounts?',
    aEn: 'Yes, a permanent 10% discount for medical students with code SOVEREIGN10.'
  }
];

export default function FAQSection() {
  const locale = useLocale();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      className="py-20 px-4 relative overflow-hidden"
      style={{ background: 'var(--color-bg-surface)' }}
    >
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div className="max-w-4xl mx-auto relative">
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
            <HelpCircle
              size={20}
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
            {locale === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
          </h2>

          <p
            className="text-lg"
            style={{ color: 'var(--color-text-secondary)' }}
          >
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
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: 'var(--color-bg-card)',
                  border: isOpen
                    ? '2px solid var(--color-secondary-500)'
                    : '2px solid rgba(212, 175, 55, 0.15)',
                  boxShadow: isOpen
                    ? '0 10px 30px rgba(212, 175, 55, 0.15)'
                    : 'none'
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full p-5 flex items-center justify-between gap-4 text-start transition-colors"
                >
                  <span
                    className="font-bold text-start flex-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {locale === 'ar' ? faq.qAr : faq.qEn}
                  </span>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: isOpen
                        ? 'var(--color-secondary-500)'
                        : 'rgba(212, 175, 55, 0.15)',
                      color: isOpen ? '#0a1828' : 'var(--color-secondary-500)'
                    }}
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
                      <div
                        className="px-5 pb-5 leading-relaxed pt-4"
                        style={{
                          color: 'var(--color-text-secondary)',
                          borderTop: '1px solid rgba(212, 175, 55, 0.15)'
                        }}
                      >
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