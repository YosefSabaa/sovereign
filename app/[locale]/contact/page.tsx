'use client';
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import {
  Phone, Instagram, Music2, Mail, MapPin, Clock, MessageCircle,
  ArrowLeft, ArrowRight, Heart, Stethoscope, Users, Award,
  Truck, ShieldCheck, Send
} from 'lucide-react';
import {
  fadeInUp, staggerContainer, staggerItem, heartbeat
} from '@/lib/animations';

const CONTACT_LINKS = {
  whatsapp: 'https://wa.me/201277776457',
  phone: 'tel:+201277776457',
  instagram: 'https://www.instagram.com/sovereign._.1',
  tiktok: 'https://www.tiktok.com/@sovereign7111',
  email: 'info@sovereign.com'
};

export default function ContactPage() {
  const locale = useLocale();
  const t = useTranslations();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  const contactCards = [
    {
      id: 'phone',
      icon: Phone,
      titleAr: 'اتصل بنا',
      titleEn: 'Call Us',
      value: '+20 100 779 0689',
      valueDir: 'ltr' as const,
      link: CONTACT_LINKS.phone,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
      descAr: 'متاحون يومياً من 10 صباحاً حتى 10 مساءً',
      descEn: 'Available daily from 10 AM to 10 PM'
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      titleAr: 'واتساب',
      titleEn: 'WhatsApp',
      value: '+20 100 779 0689',
      valueDir: 'ltr' as const,
      link: CONTACT_LINKS.whatsapp,
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(34, 197, 94, 0.3)',
      descAr: 'رد فوري خلال دقائق',
      descEn: 'Instant reply within minutes'
    },
    {
      id: 'instagram',
      icon: Instagram,
      titleAr: 'إنستجرام',
      titleEn: 'Instagram',
      value: '@sovereign.medical',
      valueDir: 'ltr' as const,
      link: CONTACT_LINKS.instagram,
      color: '#e1306c',
      bg: 'rgba(225, 48, 108, 0.1)',
      border: 'rgba(225, 48, 108, 0.3)',
      descAr: 'تابع أحدث المنتجات والعروض',
      descEn: 'Follow our latest products'
    },
    {
      id: 'tiktok',
      icon: Music2,
      titleAr: 'تيك توك',
      titleEn: 'TikTok',
      value: '@sovereign.medical',
      valueDir: 'ltr' as const,
      link: CONTACT_LINKS.tiktok,
      color: '#000000',
      bg: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(212, 175, 55, 0.3)',
      descAr: 'شاهد فيديوهات المنتجات والمراجعات',
      descEn: 'Watch product videos and reviews'
    }
  ];

  const storeFeatures = [
    {
      icon: Stethoscope,
      titleAr: 'منتجات طبية معتمدة',
      titleEn: 'Certified Medical Products',
      descAr: 'جميع المنتجات مطابقة للمعايير الطبية',
      descEn: 'All products comply with medical standards',
      gradient: 'from-teal-400 to-teal-600'
    },
    {
      icon: Truck,
      titleAr: 'شحن سريع',
      titleEn: 'Fast Shipping',
      descAr: 'توصيل لجميع محافظات مصر',
      descEn: 'Delivery all over Egypt',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      icon: ShieldCheck,
      titleAr: 'دفع آمن',
      titleEn: 'Secure Payment',
      descAr: 'محفظة الكترونية • إنستاباي • عند الاستلام',
      descEn: 'Vodafone Cash • InstaPay • COD',
      gradient: 'from-purple-400 to-purple-600'
    },
    {
      icon: Award,
      titleAr: 'جودة مضمونة',
      titleEn: 'Guaranteed Quality',
      descAr: 'ضمان استبدال خلال 14 يوم',
      descEn: '14-day return guarantee',
      gradient: 'from-yellow-400 to-orange-600'
    }
  ];

  return (
    <PageTransition>
      <div
        className="min-h-screen relative overflow-hidden"
        style={{ background: 'var(--color-bg-base)' }}
      >
        {/* Decorative orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ background: 'var(--color-secondary-500)' }}
          />
          <div
            className="absolute bottom-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ background: 'var(--color-primary-500)' }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 relative">
          {/* Back link */}
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 mb-6 md:mb-8 font-semibold transition-colors group text-sm md:text-base"
            style={{ color: 'var(--color-secondary-500)' }}
          >
            <Arrow
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            {locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>

          {/* Hero Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center mb-12 md:mb-16"
          >
            <motion.div
              variants={staggerItem}
              className="flex justify-center mb-6"
            >
              <motion.div
                animate={heartbeat}
                className="w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center shadow-2xl"
                style={{
                  background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600))`
                }}
              >
                <MessageCircle
                  size={40}
                  className="md:w-12 md:h-12"
                  style={{ color: '#0a1828' }}
                />
              </motion.div>
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className="text-3xl sm:text-4xl md:text-6xl font-black mb-3 md:mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {locale === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </motion.h1>

            <motion.p
              variants={staggerItem}
              className="text-base md:text-xl max-w-2xl mx-auto px-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {locale === 'ar'
                ? 'فريقنا جاهز لمساعدتك في أي وقت. تواصل معنا عبر القنوات التالية'
                : 'Our team is ready to help you anytime. Reach out via:'}
            </motion.p>
          </motion.div>

          {/* Contact Cards Grid */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-16 md:mb-20"
          >
            {contactCards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.a
                  key={card.id}
                  href={card.link}
                  target={card.id === 'phone' ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  variants={staggerItem}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative rounded-3xl p-6 transition-all duration-300 overflow-hidden flex flex-col items-center text-center"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: `2px solid ${card.border}`,
                    boxShadow: `0 4px 20px rgba(0, 0, 0, 0.2)`
                  }}
                >
                  {/* Glow effect on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${card.color}30 0%, transparent 70%)`
                    }}
                  />

                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                    style={{
                      background: card.bg,
                      border: `2px solid ${card.border}`,
                      color: card.color
                    }}
                  >
                    <Icon size={28} className="md:w-9 md:h-9" />
                  </motion.div>

                  {/* Title */}
                  <h3
                    className="font-black text-lg md:text-xl mb-2 relative z-10"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {locale === 'ar' ? card.titleAr : card.titleEn}
                  </h3>

                  {/* Value */}
                  <p
                    className="font-bold text-sm md:text-base mb-2 break-all relative z-10"
                    style={{ color: card.color }}
                    dir={card.valueDir}
                  >
                    {card.value}
                  </p>

                  {/* Description */}
                  <p
                    className="text-xs md:text-sm relative z-10 leading-relaxed"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {locale === 'ar' ? card.descAr : card.descEn}
                  </p>
                </motion.a>
              );
            })}
          </motion.div>

          {/* Store Details Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-6 md:p-10 mb-12 md:mb-16"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}
          >
            {/* Section title */}
            <div className="text-center mb-8 md:mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div
                  className="h-1 w-12 rounded-full"
                  style={{
                    background:
                      'linear-gradient(to right, transparent, var(--color-secondary-500))'
                  }}
                />
                <Heart
                  size={24}
                  className="fill-current"
                  style={{ color: 'var(--color-secondary-500)' }}
                />
                <div
                  className="h-1 w-12 rounded-full"
                  style={{
                    background:
                      'linear-gradient(to left, transparent, var(--color-secondary-500))'
                  }}
                />
              </div>

              <h2
                className="text-2xl md:text-4xl font-black mb-3"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {locale === 'ar' ? 'عن Sovereign' : 'About Sovereign'}
              </h2>

              <p
                className="text-sm md:text-lg max-w-3xl mx-auto leading-relaxed px-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {locale === 'ar'
                  ? 'Sovereign هو متجرك الأول للأدوات الطبية والسكرابات عالية الجودة في مصر. بدأنا من فكرة بسيطة: توفير منتجات طبية احترافية بأسعار تناسب طلاب الطب والأطباء، مع خدمة عملاء استثنائية وشحن سريع لجميع المحافظات.'
                  : 'Sovereign is your #1 store for premium medical gear and scrubs in Egypt. We started with a simple idea: providing professional medical products at prices that fit students and doctors, with exceptional service and fast delivery.'}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
              {storeFeatures.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div
                      className={`w-12 h-12 md:w-16 md:h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 shadow-lg`}
                    >
                      <Icon className="text-white w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <h4
                      className="font-bold text-sm md:text-base mb-1"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {locale === 'ar' ? feature.titleAr : feature.titleEn}
                    </h4>
                    <p
                      className="text-[10px] md:text-xs leading-snug"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {locale === 'ar' ? feature.descAr : feature.descEn}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Store Info */}
            <div
              className="rounded-2xl p-4 md:p-6"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid rgba(212, 175, 55, 0.15)'
              }}
            >
              <div className="grid sm:grid-cols-3 gap-4 md:gap-6">
                {/* Location */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'rgba(212, 175, 55, 0.15)',
                      color: 'var(--color-secondary-500)'
                    }}
                  >
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p
                      className="font-bold text-sm mb-0.5"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {locale === 'ar' ? 'الموقع' : 'Location'}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {locale === 'ar' ? 'الدقهلية، مصر' : 'Dakahlia, Egypt'}
                    </p>
                  </div>
                </div>

                {/* Working hours */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'rgba(212, 175, 55, 0.15)',
                      color: 'var(--color-secondary-500)'
                    }}
                  >
                    <Clock size={18} />
                  </div>
                  <div>
                    <p
                      className="font-bold text-sm mb-0.5"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {locale === 'ar' ? 'ساعات العمل' : 'Working Hours'}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {locale === 'ar'
                        ? 'يومياً: 10 ص - 10 م'
                        : 'Daily: 10 AM - 10 PM'}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'rgba(212, 175, 55, 0.15)',
                      color: 'var(--color-secondary-500)'
                    }}
                  >
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="font-bold text-sm mb-0.5"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {locale === 'ar' ? 'البريد' : 'Email'}
                    </p>
                    <a
                      href={`mailto:${CONTACT_LINKS.email}`}
                      className="text-xs break-all hover:underline"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {CONTACT_LINKS.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-6 md:p-10 text-center relative overflow-hidden"
            style={{
              background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600), var(--color-primary-700))`
            }}
          >
            <div className="absolute inset-0 grid-bg opacity-20" />

            <div className="relative z-10">
              <motion.div
                animate={heartbeat}
                className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <Send className="text-white w-8 h-8 md:w-10 md:h-10" />
              </motion.div>

              <h2 className="text-2xl md:text-4xl font-black text-white mb-3 md:mb-4">
                {locale === 'ar'
                  ? 'عايز تطلب أو تستفسر؟'
                  : 'Want to order or ask?'}
              </h2>

              <p className="text-white/90 text-sm md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
                {locale === 'ar'
                  ? 'تواصل معنا على واتساب الآن وسنرد عليك في دقائق'
                  : 'Contact us on WhatsApp now and we will reply in minutes'}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center px-2">
                <motion.a
                  href={CONTACT_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-sm md:text-base transition-all shadow-xl inline-flex items-center justify-center gap-2"
                  style={{
                    background: '#ffffff',
                    color: '#22c55e'
                  }}
                >
                  <MessageCircle size={18} />
                  {locale === 'ar' ? 'واتساب' : 'WhatsApp'}
                </motion.a>

                <motion.a
                  href={CONTACT_LINKS.phone}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-sm md:text-base transition-all inline-flex items-center justify-center gap-2 text-white"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.4)'
                  }}
                >
                  <Phone size={18} />
                  {locale === 'ar' ? 'اتصل بنا' : 'Call Us'}
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}