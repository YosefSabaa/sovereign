'use client';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Instagram, Mail, Phone, MapPin, Heart, Music2,
  MessageCircle, Send
} from 'lucide-react';
import Link from 'next/link';

const SOCIAL_LINKS = {
  whatsapp: 'https://wa.me/201277776457',
  phone: 'tel:+201277776457',
  instagram: 'https://www.instagram.com/sovereign._.1',
  tiktok: 'https://www.tiktok.com/@sovereign7111',
  email: 'info@sovereign.com'
};

export default function Footer() {
  const t = useTranslations('footer');
  const tn = useTranslations('nav');
  const locale = useLocale();

  const socials = [
    {
      id: 'instagram',
      icon: Instagram,
      label: locale === 'ar' ? 'إنستجرام' : 'Instagram',
      link: SOCIAL_LINKS.instagram,
      color: '#e1306c'
    },
    {
      id: 'tiktok',
      icon: Music2,
      label: locale === 'ar' ? 'تيك توك' : 'TikTok',
      link: SOCIAL_LINKS.tiktok,
      color: '#d4af37'
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      label: locale === 'ar' ? 'واتساب' : 'WhatsApp',
      link: SOCIAL_LINKS.whatsapp,
      color: '#22c55e'
    },
    {
      id: 'phone',
      icon: Phone,
      label: locale === 'ar' ? 'اتصل بنا' : 'Call',
      link: SOCIAL_LINKS.phone,
      color: '#3b82f6'
    }
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden"
      style={{ background: 'var(--color-primary-900)' }}
    >
      <svg
        className="absolute top-0 left-0 w-full h-12 opacity-20"
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
      >
        <path
          d="M0 30 L200 30 L220 30 L230 10 L240 50 L250 30 L270 30 L280 20 L290 40 L300 30 L500 30 L520 30 L530 10 L540 50 L550 30 L570 30 L580 20 L590 40 L600 30 L1200 30"
          fill="none"
          stroke="#d4af37"
          strokeWidth="2"
        />
      </svg>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 relative">
        {/* Logo + About */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="sm:col-span-2"
        >
          <div className="flex items-center gap-3 mb-5">
            <motion.img
              src="/logo.png"
              alt="Sovereign"
              className="h-12 md:h-16 w-auto object-contain"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              style={{
                filter:
                  'brightness(0) invert(1) drop-shadow(0 0 15px rgba(212, 175, 55, 0.3))'
              }}
            />
            <div className="flex flex-col">
              <h3
                className="font-black text-lg md:text-xl leading-none"
                style={{
                  color: '#f8fafc',
                  letterSpacing: '0.2em'
                }}
              >
                SOVEREIGN
              </h3>
              <p
                className="text-[9px] md:text-[10px] leading-none mt-1 font-semibold"
                style={{
                  color: 'var(--color-secondary-500)',
                  letterSpacing: '0.3em'
                }}
              >
                MEDICAL SCRUBS
              </p>
            </div>
          </div>

          <p
            className="leading-relaxed max-w-md text-sm md:text-base mb-6"
            style={{ color: '#cbd5e1' }}
          >
            {t('aboutText')}
          </p>

          {/* Social Icons */}
          <div className="flex flex-wrap gap-2.5 md:gap-3">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.id}
                  href={social.link}
                  target={social.id === 'phone' ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  title={social.label}
                  className="w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    background: 'var(--color-primary-700)',
                    border: `1px solid ${social.color}40`,
                    color: social.color
                  }}
                >
                  <Icon className="w-5 h-5 md:w-5 md:h-5" />
                </motion.a>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <h4
            className="font-bold mb-4 md:mb-5 text-base md:text-lg"
            style={{ color: 'var(--color-secondary-500)' }}
          >
            {t('links')}
          </h4>
          <ul className="space-y-2.5 md:space-y-3" style={{ color: '#cbd5e1' }}>
            {[
              { href: `/${locale}`, label: tn('home') },
              { href: `/${locale}/products`, label: tn('products') },
              { href: `/${locale}/orders`, label: tn('orders') },
              {
                href: `/${locale}/contact`,
                label: locale === 'ar' ? 'تواصل معنا' : 'Contact Us'
              }
            ].map((l, i) => (
              <li key={i}>
                <Link
                  href={l.href}
                  className="inline-flex items-center gap-2 group transition-colors hover:opacity-80 text-sm md:text-base"
                >
                  <span
                    className="w-0 group-hover:w-3 h-0.5 transition-all duration-300"
                    style={{ background: 'var(--color-secondary-500)' }}
                  />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h4
            className="font-bold mb-4 md:mb-5 text-base md:text-lg"
            style={{ color: 'var(--color-secondary-500)' }}
          >
            {t('contact')}
          </h4>
          <div className="space-y-3 md:space-y-4 text-xs md:text-sm" style={{ color: '#cbd5e1' }}>
            {/* Phone */}
            <a
              href={SOCIAL_LINKS.phone}
              className="flex items-center gap-3 transition-colors hover:opacity-80"
            >
              <Phone
                size={16}
                className="flex-shrink-0"
                style={{ color: 'var(--color-secondary-500)' }}
              />
              <span dir="ltr">+20 100 779 0689</span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${SOCIAL_LINKS.email}`}
              className="flex items-center gap-3 transition-colors hover:opacity-80 min-w-0"
            >
              <Mail
                size={16}
                className="flex-shrink-0"
                style={{ color: 'var(--color-secondary-500)' }}
              />
              <span className="break-all">{SOCIAL_LINKS.email}</span>
            </a>

            {/* Location */}
            <div className="flex items-center gap-3">
              <MapPin
                size={16}
                className="flex-shrink-0"
                style={{ color: 'var(--color-secondary-500)' }}
              />
              <span>{locale === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'}</span>
            </div>

            {/* Instagram */}
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 transition-colors hover:opacity-80"
            >
              <Instagram
                size={16}
                className="flex-shrink-0"
                style={{ color: 'var(--color-secondary-500)' }}
              />
              <span dir="ltr">@sovereign.medical</span>
            </a>

            {/* TikTok */}
            <a
              href={SOCIAL_LINKS.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 transition-colors hover:opacity-80"
            >
              <Music2
                size={16}
                className="flex-shrink-0"
                style={{ color: 'var(--color-secondary-500)' }}
              />
              <span dir="ltr">@sovereign.medical</span>
            </a>
          </div>

          {/* Contact Button */}
          <Link
            href={`/${locale}/contact`}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs md:text-sm transition-all hover:scale-105"
            style={{
              background: `linear-gradient(to right, var(--color-secondary-500), var(--color-secondary-600))`,
              color: '#0a1828'
            }}
          >
            <Send size={14} />
            {locale === 'ar' ? 'صفحة التواصل' : 'Contact Page'}
          </Link>
        </motion.div>
      </div>

      <div
        className="py-4 md:py-5 text-center text-xs md:text-sm relative"
        style={{
          borderTop: '1px solid rgba(212, 175, 55, 0.15)',
          color: '#94a3b8'
        }}
      >
        © {new Date().getFullYear()} Sovereign. {t('rights')}.
        <span className="mx-2">·</span>
        Made with{' '}
        <Heart
          size={12}
          className="inline fill-current"
          style={{ color: '#ef4444' }}
        />{' '}
        in Egypt
      </div>
    </motion.footer>
  );
}