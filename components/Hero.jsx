"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { normalizeWork } from '../lib/artwork-utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Hero() {
  const { isAuthenticated } = useAuth();
  const [artworks, setArtworks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await fetch('/api/v1/artworks');
        const result = await res.json();
        
        if (res.ok && result?.data?.artworks?.length > 0) {
          setArtworks(result.data.artworks.map(normalizeWork));
        }
      } catch (error) {
        console.error('Failed to fetch Hero artworks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  // Auto-cycle every 10 seconds
  useEffect(() => {
    if (artworks.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % artworks.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [artworks]);

  const currentArtwork = artworks[currentIndex];

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" dir="rtl">

      {/* النص - يمين */}
      <div className="space-y-6">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-[#e8dcc4] leading-tight tracking-tight">
          من <span className="bg-gradient-to-r from-[#6f370f] via-[#a3785a] to-[#d4af37] bg-clip-text text-transparent">تراثنا</span>
          <br />
          إلى روحك
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          في أثر، كل قطعة تحمل روح صانعها من خطوط الرسم الحرة، إلى دقة الخرز، ونعومة التطريز، وعراقة الفخار
        </p>
        <div className="flex items-center gap-4">
          <Link href="/products" className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-700 dark:text-[#e8dcc4] hover:bg-gray-50 dark:hover:bg-gray-900 dark:bg-gray-900 transition-colors bg-white dark:bg-black dark:black/50 dark:bg-black/50 backdrop-blur-sm">
            <i className="fa-solid fa-eye text-xs"></i>
            استعراض
          </Link>
          {!isAuthenticated && (
            <Link href="/signup" className="px-6 py-3 bg-gradient-to-r from-[#6f370f] via-[#a3785a] to-[#d4af37] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-md">
              تسوق الآن
            </Link>
          )}
        </div>
      </div>

      {/* الصورة والبطاقات - يسار */}
      <div className="relative group min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.05, x: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            {/* صورة المنتج */}
            <div className="relative rounded-3xl overflow-hidden h-[450px] shadow-2xl bg-gray-100 dark:bg-gray-800">
              {isLoading ? (
                <div className="absolute inset-0 animate-pulse bg-gray-200"></div>
              ) : currentArtwork ? (
                <Image
                  src={currentArtwork.images?.[0] || '/images/painting.jpg'}
                  alt={currentArtwork.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <Image
                  src="/images/painting.jpg"
                  alt="لوحة فنية أثر"
                  fill
                  className="object-cover"
                />
              )}
              
              {/* Badge: أثر اليوم */}
              <div className="absolute top-6 right-6 z-10">
                <span className="bg-white dark:bg-black dark:black/90 dark:bg-black/90 backdrop-blur-md text-[#1a0f0a] dark:text-[#e8dcc4] px-4 py-2 rounded-full text-xs font-bold shadow-lg border border-white/50 flex items-center gap-2">
                  <i className="fa-solid fa-wand-magic-sparkles text-amber-600 animate-pulse"></i>
                  إبداعات متجددة
                </span>
              </div>
            </div>

            {/* حاوية الإشعارات */}
            <div className="absolute -bottom-8 -right-8 flex flex-col gap-4 z-10">
              
              {/* بطاقة 1 - معلومات الفنان */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-black rounded-2xl shadow-xl p-4 w-72 border border-gray-100 dark:border-gray-800 dark:border-gray-800 transform transition-transform hover:-translate-x-2"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-base font-black uppercase shadow-inner">
                      {isLoading ? '...' : (currentArtwork?.artistName?.charAt(0) || 'ف')}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900 dark:text-[#e8dcc4]">{isLoading ? 'جاري التحميل...' : (currentArtwork?.artistName || 'فنان أثر')}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-gray-400">{currentArtwork?.category || 'عمل فني'}</span>
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-bold">فنان موثق</span>
                </div>
                <div className="h-px bg-gray-100 dark:bg-gray-800 mb-3"></div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm font-black text-gray-900 dark:text-[#e8dcc4] truncate max-w-[150px]">{currentArtwork?.artistLocation || 'فلسطين'}</p>
                    <p className="text-xs text-gray-400">الموقع</p>
                  </div>
                </div>
              </motion.div>

              {/* بطاقة 2 - تفاصيل المنتج */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-black rounded-2xl shadow-xl p-4 w-72 border border-gray-100 dark:border-gray-800 dark:border-gray-800 transform transition-transform hover:-translate-x-2"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl [#6f370f]/10 dark:bg-black/10 flex items-center justify-center text-xl text-[#6f370f]">
                    <i className="fa-solid fa-palette"></i>
                  </div>
                  <div className="text-right flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 dark:text-[#e8dcc4] truncate">
                      {isLoading ? 'جاري التحميل...' : (currentArtwork?.title || 'لوحة فنية مميزة')}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-0.5">
                      <span className="text-xs font-black text-[#6f370f]">
                        {currentArtwork?.price ? `${currentArtwork.price} ₪` : 'تواصل كأثر'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-50">
                   <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed italic">
                     "{currentArtwork?.description || 'جمال فني يجسد عراقة التراث بلمسة إبداعية حديثة.'}"
                   </p>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>

    </section>
  );
}
