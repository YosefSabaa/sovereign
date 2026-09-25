'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { MessageCircle, Sparkles, CheckCircle2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { heartbeat } from '@/lib/animations';

export default function NewsletterSection() {
  const locale = useLocale();
  const [joined, setJoined] = useState(false);

  const whatsappGroupLink =
    process.env.NEXT_PUBLIC_WHATSAPP_GROUP ||
    'https://chat.whatsapp.com/YOUR_GROUP_INVITE_CODE';

  const handleJoin = () => {
    setJoined(true);
    window.open(whatsappGroupLink, '_blank');
    toast.success(
      locale === 'ar'
        ? 'أهلاً بك في جروب Sovereign! 🎉'
        : 'Welcome to Sovereign group! 🎉'
    );
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom right, #10b981, #059669, var(--color-primary-700))`
        }}
      />
      <div className="absolute inset-0 grid-bg opacity-20" />

      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${200 + i * 150}px`,
            height: `${200 + i * 150}px`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}

      <div className="max-w-3xl mx-auto relative z-10 text-center">
        <motion.div
          animate={heartbeat}
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <MessageCircle size={36} className="text-white fill-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-6"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#fff'
          }}
        >
          <Users size={16} />
          {locale === 'ar'
            ? 'انضم لـ 5000+ طالب طب'
            : 'Join 5000+ Medical Students'}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-black text-white mb-4"
        >
          {locale === 'ar'
            ? 'انضم إلى جروب الواتساب الخاص بنا'
            : 'Join Our WhatsApp Group'}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-white/90 text-lg mb-8 max-w-xl mx-auto"
        >
          {locale === 'ar'
            ? 'كن أول من يعرف عن العروض الحصرية والمنتجات الجديدة، وتواصل مباشرة مع فريقنا'
            : 'Be the first to know about exclusive offers and chat with our team'}
        </motion.p>

        {joined ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-white"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <CheckCircle2 size={24} />
            <span className="font-bold text-lg">
              {locale === 'ar'
                ? 'تم فتح الجروب! أهلاً بك 🎉'
                : 'Group opened! Welcome 🎉'}
            </span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto justify-center"
          >
            <motion.button
              onClick={handleJoin}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 shadow-xl"
              style={{ background: '#ffffff', color: '#059669' }}
            >
              <MessageCircle size={20} />
              {locale === 'ar' ? 'انضم الآن' : 'Join Now'}
            </motion.button>

            <motion.a
              href={`https://wa.me/${
                process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201277776457'
              }`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 text-white"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.4)'
              }}
            >
              <Sparkles size={20} />
              {locale === 'ar' ? 'تواصل مباشر' : 'Direct Chat'}
            </motion.a>
          </motion.div>
        )}
      </div>
    </section>
  );
}