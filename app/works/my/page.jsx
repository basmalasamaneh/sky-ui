"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { buildBackendApiUrl } from '@/lib/backend-api';

export default function MyWorksPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();

  const [works, setWorks] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [activeSliderWork, setActiveSliderWork] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const toImageSrc = (src) => {
    if (typeof src !== 'string' || !src.trim()) return null;
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    if (src.startsWith('/')) return buildBackendApiUrl(src);
    return buildBackendApiUrl(`/images/${encodeURIComponent(src)}`);
  };

  const normalizeWork = (work) => {
    const artworkImages = Array.isArray(work?.artwork_images) ? work.artwork_images : [];
    const sortedImages = artworkImages.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const mappedImages = sortedImages
      .map((image) => image.filename)
      .map((src) => toImageSrc(src))
      .filter(Boolean);
    const featuredIndex = sortedImages.findIndex((image) => image.is_featured);

    return {
      ...work,
      images: mappedImages,
      mainImageIndex: featuredIndex >= 0 ? featuredIndex : 0,
      createdAt: work?.created_at || work?.createdAt,
    };
  };

  // Close slider on escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeSlider();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const openSlider = (work) => {
    setActiveSliderWork(work);
    setCurrentSlideIndex(0);
    // document.body.style.overflow = 'hidden';
  };

  const closeSlider = () => {
    setActiveSliderWork(null);
    // document.body.style.overflow = 'auto';
  };

  const nextSlide = () => {
    if (!activeSliderWork) return;
    setCurrentSlideIndex((prev) => 
      prev === (activeSliderWork.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    if (!activeSliderWork) return;
    setCurrentSlideIndex((prev) => 
      prev === 0 ? (activeSliderWork.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleDeleteWork = (e, id) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا العمل؟ لا يمكن التراجع عن هذه الخطوة.')) return;

    fetch(`/api/artworks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const result = await res.json().catch(() => ({}));
          throw new Error(result.message || 'فشل حذف العمل الفني.');
        }

        setWorks(prev => prev.filter(w => w.id !== id));
      })
      .catch((err) => {
        console.error('Delete work failed:', err);
        alert(err.message || 'تعذر حذف العمل الفني حالياً. حاول مرة أخرى لاحقاً.');
      });
  };

  // حماية الصفحة: تظهر فقط للمستخدمين المسجلين كفنانين
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'artist') {
        // إعادة التوجيه للصفحة الرئيسية إذا لم يكن المستخدم فناناً
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, router, user]);

  const categoryMapping = {
    'لوحات فنية': 'لوحات فنية',
    'تطريز فلسطيني': 'تطريز فلسطيني',
    'خزف وفخار': 'خزف وفخار',
    'خط عربي': 'خط عربي',
    'تصوير فوتوغرافي': 'تصوير فوتوغرافي',
    'نحت ومجسمات': 'نحت ومجسمات'
  };

  useEffect(() => {
    if (!token || !isAuthenticated || user?.role !== 'artist') return;

    const fetchMyWorks = async () => {
      setIsFetching(true);
      setFetchError('');
      try {
        const res = await fetch('/api/artworks/my-artworks', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const contentType = res.headers.get('content-type') || '';
        const result = contentType.includes('application/json')
          ? await res.json().catch(() => ({}))
          : {};

        if (!res.ok) {
          const msg = result?.message || `خطأ ${res.status}: تعذر جلب الأعمال الفنية من الخادم.`;
          console.error('Failed to fetch my works:', res.status, msg);
          setFetchError(msg);
          setWorks([]);
          return;
        }

        const rawWorks = Array.isArray(result?.data?.artworks) ? result.data.artworks : [];
        setWorks(rawWorks.map(normalizeWork));
      } catch (err) {
        console.error('Failed to fetch my works:', err);
        setFetchError('تعذر الاتصال بالخادم. تأكد من تشغيل الباك إند.');
        setWorks([]);
      } finally {
        setIsFetching(false);
      }
    };

    fetchMyWorks();
  }, [token, isAuthenticated, user]);

  // منع عرض أي مكونات إذا لم يكن مصرحاً له
  if (isLoading || !isAuthenticated || user?.role !== 'artist') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf7]">
        <div className="w-12 h-12 border-4 border-[#3b2012] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf7] py-28 px-4 md:px-8 font-amiri" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* قسم الترويسة (Header Section) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-right"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-3 h-12 bg-brown-gradient rounded-full"></div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#3b2012] font-art">معرضي الفني</h1>
            </div>
            <p className="text-[#9c7b65] text-lg md:text-xl max-w-2xl">
              مرحباً {user?.artistName || user?.firstName}، هنا مساحتك الخاصة لإدارة وعرض إبداعاتك لمجتمع أثر.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Link 
              href="/works/add"
              className="flex items-center gap-3 px-8 py-4 bg-brown-gradient text-white rounded-[2rem] font-bold text-lg shadow-xl hover:opacity-90 transition-all active:scale-95 group"
            >
              <i className="fa-solid fa-plus transition-transform group-hover:rotate-90"></i>
              <span>رفع عمل جديد</span>
            </Link>
          </motion.div>
        </div>

        {/* شبكة الأعمال الفنية (Works Grid) */}
        {isFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[2.5rem] h-[480px] animate-pulse border border-[#e8dcc4] p-4 flex flex-col">
                <div className="w-full h-64 bg-gray-200 rounded-[2rem] mb-4"></div>
                <div className="w-3/4 h-6 bg-gray-200 rounded-full mb-2"></div>
                <div className="w-full h-16 bg-gray-200 rounded-xl mb-4"></div>
                <div className="mt-auto flex justify-between">
                  <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : works.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {works.map((work, index) => (
                <motion.div
                  key={work.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => openSlider(work)}
                  className="group bg-white rounded-[2.5rem] overflow-hidden border border-[#e8dcc4] shadow-sm hover:shadow-2xl transition-all duration-500 relative flex flex-col h-full cursor-pointer"
                >
                  {/* حاوية الصورة (Image Container) */}
                  <div 
                    className="relative h-72 overflow-hidden m-3 rounded-[2rem]"
                  >
                    <Image
                      src={work.images?.[work.mainImageIndex || 0] || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800'}
                      alt={work.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* طبقة التحكم السريعة (Hover Actions) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3b2012]/90 via-[#3b2012]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
                       <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white p-4 rounded-full font-bold hover:bg-white hover:text-[#3b2012] transition-colors flex items-center justify-center shadow-xl hover:scale-110 transform">
                         <i className="fa-solid fa-expand text-2xl"></i>
                       </div>
                    </div>
                    
                    {/* Badge for multiple images */}
                    {work.images?.length > 1 && (
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                        <i className="fa-solid fa-layer-group"></i>
                        <span>{work.images.length} صور</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar (Edit/Delete) */}
                  <div className="flex px-4 pt-2 gap-2 relative z-10" onClick={(e) => e.stopPropagation()}>
                     <Link 
                       href={`/works/edit/${work.id}`}
                       className="flex-1 bg-[#fdfaf7] text-[#9c7b65] border border-[#e8dcc4] py-2 rounded-xl font-bold hover:bg-[#e8dcc4] hover:text-[#3b2012] transition-colors flex items-center justify-center gap-2 text-xs"
                     >
                       <i className="fa-solid fa-pen-to-square"></i>
                       تعديل
                     </Link>
                     <button 
                       onClick={(e) => handleDeleteWork(e, work.id)}
                       className="flex-1 bg-red-50 text-red-500 border border-red-100 py-2 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2 text-xs"
                     >
                       <i className="fa-solid fa-trash-can"></i>
                       حذف
                     </button>
                  </div>

                  {/* حاوية المحتوى (Content) */}
                  <div className="p-6 pt-2 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <i className="fa-regular fa-calendar text-[10px]"></i>
                        تاريخ العرض: {new Date(work.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 
                      className="text-2xl font-bold text-[#3b2012] mb-3 group-hover:text-[#6f370f] transition-colors line-clamp-1 cursor-pointer"
                      onClick={() => openSlider(work)}
                    >
                      {work.title}
                    </h3>
                    <p className="text-[#9c7b65] text-sm leading-relaxed line-clamp-2">
                      {work.description}
                    </p>
                    
                    <div className="mt-6 pt-4 border-t border-[#f0ece6] flex items-center justify-between">
                       <span className="text-xl font-black text-[#3b2012]">
                         {work.price ? `${work.price} ₪` : 'السعر غير محدد'}
                       </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* حالة عدم وجود أعمال (Empty State) */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 px-6 bg-white rounded-[3rem] border border-[#e8dcc4] text-center shadow-lg"
          >
            {fetchError && (
              <div className="w-full mb-8 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-center gap-3 text-sm font-bold font-amiri">
                <i className="fa-solid fa-circle-exclamation text-red-500"></i>
                {fetchError}
              </div>
            )}
            <div className="w-32 h-32 bg-[#fdfaf7] rounded-full flex items-center justify-center mb-8 relative border-4 border-white shadow-inner">
               <i className="fa-solid fa-paintbrush text-5xl text-[#ceb29f]"></i>
               <div className="absolute -top-2 -right-2 w-10 h-10 bg-brown-gradient rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
                  <i className="fa-solid fa-star"></i>
               </div>
            </div>
            <h3 className="text-3xl font-bold text-[#3b2012] mb-4 font-art">لم تقم بإضافة أي أعمال بعد</h3>
            <p className="text-[#9c7b65] text-lg max-w-md mb-10 leading-relaxed font-amiri">
              معرضك الفني جاهز! ابدأ بمشاركة إبداعاتك مع العالم ودع الجميع يرى بصمتك الفنية الفريدة على منصة أثر.
            </p>
            <Link 
              href="/works/add"
              className="px-10 py-4 bg-brown-gradient text-white rounded-[2rem] font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <i className="fa-solid fa-cloud-arrow-up"></i>
              رفع أول عمل فني
            </Link>
          </motion.div>
        )}
        
        {/* Global Product Detail Modal */}
        <AnimatePresence>
          {activeSliderWork && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row relative"
              >
                {/* Close Button */}
                <button 
                  onClick={closeSlider}
                  className="absolute top-6 left-6 z-50 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-[#3b2012] shadow-md transition-all active:scale-95"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>

                {/* Left Side: Image Gallery */}
                <div className="md:w-1/2 bg-[#fdfaf7] relative h-[40vh] md:h-auto border-l border-[#e8dcc4]/50">
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
                          src={activeSliderWork.images?.[currentSlideIndex] || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800'}
                          alt={activeSliderWork.title}
                          fill
                          className="object-contain"
                        />
                      </motion.div>
                    </AnimatePresence>

                    {activeSliderWork.images?.length > 1 && (
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
                  {activeSliderWork.images?.length > 1 && (
                    <div className="absolute bottom-6 left-0 w-full flex justify-center gap-2 px-4 overflow-x-auto no-scrollbar">
                      {activeSliderWork.images.map((img, idx) => (
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
                <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto bg-white flex flex-col h-full overflow-y-auto no-scrollbar">
                  <div className="space-y-8 animate-fade-in">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <i className="fa-solid fa-tag text-[8px]"></i>
                          <span>الفئة: {categoryMapping[activeSliderWork.category] || activeSliderWork.category || 'متنوع'}</span>
                        </span>
                        <span className="text-[10px] bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                           عملي الخاص
                        </span>
                      </div>
                      <h2 className="text-4xl font-bold text-[#3b2012] font-art leading-tight">
                        {activeSliderWork.title}
                      </h2>
                    </div>

                    <div className="p-6 bg-[#fdfaf7] rounded-[2rem] border border-[#e8dcc4]/50 space-y-6">
                      {/* Artist Box (Current user) */}
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-brown-gradient rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                          {user?.artistAvatar || user?.firstName?.charAt(0) || 'أ'}
                        </div>
                        <div className="flex-1">
                           <p className="text-xs text-[#9c7b65] mb-0.5">الفنان (أنت)</p>
                           <p className="text-lg font-bold text-[#3b2012]">{user?.artistName || (user?.firstName + ' ' + user?.lastName)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-[#e8dcc4]/30 shadow-sm flex items-center gap-3">
                           <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                             <i className="fa-solid fa-location-dot"></i>
                           </div>
                           <div>
                              <p className="text-[10px] text-gray-400">الموقع</p>
                              <p className="text-sm font-bold text-[#3b2012]">{user?.location || activeSliderWork.artistLocation || 'نابلس، فلسطين'}</p>
                           </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-[#e8dcc4]/30 shadow-sm flex items-center gap-3">
                           <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                             <i className="fa-solid fa-phone"></i>
                           </div>
                           <div>
                              <p className="text-[10px] text-gray-400">رقم التواصل</p>
                              <p className="text-sm font-bold text-[#3b2012] font-mono tracking-wider" dir="ltr">{user?.phone || activeSliderWork.artistPhone || '059xxxxxxx'}</p>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-[#3b2012] flex items-center gap-2">
                         <i className="fa-solid fa-align-right text-amber-600 text-sm"></i>
                         عن العمل الفني
                      </h4>
                      <p className="text-[#9c7b65] text-lg leading-relaxed font-amiri">
                        {activeSliderWork.description}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold bg-gray-50 inline-block px-3 py-1 rounded-md">
                         تاريخ النشر: {new Date(activeSliderWork.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex items-center justify-between mt-auto">
                       <div className="space-y-1">
                          <p className="text-xs text-gray-400 font-bold">السعر</p>
                          <p className="text-3xl font-black text-[#3b2012]">
                            {activeSliderWork.price ? `${activeSliderWork.price} ₪` : 'حسب الطلب'}
                          </p>
                       </div>
                       <div className="flex gap-2">
                          <Link 
                            href={`/works/edit/${activeSliderWork.id}`}
                            className="h-14 px-6 bg-[#f0ece6] text-[#3b2012] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#e8dcc4] transition-all"
                          >
                             <i className="fa-solid fa-pen-to-square"></i>
                             <span>تعديل</span>
                          </Link>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
