'use client';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function WhatsAppButton() {
  const t = useTranslations('whatsapp');
  const [showTip, setShowTip] = useState(false);
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201012345678';
  const msg = encodeURIComponent('مرحباً، أريد الاستفسار عن منتجات Sovereign');
  const url = `https://wa.me/${phone}?text=${msg}`;

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-end gap-3">
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.8 }}
            className="bg-white rounded-2xl shadow-2xl p-4 max-w-xs mb-2 relative"
          >
            <button
              onClick={() => setShowTip(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-navy-700 text-sm">
                  {t('tooltip')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  رد فوري خلال دقائق
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative bg-gradient-to-br from-green-400 to-green-600 text-white p-4 rounded-full shadow-2xl shadow-green-500/50 flex items-center justify-center"
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-green-500"
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <MessageCircle size={28} className="relative z-10" />
      </motion.a>
    </div>
  );
}