'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';

type Props = {
  images: string[];
  alt: string;
};

export default function ImageGallery({ images, alt }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const allImages = images.length > 0 ? images : [''];

  const next = () => setActiveIndex((prev) => (prev + 1) % allImages.length);
  const prev = () =>
    setActiveIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div
          className="relative aspect-square rounded-3xl overflow-hidden group cursor-zoom-in"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}
          onMouseMove={handleMouseMove}
          onClick={() => setZoomOpen(true)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={activeIndex}
              src={allImages[activeIndex]}
              alt={alt}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </AnimatePresence>

          {/* Zoom hint */}
          <div
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: 'rgba(26, 47, 77, 0.9)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: 'var(--color-secondary-500)'
            }}
          >
            <ZoomIn size={18} />
          </div>

          {/* Navigation arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'rgba(26, 47, 77, 0.9)',
                  color: 'var(--color-secondary-500)',
                  border: '1px solid rgba(212, 175, 55, 0.3)'
                }}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'rgba(26, 47, 77, 0.9)',
                  color: 'var(--color-secondary-500)',
                  border: '1px solid rgba(212, 175, 55, 0.3)'
                }}
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* Counter */}
          {allImages.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: 'rgba(26, 47, 77, 0.9)',
                color: 'var(--color-secondary-500)',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}
            >
              {activeIndex + 1} / {allImages.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allImages.map((img, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveIndex(i)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all"
                style={{
                  border:
                    activeIndex === i
                      ? '2px solid var(--color-secondary-500)'
                      : '2px solid rgba(212, 175, 55, 0.2)',
                  boxShadow:
                    activeIndex === i
                      ? '0 0 20px rgba(212, 175, 55, 0.4)'
                      : 'none'
                }}
              >
                <img
                  src={img}
                  alt={`${alt} ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(10, 24, 40, 0.95)' }}
            onClick={() => setZoomOpen(false)}
          >
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center z-10"
              style={{
                background: 'var(--color-secondary-500)',
                color: '#0a1828'
              }}
            >
              <X size={24} />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={allImages[activeIndex]}
                alt={alt}
                className="w-full h-full object-contain"
              />
            </motion.div>

            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(212, 175, 55, 0.2)',
                    color: 'var(--color-secondary-500)'
                  }}
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(212, 175, 55, 0.2)',
                    color: 'var(--color-secondary-500)'
                  }}
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}