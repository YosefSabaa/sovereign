'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAnnouncements,
  saveAnnouncements,
  AnnouncementsSettings,
  Announcement,
  DEFAULT_ANNOUNCEMENTS
} from '@/lib/firestore';
import {
  Plus, Trash2, Save, X, Sparkles, Eye, EyeOff, GripVertical,
  Palette, Clock, MessageSquare, Check, Power, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

const EMOJI_OPTIONS = [
  '🚚', '✨', '🏥', '💳', '🎁', '🔥', '⭐', '💰',
  '🩺', '💊', '🛒', '📦', '⏰', '🎉', '❤️', '👨‍⚕️'
];

export default function AdminAnnouncementsPage() {
  const locale = useLocale();
  const t = useTranslations();

  const [settings, setSettings] = useState<AnnouncementsSettings>(
    DEFAULT_ANNOUNCEMENTS
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  useEffect(() => {
    getAnnouncements()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAnnouncements(settings);
      toast.success(locale === 'ar' ? 'تم الحفظ ✓' : 'Saved ✓');
    } catch {
      toast.error(t('auth.error'));
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    if (
      !confirm(
        locale === 'ar'
          ? 'سيتم استرجاع الرسائل الافتراضية. متأكد؟'
          : 'Reset to default?'
      )
    )
      return;
    setSettings(DEFAULT_ANNOUNCEMENTS);
    toast.success(locale === 'ar' ? 'تم الاسترجاع' : 'Reset');
  };

  const addAnnouncement = () => {
    const newAnn: Announcement = {
      id: `ann_${Date.now()}`,
      textAr: '',
      textEn: '',
      emoji: '✨',
      active: true,
      order: settings.announcements.length
    };
    setEditing(newAnn);
  };

  const saveAnnouncement = () => {
    if (!editing) return;
    if (!editing.textAr.trim() || !editing.textEn.trim()) {
      toast.error(
        locale === 'ar'
          ? 'اكتب النص بالعربي والإنجليزي'
          : 'Fill both texts'
      );
      return;
    }

    setSettings((prev) => {
      const exists = prev.announcements.find((a) => a.id === editing.id);
      if (exists) {
        return {
          ...prev,
          announcements: prev.announcements.map((a) =>
            a.id === editing.id ? editing : a
          )
        };
      }
      return {
        ...prev,
        announcements: [...prev.announcements, editing]
      };
    });
    setEditing(null);
  };

  const removeAnnouncement = (id: string) => {
    if (!confirm(locale === 'ar' ? 'تأكيد الحذف؟' : 'Confirm delete?')) return;
    setSettings((prev) => ({
      ...prev,
      announcements: prev.announcements
        .filter((a) => a.id !== id)
        .map((a, i) => ({ ...a, order: i }))
    }));
  };

  const toggleActive = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      announcements: prev.announcements.map((a) =>
        a.id === id ? { ...a, active: !a.active } : a
      )
    }));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setSettings((prev) => {
      const arr = [...prev.announcements];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return {
        ...prev,
        announcements: arr.map((a, i) => ({ ...a, order: i }))
      };
    });
  };

  const moveDown = (index: number) => {
    setSettings((prev) => {
      if (index >= prev.announcements.length - 1) return prev;
      const arr = [...prev.announcements];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return {
        ...prev,
        announcements: arr.map((a, i) => ({ ...a, order: i }))
      };
    });
  };

  const activeCount = settings.announcements.filter((a) => a.active).length;

  if (loading) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: 'var(--color-bg-card)',
          color: 'var(--color-text-muted)'
        }}
      >
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600))`
            }}
          >
            <Sparkles size={22} style={{ color: '#0a1828' }} />
          </div>
          <div>
            <h2
              className="text-xl font-black"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {locale === 'ar' ? 'الشريط الإعلاني' : 'Announcements Bar'}
            </h2>
            <p
              className="text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {locale === 'ar'
                ? `${activeCount} رسالة نشطة من ${settings.announcements.length}`
                : `${activeCount} active of ${settings.announcements.length}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={resetDefaults}
            className="px-4 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all hover:opacity-80"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            <RotateCcw size={14} />
            {locale === 'ar' ? 'استرجاع' : 'Reset'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary py-2.5 px-6 text-sm"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {locale === 'ar' ? 'حفظ' : 'Save'}
          </button>
        </div>
      </div>

      {/* GENERAL SETTINGS */}
      <div
        className="rounded-2xl p-5 md:p-6 mb-6"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid rgba(212, 175, 55, 0.2)'
        }}
      >
        <h3
          className="font-black mb-4 flex items-center gap-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <Power size={18} style={{ color: 'var(--color-secondary-500)' }} />
          {locale === 'ar' ? 'الإعدادات العامة' : 'General Settings'}
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Enable toggle */}
          <div
            className="rounded-xl p-4 flex items-center justify-between"
            style={{
              background: 'var(--color-bg-elevated)',
              border: `2px solid ${
                settings.enabled
                  ? 'rgba(16, 185, 129, 0.4)'
                  : 'rgba(239, 68, 68, 0.3)'
              }`
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: settings.enabled
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                  color: settings.enabled ? '#10b981' : '#ef4444'
                }}
              >
                {settings.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
              </div>
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {locale === 'ar' ? 'مُفعّل' : 'Enabled'}
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {settings.enabled
                    ? locale === 'ar'
                      ? 'الشريط ظاهر'
                      : 'Visible'
                    : locale === 'ar'
                      ? 'الشريط مخفي'
                      : 'Hidden'}
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))
              }
              className="w-14 h-8 rounded-full relative transition-colors flex-shrink-0"
              style={{
                background: settings.enabled
                  ? '#10b981'
                  : 'rgba(255,255,255,0.15)'
              }}
            >
              <motion.div
                animate={{ x: settings.enabled ? 24 : 2 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
              />
            </button>
          </div>

          {/* Speed */}
          <div
            className="rounded-xl p-4"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: 'var(--color-secondary-500)'
                }}
              >
                <Clock size={18} />
              </div>
              <div className="flex-1">
                <p
                  className="font-bold text-sm"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {locale === 'ar' ? 'سرعة التبديل' : 'Switch Speed'}
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {settings.speed} {locale === 'ar' ? 'ثانية' : 'sec'}
                </p>
              </div>
            </div>
            <input
              type="range"
              min={2}
              max={15}
              value={settings.speed}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  speed: +e.target.value
                }))
              }
              className="w-full"
              style={{ accentColor: 'var(--color-secondary-500)' }}
            />
          </div>

          {/* Background Color */}
          <div
            className="rounded-xl p-4"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: '#8b5cf6'
                }}
              >
                <Palette size={18} />
              </div>
              <div className="flex-1">
                <p
                  className="font-bold text-sm mb-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {locale === 'ar' ? 'لون الخلفية' : 'Background Color'}
                </p>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        backgroundColor: e.target.value
                      }))
                    }
                    className="w-12 h-8 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.backgroundColor}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        backgroundColor: e.target.value
                      }))
                    }
                    className="input py-1 text-xs font-mono flex-1"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Text Color */}
          <div
            className="rounded-xl p-4"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#3b82f6'
                }}
              >
                <Palette size={18} />
              </div>
              <div className="flex-1">
                <p
                  className="font-bold text-sm mb-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {locale === 'ar' ? 'لون النص' : 'Text Color'}
                </p>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.textColor}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        textColor: e.target.value
                      }))
                    }
                    className="w-12 h-8 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.textColor}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        textColor: e.target.value
                      }))
                    }
                    className="input py-1 text-xs font-mono flex-1"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-5">
          <p
            className="text-xs font-bold mb-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {locale === 'ar' ? 'معاينة مباشرة:' : 'Live Preview:'}
          </p>
          <div
            className="rounded-xl py-3 px-4 text-center overflow-hidden"
            style={{
              background: settings.backgroundColor,
              color: settings.textColor
            }}
          >
            <p className="font-bold text-sm">
              {settings.announcements.find((a) => a.active)?.emoji || '✨'}{' '}
              {locale === 'ar'
                ? settings.announcements.find((a) => a.active)?.textAr ||
                  'نص تجريبي'
                : settings.announcements.find((a) => a.active)?.textEn ||
                  'Sample text'}
            </p>
          </div>
        </div>
      </div>

      {/* MESSAGES LIST */}
      <div
        className="rounded-2xl p-5 md:p-6"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid rgba(212, 175, 55, 0.2)'
        }}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3
            className="font-black flex items-center gap-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <MessageSquare
              size={18}
              style={{ color: 'var(--color-secondary-500)' }}
            />
            {locale === 'ar' ? 'الرسائل' : 'Messages'} (
            {settings.announcements.length})
          </h3>

          <button
            onClick={addAnnouncement}
            className="btn-primary py-2 px-4 text-sm"
          >
            <Plus size={16} />
            {locale === 'ar' ? 'إضافة رسالة' : 'Add Message'}
          </button>
        </div>

        {settings.announcements.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-muted)'
            }}
          >
            {locale === 'ar'
              ? 'لا توجد رسائل. اضغط "إضافة رسالة"'
              : 'No messages. Click "Add Message"'}
          </div>
        ) : (
          <div className="space-y-2">
            {settings.announcements.map((ann, index) => (
              <motion.div
                key={ann.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-3 flex items-center gap-3 flex-wrap"
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: `2px solid ${
                    ann.active
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(255, 255, 255, 0.08)'
                  }`,
                  opacity: ann.active ? 1 : 0.5
                }}
              >
                <div
                  className="flex flex-col gap-0.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="hover:opacity-70 disabled:opacity-20 text-xs"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === settings.announcements.length - 1}
                    className="hover:opacity-70 disabled:opacity-20 text-xs"
                  >
                    ▼
                  </button>
                </div>

                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid rgba(212, 175, 55, 0.2)'
                  }}
                >
                  {ann.emoji || '✨'}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="font-bold text-sm truncate"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {ann.textAr}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: 'var(--color-text-muted)' }}
                    dir="ltr"
                  >
                    {ann.textEn}
                  </p>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => toggleActive(ann.id)}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      background: ann.active
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(255, 255, 255, 0.08)',
                      color: ann.active
                        ? '#10b981'
                        : 'var(--color-text-muted)'
                    }}
                  >
                    {ann.active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>

                  <button
                    onClick={() => setEditing(ann)}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#3b82f6'
                    }}
                  >
                    <GripVertical size={14} />
                  </button>

                  <button
                    onClick={() => removeAnnouncement(ann.id)}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {settings.announcements.filter((a) => a.active).length > 0 && (
          <div className="mt-5">
            <p
              className="text-xs font-bold mb-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {locale === 'ar'
                ? 'معاينة كل الرسائل النشطة:'
                : 'Preview active messages:'}
            </p>
            <div className="space-y-2">
              {settings.announcements
                .filter((a) => a.active)
                .map((ann) => (
                  <div
                    key={ann.id}
                    className="rounded-lg py-2 px-4 text-center text-sm font-bold"
                    style={{
                      background: settings.backgroundColor,
                      color: settings.textColor
                    }}
                  >
                    {ann.emoji} {locale === 'ar' ? ann.textAr : ann.textEn}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(10, 24, 40, 0.9)' }}
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex justify-between items-center p-5"
                style={{
                  borderBottom: '1px solid rgba(212, 175, 55, 0.15)'
                }}
              >
                <h3
                  className="font-black text-lg flex items-center gap-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <Sparkles
                    size={20}
                    style={{ color: 'var(--color-secondary-500)' }}
                  />
                  {settings.announcements.find((a) => a.id === editing.id)
                    ? locale === 'ar'
                      ? 'تعديل الرسالة'
                      : 'Edit Message'
                    : locale === 'ar'
                      ? 'إضافة رسالة'
                      : 'Add Message'}
                </h3>
                <button
                  onClick={() => setEditing(null)}
                  className="p-2 rounded-lg"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="label">
                    {locale === 'ar' ? 'النص بالعربي *' : 'Arabic Text *'}
                  </label>
                  <input
                    value={editing.textAr}
                    onChange={(e) =>
                      setEditing({ ...editing, textAr: e.target.value })
                    }
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">
                    {locale === 'ar'
                      ? 'النص بالإنجليزي *'
                      : 'English Text *'}
                  </label>
                  <input
                    value={editing.textEn}
                    onChange={(e) =>
                      setEditing({ ...editing, textEn: e.target.value })
                    }
                    className="input"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="label">
                    {locale === 'ar' ? 'الأيقونة' : 'Emoji'}
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setEditing({ ...editing, emoji })}
                        className="aspect-square rounded-xl flex items-center justify-center text-xl transition-all hover:scale-110"
                        style={{
                          background:
                            editing.emoji === emoji
                              ? 'rgba(212, 175, 55, 0.3)'
                              : 'var(--color-bg-elevated)',
                          border:
                            editing.emoji === emoji
                              ? '2px solid var(--color-secondary-500)'
                              : '2px solid transparent'
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-xl p-4 flex items-center justify-between"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid rgba(212, 175, 55, 0.2)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: editing.active
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(255, 255, 255, 0.08)',
                        color: editing.active
                          ? '#10b981'
                          : 'var(--color-text-muted)'
                      }}
                    >
                      {editing.active ? (
                        <Check size={18} />
                      ) : (
                        <EyeOff size={18} />
                      )}
                    </div>
                    <div>
                      <p
                        className="font-bold text-sm"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {locale === 'ar' ? 'مُفعّلة' : 'Active'}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {editing.active
                          ? locale === 'ar'
                            ? 'ستظهر في الشريط'
                            : 'Will appear'
                          : locale === 'ar'
                            ? 'لن تظهر'
                            : 'Hidden'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({ ...editing, active: !editing.active })
                    }
                    className="w-14 h-8 rounded-full relative transition-colors"
                    style={{
                      background: editing.active
                        ? '#10b981'
                        : 'rgba(255,255,255,0.15)'
                    }}
                  >
                    <motion.div
                      animate={{ x: editing.active ? 24 : 2 }}
                      transition={{ type: 'spring', duration: 0.4 }}
                      className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
                    />
                </button>
                </div>
              </div>

              <div
                className="flex gap-3 p-5"
                style={{
                  borderTop: '1px solid rgba(212, 175, 55, 0.15)'
                }}
              >
                <button
                  onClick={saveAnnouncement}
                  className="btn-primary flex-1"
                >
                  <Save size={18} />
                  {locale === 'ar' ? 'حفظ الرسالة' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="btn-outline flex-1"
                >
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}