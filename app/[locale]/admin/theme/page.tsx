'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from '@/components/ThemeProvider';
import { THEME_PRESETS, ThemeColors } from '@/lib/theme';
import {
  Palette, Save, RotateCcw, Check, Sparkles, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { staggerContainer, staggerItem } from '@/lib/animations';

const COLOR_FIELDS: Array<{
  key: keyof ThemeColors;
  labelAr: string;
  labelEn: string;
}> = [
  { key: 'primary', labelAr: 'اللون الأساسي (Navy)', labelEn: 'Primary (Navy)' },
  { key: 'primaryDark', labelAr: 'أساسي غامق', labelEn: 'Primary Dark' },
  { key: 'primaryLight', labelAr: 'أساسي فاتح', labelEn: 'Primary Light' },
  { key: 'secondary', labelAr: 'اللون الثانوي (Gold)', labelEn: 'Secondary (Gold)' },
  { key: 'secondaryLight', labelAr: 'ثانوي فاتح', labelEn: 'Secondary Light' },
  { key: 'secondaryDark', labelAr: 'ثانوي غامق', labelEn: 'Secondary Dark' },
  { key: 'background', labelAr: 'الخلفية الرئيسية', labelEn: 'Background' },
  { key: 'backgroundSurface', labelAr: 'خلفية سطحية', labelEn: 'Background Surface' },
  { key: 'backgroundCard', labelAr: 'خلفية البطاقات', labelEn: 'Background Cards' },
  { key: 'textPrimary', labelAr: 'النص الأساسي', labelEn: 'Text Primary' },
  { key: 'textSecondary', labelAr: 'النص الثانوي', labelEn: 'Text Secondary' },
  { key: 'accent', labelAr: 'لون التمييز', labelEn: 'Accent' }
];

export default function AdminThemePage() {
  const locale = useLocale();
  const t = useTranslations();
  const { theme, updateTheme } = useTheme();

  const [draft, setDraft] = useState<ThemeColors>(theme);
  const [saving, setSaving] = useState(false);

  const handleChange = (key: keyof ThemeColors, value: string) => {
    setDraft({ ...draft, [key]: value });
  };

  const handlePreset = (presetKey: keyof typeof THEME_PRESETS) => {
    setDraft(THEME_PRESETS[presetKey].colors);
    toast.success(
      locale === 'ar' ? `تم تطبيق: ${THEME_PRESETS[presetKey].name}` : `Applied: ${THEME_PRESETS[presetKey].name}`
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTheme(draft);
      toast.success(
        locale === 'ar' ? 'تم حفظ الثيم بنجاح ✓' : 'Theme saved ✓'
      );
    } catch {
      toast.error(t('auth.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDraft(theme);
    toast.success(
      locale === 'ar' ? 'تم إرجاع التغييرات' : 'Changes reverted'
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
            <Palette size={24} className="text-navy-900" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-navy-800">
              {locale === 'ar' ? 'تخصيص الألوان' : 'Customize Colors'}
            </h1>
            <p className="text-sm text-gray-500">
              {locale === 'ar'
                ? 'غيّر ألوان المتجر وشاهدها مباشرة'
                : 'Change store colors instantly'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="btn-outline py-2 px-4 text-sm"
          >
            <RotateCcw size={16} />
            {locale === 'ar' ? 'إرجاع' : 'Reset'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary py-2 px-6 text-sm"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {locale === 'ar' ? 'حفظ' : 'Save'}
          </button>
        </div>
      </div>

      {/* Presets */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mb-8"
      >
        <h3 className="font-bold text-navy-800 mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-yellow-500" />
          {locale === 'ar' ? 'قوالب جاهزة' : 'Presets'}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(THEME_PRESETS).map(([key, preset]) => {
            const isActive =
              preset.colors.primary === draft.primary &&
              preset.colors.secondary === draft.secondary;

            return (
              <motion.button
                key={key}
                variants={staggerItem}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePreset(key as keyof typeof THEME_PRESETS)}
                className={`relative p-4 rounded-2xl border-2 transition-all text-start ${
                  isActive
                    ? 'border-yellow-500 shadow-lg'
                    : 'border-transparent'
                }`}
                style={{
                  background: preset.colors.background
                }}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                    <Check size={12} className="text-navy-900" />
                  </div>
                )}
                <div className="flex gap-1.5 mb-3">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white/20"
                    style={{ background: preset.colors.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white/20"
                    style={{ background: preset.colors.secondary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white/20"
                    style={{ background: preset.colors.backgroundCard }}
                  />
                </div>
                <p className="text-xs font-bold text-white/90 line-clamp-2">
                  {preset.name}
                </p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Custom Colors */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="card p-6">
          <h3 className="font-bold text-navy-800 mb-5 flex items-center gap-2">
            <Palette size={18} className="text-yellow-500" />
            {locale === 'ar' ? 'تعديل مخصص' : 'Custom Editor'}
          </h3>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-4"
          >
            {COLOR_FIELDS.map((field) => (
              <motion.div
                key={field.key}
                variants={staggerItem}
                className="flex items-center gap-4"
              >
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-600 block mb-1">
                    {locale === 'ar' ? field.labelAr : field.labelEn}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={draft[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="w-12 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={draft[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="input flex-1 font-mono text-xs py-2"
                      dir="ltr"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Live Preview */}
        <div className="card p-6 lg:sticky lg:top-24 h-fit">
          <h3 className="font-bold text-navy-800 mb-5 flex items-center gap-2">
            <Eye size={18} className="text-yellow-500" />
            {locale === 'ar' ? 'معاينة مباشرة' : 'Live Preview'}
          </h3>

          <div
            className="rounded-2xl p-5 space-y-4 border"
            style={{
              background: draft.background,
              borderColor: draft.secondary + '30'
            }}
          >
            {/* Fake card */}
            <div
              className="rounded-xl p-4"
              style={{
                background: draft.backgroundCard,
                border: `1px solid ${draft.secondary}30`
              }}
            >
              <h4
                className="font-black text-lg mb-2"
                style={{ color: draft.textPrimary }}
              >
                {locale === 'ar' ? 'عنوان المنتج' : 'Product Title'}
              </h4>
              <p
                className="text-sm mb-3"
                style={{ color: draft.textSecondary }}
              >
                {locale === 'ar'
                  ? 'وصف قصير للمنتج الطبي'
                  : 'Short description of medical product'}
              </p>
              <p
                className="font-black text-2xl mb-3"
                style={{ color: draft.secondary }}
              >
                450 EGP
              </p>

              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-full text-xs font-bold flex-1"
                  style={{
                    background: `linear-gradient(to right, ${draft.secondary}, ${draft.secondaryDark})`,
                    color: draft.primaryDark
                  }}
                >
                  {locale === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
                </button>
                <button
                  className="px-4 py-2 rounded-full text-xs font-bold flex-1 border"
                  style={{
                    borderColor: draft.secondary,
                    color: draft.secondary,
                    background: 'transparent'
                  }}
                >
                  {locale === 'ar' ? 'تفاصيل' : 'Details'}
                </button>
              </div>
            </div>

            {/* Fake badge */}
            <div className="flex gap-2 flex-wrap">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: draft.secondary,
                  color: draft.primaryDark
                }}
              >
                {locale === 'ar' ? 'خصم' : 'Sale'}
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold border"
                style={{
                  borderColor: draft.secondary + '60',
                  color: draft.textSecondary
                }}
              >
                {locale === 'ar' ? 'جديد' : 'New'}
              </span>
            </div>

            {/* Fake heading */}
            <div
              className="pt-4 border-t"
              style={{ borderColor: draft.secondary + '20' }}
            >
              <p
                className="text-2xl font-black mb-1"
                style={{ color: draft.textPrimary }}
              >
                Sovereign
              </p>
              <p className="text-xs" style={{ color: draft.textSecondary }}>
                {locale === 'ar'
                  ? 'جودة ممتازة. مصنوعة بشكل جميل مع تفاصيل مدروسة لرفع مستوى شعورك وحركتك'
                  : 'Premium Quality. Beautifully crafted with thoughtful details to elevate the way you feel and move.'}
              </p>
            </div>
          </div>

          <div
            className="mt-4 p-3 rounded-xl text-xs"
            style={{
              background: draft.secondary + '15',
              color: draft.textSecondary
            }}
          >
            💡{' '}
            {locale === 'ar'
              ? 'التغييرات تظهر مباشرة في كل الموقع بعد الحفظ'
              : 'Changes appear instantly across the site after saving'}
          </div>
        </div>
      </div>
    </div>
  );
}