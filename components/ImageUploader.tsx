'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import {
  Upload, X, Image as ImageIcon, Loader2, Plus, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  folder?: string;
  label?: { ar: string; en: string };
  allowUrl?: boolean;
};

export default function ImageUploader({
  images,
  onChange,
  maxImages = 8,
  folder = 'products',
  label = { ar: 'صور المنتج', en: 'Product Images' },
  allowUrl = true
}: Props) {
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch('/api/upload-product', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Upload failed');
    }

    const data = await res.json();
    return data.url;
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast.error(
        locale === 'ar'
          ? `الحد الأقصى ${maxImages} صورة`
          : `Maximum ${maxImages} images`
      );
      return;
    }

    const filesToUpload = fileArray.slice(0, remaining);

    const invalid = filesToUpload.find((f) => !f.type.startsWith('image/'));
    if (invalid) {
      toast.error(
        locale === 'ar'
          ? 'الملف يجب أن يكون صورة'
          : 'File must be an image'
      );
      return;
    }

    const tooLarge = filesToUpload.find((f) => f.size > 5 * 1024 * 1024);
    if (tooLarge) {
      toast.error(
        locale === 'ar'
          ? 'حجم الصورة يجب أن يكون أقل من 5MB'
          : 'Image must be less than 5MB'
      );
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const newUrls: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      try {
        const url = await uploadFile(filesToUpload[i]);
        if (url) newUrls.push(url);
        setUploadProgress(((i + 1) / filesToUpload.length) * 100);
      } catch (err: any) {
        console.error('Upload error:', err);
        toast.error(
          locale === 'ar'
            ? `فشل رفع الصورة: ${err.message}`
            : `Upload failed: ${err.message}`
        );
      }
    }

    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
      toast.success(
        locale === 'ar'
          ? `تم رفع ${newUrls.length} صورة ✓`
          : `${newUrls.length} images uploaded ✓`
      );
    }

    setUploading(false);
    setUploadProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (url: string) => {
    onChange(images.filter((i) => i !== url));
  };

  const addUrl = () => {
    if (!urlInput.trim()) return;
    if (images.includes(urlInput.trim())) {
      toast.error(locale === 'ar' ? 'الصورة مضافة' : 'Already added');
      return;
    }
    if (images.length >= maxImages) {
      toast.error(
        locale === 'ar'
          ? `الحد الأقصى ${maxImages} صورة`
          : `Maximum ${maxImages} images`
      );
      return;
    }
    onChange([...images, urlInput.trim()]);
    setUrlInput('');
    setShowUrlInput(false);
    toast.success(locale === 'ar' ? 'تمت الإضافة ✓' : 'Added ✓');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <label
          className="font-black flex items-center gap-2 text-sm"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <ImageIcon
            size={16}
            style={{ color: 'var(--color-secondary-500)' }}
          />
          {locale === 'ar' ? label.ar : label.en}
          <span
            className="text-xs font-normal px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(212, 175, 55, 0.15)',
              color: 'var(--color-secondary-500)'
            }}
          >
            {images.length}/{maxImages}
          </span>
        </label>

        {allowUrl && (
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: showUrlInput
                ? 'rgba(212, 175, 55, 0.2)'
                : 'rgba(212, 175, 55, 0.1)',
              color: 'var(--color-secondary-500)',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}
          >
            {showUrlInput
              ? locale === 'ar'
                ? 'إلغاء'
                : 'Cancel'
              : locale === 'ar'
                ? 'أضف بالرابط'
                : 'Add by URL'}
          </button>
        )}
      </div>

      {/* URL Input */}
      <AnimatePresence>
        {showUrlInput && allowUrl && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="input flex-1 text-sm"
                dir="ltr"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addUrl();
                  }
                }}
              />
              <button
                type="button"
                onClick={addUrl}
                className="btn-secondary px-4 text-sm"
              >
                <Plus size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className="relative rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all mb-4"
        style={{
          background: dragActive
            ? 'rgba(212, 175, 55, 0.15)'
            : 'var(--color-bg-elevated)',
          border: `2px dashed ${
            dragActive
              ? 'var(--color-secondary-500)'
              : 'rgba(212, 175, 55, 0.3)'
          }`,
          opacity: uploading ? 0.7 : 1,
          cursor: uploading ? 'wait' : 'pointer'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 mx-auto mb-3"
            >
              <Loader2
                size={48}
                style={{ color: 'var(--color-secondary-500)' }}
              />
            </motion.div>
            <p
              className="font-bold text-sm mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {locale === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
            </p>
            <div
              className="max-w-xs mx-auto h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(212, 175, 55, 0.2)' }}
            >
              <motion.div
                className="h-full"
                style={{
                  background: `linear-gradient(to right, var(--color-secondary-400), var(--color-secondary-500))`,
                  width: `${uploadProgress}%`
                }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        ) : (
          <>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
              style={{ background: 'rgba(212, 175, 55, 0.15)' }}
            >
              <Upload
                size={28}
                style={{ color: 'var(--color-secondary-500)' }}
              />
            </motion.div>
            <p
              className="font-bold text-sm mb-1"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {locale === 'ar'
                ? 'اسحب الصور هنا أو اضغط للاختيار'
                : 'Drag images here or click to browse'}
            </p>
            <p
              className="text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {locale === 'ar'
                ? 'PNG, JPG, WEBP — حتى 5MB لكل صورة'
                : 'PNG, JPG, WEBP — Max 5MB each'}
            </p>
          </>
        )}
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <AnimatePresence>
            {images.map((url, i) => (
              <motion.div
                key={url}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative aspect-square rounded-xl overflow-hidden group"
                style={{
                  border: '2px solid rgba(212, 175, 55, 0.2)'
                }}
              >
                <img
                  src={url}
                  alt={`Image ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23333" width="100" height="100"/><text x="50" y="55" fill="%23666" font-size="12" text-anchor="middle">Error</text></svg>';
                  }}
                />

                <div
                  className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-lg"
                  style={{
                    background:
                      i === 0
                        ? 'var(--color-secondary-500)'
                        : 'rgba(26, 47, 77, 0.9)',
                    color: i === 0 ? '#0a1828' : '#fff'
                  }}
                  title={
                    i === 0
                      ? locale === 'ar'
                        ? 'الصورة الأساسية'
                        : 'Main image'
                      : `#${i + 1}`
                  }
                >
                  {i === 0 ? <Check size={12} strokeWidth={3} /> : i + 1}
                </div>

                <motion.button
                  type="button"
                  onClick={() => removeImage(url)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-opacity"
                  style={{
                    background: '#ef4444',
                    color: '#fff'
                  }}
                  title={locale === 'ar' ? 'حذف' : 'Delete'}
                >
                  <X size={14} strokeWidth={3} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <p
        className="text-xs mt-3 flex items-start gap-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <span className="flex-shrink-0">💡</span>
        <span>
          {locale === 'ar'
            ? 'الصورة الأولى ستكون الصورة الأساسية للمنتج. باقي الصور ستظهر في معرض الصور.'
            : 'First image will be the main product image. The rest will be shown in the gallery.'}
        </span>
      </p>
    </div>
  );
}