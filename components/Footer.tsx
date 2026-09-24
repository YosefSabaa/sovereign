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
      className="relative bg-navy-900 text-white overflow-hidden"
    >
      <svg
        className="absolute top-0 left-0 w-full h-12 opacity-20"
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
      >
        <path
          d="M0 30 L200 30 L220 30 L230 10 L240 50 L250 30 L270 30 L280 20 L290 40 L300 30 L500 30 L520 30 L530 10 L540 50 L550 30 L570 30 L580 20 L590 40 L600 30 L1200 30"
          fill="none"
          stroke="#14b8a6"
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
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg"
            >
              <Heart size={24} className="text-white fill-white" />
            </motion.div>
            <h3 className="font-black text-2xl">Sovereign</h3>
          </div>
          <p className="text-gray-300 leading-relaxed max-w-md">
            {t('aboutText')}
          </p>

          <div className="flex gap-3 mt-6">
            {[Facebook, Instagram].map((Icon, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-navy-700 hover:bg-teal-500 rounded-full transition-colors"
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
          <h4 className="font-bold mb-5 text-teal-400 text-lg">{t('links')}</h4>
          <ul className="space-y-3 text-gray-300">
            {[
              { href: `/${locale}`, label: tn('home') },
              { href: `/${locale}/products`, label: tn('products') },
              { href: `/${locale}/orders`, label: tn('orders') }
            ].map((l, i) => (
              <li key={i}>
                <Link
                  href={l.href}
                  className="hover:text-teal-400 transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-3 h-0.5 bg-teal-400 transition-all duration-300"></span>
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
          <h4 className="font-bold mb-5 text-teal-400 text-lg">{t('contact')}</h4>
          <div className="space-y-4 text-sm text-gray-300">
            <p className="flex items-center gap-3">
              <Phone size={16} className="text-teal-400" />
              <span dir="ltr">+20 101 234 5678</span>
            </p>
            <p className="flex items-center gap-3">
              <Mail size={16} className="text-teal-400" />
              <span>info@sovereign.com</span>
            </p>
            <p className="flex items-center gap-3">
              <MapPin size={16} className="text-teal-400" />
              Cairo, Egypt
            </p>
          </div>
        </motion.div>
      </div>

      <div className="border-t border-navy-700 py-5 text-center text-sm text-gray-400 relative">
        © {new Date().getFullYear()} Sovereign. {t('rights')}.
        <span className="mx-2">·</span>
        Made with <Heart size={12} className="inline fill-red-500 text-red-500" /> in Egypt
      </div>
    </motion.footer>
  );
}