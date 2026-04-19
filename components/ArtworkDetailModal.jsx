"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { categoryMapping } from '@/lib/artwork-utils';

export default function ArtworkDetailModal({ work, isLoadingDetails = false, onClose }) {
  const { isAuthenticated, user } = useAuth();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Reset slide index when a new artwork is opened
  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [work?.id]);

  if (!work) return null;

  const isOwnerArtwork = Boolean(user?.id && work?.artist_id && user.id === work.artist_id);
  const images = work.images || [];

  const nextSlide = () => setCurrentSlideIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlideIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const fallbackImage = 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-5xl h-[92vh] md:max-h-[90vh] md:h-auto overflow-hidden rounded-[2rem] md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 z-50 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-[#3b2012] shadow-md transition-all active:scale-95"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        {/* Left Side: Image Gallery */}
        <div className="md:w-1/2 bg-[#fdfaf7] relative h-[32vh] md:h-auto shrink-0 border-l border-[#e8dcc4]/50">
          <div className="relative w-full h-full p-4 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlideIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative w-full h-full"
              >
                <Image
                  src={images[currentSlideIndex] || fallbackImage}
                  alt={work.title || ''}
                  fill
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/50 hover:bg-white rounded-full flex items-center justify-center shadow-sm text-[#3b2012] transition-all"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/50 hover:bg-white rounded-full flex items-center justify-center shadow-sm text-[#3b2012] transition-all"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-0 w-full flex justify-center gap-2 px-4 overflow-x-auto no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${currentSlideIndex === idx ? 'border-amber-600 scale-110' : 'border-transparent opacity-60'}`}
                >
                  <Image src={img} alt="thumb" width={48} height={48} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="md:w-1/2 flex-1 min-h-0 p-5 md:p-10 overflow-y-auto bg-white flex flex-col no-scrollbar" dir="rtl">
          {isLoadingDetails ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6">
              <div className="w-16 h-16 border-4 border-[#3b2012] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#9c7b65] font-bold">جاري تحميل تفاصيل العمل الفني...</p>
            </div>

          ) : !isAuthenticated ? (
            /* ─── GUEST VIEW ─── */
            <div className="space-y-5 md:space-y-8 animate-fade-in">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <i className="fa-solid fa-tag text-[8px]"></i>
                    <span>الفئة: {categoryMapping[work.category] || work.category || 'متنوع'}</span>
                  </span>
                  <span className="text-[10px] bg-[#f0ece6] text-[#6b4c3b] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                    عرض للزوار
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-[#3b2012] font-art leading-tight">
                  {work.title}
                </h2>
              </div>

              <div className="p-6 bg-[#fdfaf7] rounded-[2rem] border border-[#e8dcc4]/50 space-y-6">
                <Link href={`/artists/${work.artist_id}`} className="flex items-center gap-4 group/artist" onClick={onClose}>
                  <div className="relative w-14 h-14 bg-[#f0ece6] rounded-full flex items-center justify-center text-[#6b4c3b] text-xl font-bold shadow-md transition-transform group-hover/artist:scale-110 overflow-hidden border-2 border-white">
                    <img 
                      src={work.artistAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(work.artistName || 'ف')}&background=5c4436&color=fff&size=200&font-size=0.4&bold=true`} 
                      alt={work.artistName || 'فنان'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#9c7b65] mb-0.5">الفنان المبدع</p>
                    <p className="text-lg font-bold text-[#3b2012] group-hover/artist:text-[#6b4c3b] transition-colors">{work.artistName || 'غير متوفر'}</p>
                  </div>
                </Link>

                <div className="grid grid-cols-2 gap-4">
                  <Link href="/login" className="relative overflow-hidden bg-white p-4 rounded-2xl border border-[#e8dcc4]/30 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400">الموقع</p>
                      <div className="relative mt-1">
                        <p className="text-sm font-bold text-[#3b2012] blur-sm select-none">معلومات مخفية</p>
                        <div className="absolute inset-0 flex items-center justify-end">
                          <span className="inline-flex items-center gap-1 bg-white/90 text-[#6b4c3b] text-[10px] font-bold px-2 py-1 rounded-full border border-[#e8dcc4]">
                            <i className="fa-solid fa-lock text-[9px]"></i>
                            سجل الدخول
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/login" className="relative overflow-hidden bg-white p-4 rounded-2xl border border-[#e8dcc4]/30 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                      <i className="fa-solid fa-phone"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400">رقم التواصل</p>
                      <div className="relative mt-1">
                        <p className="text-sm font-bold text-[#3b2012] font-mono tracking-wider blur-sm select-none" dir="ltr">0000000000</p>
                        <div className="absolute inset-0 flex items-center justify-end">
                          <span className="inline-flex items-center gap-1 bg-white/90 text-[#6b4c3b] text-[10px] font-bold px-2 py-1 rounded-full border border-[#e8dcc4]">
                            <i className="fa-solid fa-lock text-[9px]"></i>
                            سجل الدخول
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>

                <Link href="/login" className="bg-white/80 border border-[#e8dcc4] hover:border-[#6b4c3b] hover:bg-[#fdfaf7] rounded-2xl p-4 flex items-start gap-3 transition-colors">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-[#f0ece6] text-[#6b4c3b] flex items-center justify-center">
                    <i className="fa-solid fa-user-lock"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#3b2012]">أنشئ حساباً للوصول إلى معلومات التواصل</p>
                    <p className="text-xs text-[#9c7b65] mt-1 leading-relaxed">سجّل الدخول أو أنشئ حساباً جديداً لرؤية موقع الفنان ورقم التواصل والتفاعل الكامل مع الأعمال الفنية.</p>
                  </div>
                </Link>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-[#3b2012] flex items-center gap-2">
                  <i className="fa-solid fa-align-right text-amber-600 text-sm"></i>
                  عن العمل الفني
                </h4>
                <p className="text-[#9c7b65] text-lg leading-relaxed font-amiri">{work.description}</p>
                <p className="text-[10px] text-gray-400 font-bold bg-gray-50 inline-block px-3 py-1 rounded-md">
                  تاريخ النشر: {work.createdAt ? new Date(work.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير متوفر'}
                </p>
              </div>

              <div className="pt-8 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 font-bold">السعر المطلوب</p>
                  <p className="text-3xl font-black text-[#3b2012]">
                    {work.price ? `${work.price} ₪` : 'حسب الطلب'}
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Link href="/signup" className="h-14 px-6 bg-brown-gradient rounded-2xl flex items-center justify-center text-white font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all">
                    إنشاء حساب
                  </Link>
                  <Link href="/login" className="h-14 px-6 bg-[#f0ece6] text-[#6b4c3b] rounded-2xl font-bold flex items-center justify-center hover:bg-[#e8dcc4] transition-all">
                    تسجيل الدخول
                  </Link>
                </div>
              </div>
            </div>

          ) : isOwnerArtwork ? (
            /* ─── OWNER VIEW ─── */
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <i className="fa-solid fa-tag text-[8px]"></i>
                    <span>الفئة: {categoryMapping[work.category] || work.category || 'متنوع'}</span>
                  </span>
                  <span className="text-[10px] bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                    عملي الخاص
                  </span>
                </div>
                <h2 className="text-4xl font-bold text-[#3b2012] font-art leading-tight">{work.title}</h2>
              </div>

              <div className="p-6 bg-[#fdfaf7] rounded-[2rem] border border-[#e8dcc4]/50 space-y-6">
                <Link
                  href={`/artists/${work.artist_id || user?.id}`}
                  className="flex items-center gap-4 group/artist"
                  onClick={onClose}
                >
                  <div className="w-14 h-14 bg-brown-gradient rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md overflow-hidden border-2 border-white transition-transform group-hover/artist:scale-110">
                    {user?.profileImage || work.artistAvatar ? (
                      <img
                        src={user?.profileImage || work.artistAvatar}
                        alt={user?.artistName || work.artistName || 'فنان'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.firstName?.charAt(0) || 'أ'
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#9c7b65] mb-0.5">الفنان (أنت)</p>
                    <p className="text-lg font-bold text-[#3b2012] group-hover/artist:text-[#6b4c3b] transition-colors">{user?.artistName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()}</p>
                  </div>
                </Link>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#e8dcc4]/30 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">الموقع</p>
                      <p className="text-sm font-bold text-[#3b2012]">{user?.location || work.artistLocation || 'غير محدد'}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-[#e8dcc4]/30 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                      <i className="fa-solid fa-phone"></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">رقم التواصل</p>
                      <p className="text-sm font-bold text-[#3b2012] font-mono tracking-wider" dir="ltr">{user?.phone || work.artistPhone || 'غير محدد'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-[#3b2012] flex items-center gap-2">
                  <i className="fa-solid fa-align-right text-amber-600 text-sm"></i>
                  عن العمل الفني
                </h4>
                <p className="text-[#9c7b65] text-lg leading-relaxed font-amiri">{work.description}</p>
                <p className="text-[10px] text-gray-400 font-bold bg-gray-50 inline-block px-3 py-1 rounded-md">
                  تاريخ النشر: {work.createdAt ? new Date(work.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير متوفر'}
                </p>
              </div>

              <div className="pt-8 border-t border-gray-100 flex items-center justify-between mt-auto">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 font-bold">السعر</p>
                  <p className="text-3xl font-black text-[#3b2012]">
                    {work.price ? `${work.price} ₪` : 'حسب الطلب'}
                  </p>
                </div>
                <Link
                  href={`/works/edit/${work.id}`}
                  className="h-14 px-6 bg-[#f0ece6] text-[#3b2012] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#e8dcc4] transition-all"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                  <span>تعديل</span>
                </Link>
              </div>
            </div>

          ) : (
            /* ─── AUTHENTICATED USER VIEW ─── */
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <i className="fa-solid fa-tag text-[8px]"></i>
                    <span>الفئة: {categoryMapping[work.category] || work.category || 'متنوع'}</span>
                  </span>
                </div>
                <h2 className="text-4xl font-bold text-[#3b2012] font-art leading-tight">{work.title}</h2>
              </div>

              <div className="p-6 bg-[#fdfaf7] rounded-[2rem] border border-[#e8dcc4]/50 space-y-6">
                <Link href={`/artists/${work.artist_id}`} className="flex items-center gap-4 group/artist" onClick={onClose}>
                  <div className="relative w-14 h-14 bg-[#f0ece6] rounded-full flex items-center justify-center text-[#6b4c3b] text-xl font-bold shadow-md transition-transform group-hover/artist:scale-110 overflow-hidden border-2 border-white">
                    <img 
                      src={work.artistAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(work.artistName || 'ف')}&background=5c4436&color=fff&size=200&font-size=0.4&bold=true`} 
                      alt={work.artistName || 'فنان'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#9c7b65] mb-0.5">الفنان المبدع</p>
                    <p className="text-lg font-bold text-[#3b2012] group-hover/artist:text-[#6b4c3b] transition-colors">{work.artistName || 'غير متوفر'}</p>
                  </div>
                </Link>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#e8dcc4]/30 shadow-sm flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">الموقع</p>
                      <p className="text-sm font-bold text-[#3b2012]">{work.artistLocation || 'غير محدد'}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-[#e8dcc4]/30 shadow-sm flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
                      <i className="fa-solid fa-phone"></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">رقم التواصل</p>
                      <p className="text-sm font-bold text-[#3b2012] font-mono tracking-wider" dir="ltr">{work.artistPhone || 'غير محدد'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-[#3b2012] flex items-center gap-2">
                  <i className="fa-solid fa-align-right text-amber-600 text-sm"></i>
                  عن العمل الفني
                </h4>
                <p className="text-[#9c7b65] text-lg leading-relaxed font-amiri">{work.description}</p>
              </div>

              <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 font-bold">السعر المطلوب</p>
                  <p className="text-3xl font-black text-[#3b2012]">
                    {work.price ? `${work.price} ₪` : 'حسب الطلب'}
                  </p>
                </div>
                <button className="h-14 px-10 bg-[#3b2012] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-[#5c3d2e] transition-all active:scale-95 group">
                  <span>إضافة للسلة</span>
                  <i className="fa-solid fa-bag-shopping transition-transform group-hover:-translate-y-1"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
