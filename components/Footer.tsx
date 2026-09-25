'use client';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Mail, Phone, MapPin, Heart } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const t = useTranslations('footer');
  const tn = useTranslations('nav');
  const locale = useLocale();

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

      <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-4 gap-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="md:col-span-2"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <motion.img
              src="/logo.png"
              alt="Sovereign"
              className="h-16 w-auto object-contain"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              style={{
                filter:
                  'brightness(0) invert(1) drop-shadow(0 0 15px rgba(212, 175, 55, 0.3))'
              }}
            />
            <div className="flex flex-col">
              <h3
                className="font-black text-xl leading-none"
                style={{
                  color: '#f8fafc',
                  letterSpacing: '0.2em'
                }}
              >
                SOVEREIGN
              </h3>
              <p
                className="text-[10px] leading-none mt-1 font-semibold"
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
            className="leading-relaxed max-w-md"
            style={{ color: '#cbd5e1' }}
          >
            {t('aboutText')}
          </p>

          <div className="flex gap-3 mt-6">
            {[Facebook, Instagram].map((Icon, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full transition-colors"
                style={{
                  background: 'var(--color-primary-700)',
                  color: '#f8fafc'
                }}
              >
                <Icon size={18} />
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <h4
            className="font-bold mb-5 text-lg"
            style={{ color: 'var(--color-secondary-500)' }}
          >
            {t('links')}
          </h4>
          <ul className="space-y-3" style={{ color: '#cbd5e1' }}>
            {[
              { href: `/${locale}`, label: tn('home') },
              { href: `/${locale}/products`, label: tn('products') },
              { href: `/${locale}/orders`, label: tn('orders') }
            ].map((l, i) => (
              <li key={i}>
                <Link
                  href={l.href}
                  className="inline-flex items-center gap-2 group transition-colors hover:opacity-80"
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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h4
            className="font-bold mb-5 text-lg"
            style={{ color: 'var(--color-secondary-500)' }}
          >
            {t('contact')}
          </h4>
          <div className="space-y-4 text-sm" style={{ color: '#cbd5e1' }}>
            <p className="flex items-center gap-3">
              <Phone
                size={16}
                style={{ color: 'var(--color-secondary-500)' }}
              />
              <span dir="ltr">+20 101 234 5678</span>
            </p>
            <p className="flex items-center gap-3">
              <Mail
                size={16}
                style={{ color: 'var(--color-secondary-500)' }}
              />
              <span>info@sovereign.com</span>
            </p>
            <p className="flex items-center gap-3">
              <MapPin
                size={16}
                style={{ color: 'var(--color-secondary-500)' }}
              />
              Cairo, Egypt
            </p>
          </div>
        </motion.div>
      </div>

      <div
        className="py-5 text-center text-sm relative"
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