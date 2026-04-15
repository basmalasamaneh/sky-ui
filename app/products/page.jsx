"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useSearch } from '@/contexts/SearchContext';
import { categories, categoryMapping, normalizeWork } from '@/lib/artwork-utils';

export default function ProductsPage() {
  const { isAuthenticated, user, token } = useAuth();
  const { globalSearchQuery } = useSearch();
  const [works, setWorks] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  
  // Slider states
  const [activeSliderWork, setActiveSliderWork] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoadingArtworkDetails, setIsLoadingArtworkDetails] = useState(false);

  // Local products search is independent and artwork-only.
  const [productSearch, setProductSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('الكل');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12; // Works per page
  const totalPages = Math.ceil(totalCount / limit);

  // Close slider on escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeSlider();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const openSlider = async (work) => {
    setActiveSliderWork(work);
    setCurrentSlideIndex(0);
    setIsLoadingArtworkDetails(true);

    try {
      const res = await fetch(`/api/artworks/${work.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const contentType = res.headers.get('content-type') || '';
      const result = contentType.includes('application/json')
        ? await res.json().catch(() => ({}))
        : {};

      if (!res.ok || !result?.data?.artwork) {
        return;
      }

      setActiveSliderWork(normalizeWork(result.data.artwork));
      setCurrentSlideIndex(0);
    } catch (error) {
      console.error('Failed to fetch artwork details:', error);
    } finally {
      setIsLoadingArtworkDetails(false);
    }
  };

  const closeSlider = () => {
    setActiveSliderWork(null);
    setIsLoadingArtworkDetails(false);
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

  const [debouncedSearch, setDebouncedSearch] = useState(productSearch);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(productSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [productSearch]);

  useEffect(() => {
    const fetchWorks = async () => {
      setIsFetching(true);

      try {
        const effectiveSearch = debouncedSearch || globalSearchQuery;
        const searchBy = debouncedSearch ? 'artwork' : (globalSearchQuery ? 'global' : 'artwork');

        const queryParams = new URLSearchParams();
        if (activeCategory !== 'الكل') queryParams.append('category', activeCategory);
        if (effectiveSearch) queryParams.append('search', effectiveSearch);
        if (effectiveSearch) queryParams.append('searchBy', searchBy);
        queryParams.append('page', currentPage.toString());
        queryParams.append('limit', limit.toString());

        const res = await fetch(`/api/artworks?${queryParams.toString()}`);
        const contentType = res.headers.get('content-type') || '';
        const result = contentType.includes('application/json')
          ? await res.json().catch(() => ({}))
          : {};
        
        if (!res.ok) {
          console.error('Failed to fetch works:', res.status, result?.message);
          setWorks([]);
          setTotalCount(0);
          return;
        }

        const rawWorks = Array.isArray(result?.data?.artworks) ? result.data.artworks : [];
        setWorks(rawWorks.map(normalizeWork));
        setTotalCount(Number(result?.data?.totalCount ?? rawWorks.length) || 0);
      } catch (e) {
        console.error('Failed to fetch works:', e);
        setWorks([]);
        setTotalCount(0);
      } finally {
        setIsFetching(false);
      }
    };

    fetchWorks();
  }, [activeCategory, debouncedSearch, globalSearchQuery, currentPage]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, globalSearchQuery, activeCategory]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isOwnerArtwork = (work) => Boolean(user?.id && work?.artist_id && user.id === work.artist_id);

  return (
    <div className="min-h-screen bg-[#fdfaf7] font-amiri" dir="rtl">
      <Header />
      
      <div className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#3b2012] font-art mb-4">معرض أثر</h1>
          <p className="text-[#9c7b65] text-lg md:text-xl max-w-2xl mx-auto">
            اكتشف أروع الإبداعات الفنية من مجتمع الفنانين في أثر. تصفح، وتأمل، واقتنِ ما يلامس روحك.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 bg-white border border-[#e8dcc4] rounded-2xl px-5 py-3.5 shadow-sm focus-within:border-[#9c7b65] focus-within:shadow-md transition-all">
            <i className="fa-solid fa-magnifying-glass text-[#9c7b65]"></i>
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="ابحث باسم العمل، الفنان، أو الوصف..."
              className="flex-1 bg-transparent border-none text-[#4a3728] text-sm md:text-base focus:outline-none font-art placeholder:text-gray-400"
              dir="rtl"
            />
            {productSearch && (
              <button
                onClick={() => setProductSearch('')}
                className="text-gray-400 hover:text-[#5c4436] transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>

        {globalSearchQuery.trim() && !debouncedSearch && (
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
              <i className="fa-solid fa-globe"></i>
              نتائج البحث العام: "{globalSearchQuery.trim()}"
            </span>
          </div>
        )}

        {/* Categories Filter */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 shadow-sm ${
                activeCategory === cat 
                ? 'bg-brown-gradient text-white scale-105' 
                : 'bg-white text-[#9c7b65] border border-[#e8dcc4] hover:border-[#6b4c3b] hover:text-[#3b2012]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {isFetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-3xl h-[420px] animate-pulse border border-[#e8dcc4] p-3 flex flex-col">
                <div className="w-full h-56 bg-gray-200 rounded-2xl mb-4"></div>
                <div className="px-2 space-y-3">
                  <div className="w-3/4 h-5 bg-gray-200 rounded-full"></div>
                  <div className="w-1/2 h-4 bg-gray-200 rounded-full"></div>
                  <div className="w-full h-8 bg-gray-200 rounded-xl mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : works.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {works.map((work, index) => (
                  <motion.div
                    key={work.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (index % limit) * 0.05 }}
                    onClick={() => openSlider(work)}
                    className="group bg-white rounded-3xl overflow-hidden border border-[#e8dcc4] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] hover:shadow-xl transition-all duration-500 flex flex-col cursor-pointer"
                  >
                    <div 
                      className="relative h-64 overflow-hidden m-2 rounded-2xl"
                    >
                      <Image
                        src={work.images?.[work.mainImageIndex || 0] || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800'}
                        alt={work.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {work.images?.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                          <i className="fa-solid fa-layer-group"></i>
                          <span>{work.images.length}</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <div className="self-end bg-white/20 backdrop-blur-md border border-white/30 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-white hover:text-[#3b2012] transition-colors mb-2">
                          <i className="fa-solid fa-expand text-sm"></i>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-[#3b2012] mb-4 line-clamp-1">{work.title}</h3>
                      
                      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4" onClick={(e) => e.stopPropagation()}>
                        <span className="font-bold text-lg text-[#3b2012]">
                          {work.price ? `${work.price} ₪` : 'متاح للعرض'}
                        </span>
                        {isOwnerArtwork(work) ? (
                          <Link
                            href={`/works/edit/${work.id}`}
                            className="bg-[#f0ece6] text-[#5c4436] hover:bg-[#5c4436] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                          >
                            تعديل العمل
                          </Link>
                        ) : (
                          <button className="bg-[#f0ece6] text-[#5c4436] hover:bg-[#5c4436] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                            إضافة للسلة
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-xl border border-[#e8dcc4] bg-white text-[#9c7b65] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#6b4c3b] hover:text-[#3b2012] transition-all"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
                
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show current page, and maybe some context around it
                    if (
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-xl font-bold transition-all ${
                            currentPage === pageNum
                              ? 'bg-[#3b2012] text-white shadow-lg scale-110'
                              : 'bg-white border border-[#e8dcc4] text-[#9c7b65] hover:border-[#6b4c3b] hover:text-[#3b2012]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      (pageNum === 2 && currentPage > 3) ||
                      (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return <span key={pageNum} className="text-[#ceb29f]">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-xl border border-[#e8dcc4] bg-white text-[#9c7b65] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#6b4c3b] hover:text-[#3b2012] transition-all"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-[#e8dcc4] text-center">
            <i className="fa-regular fa-folder-open text-6xl text-[#ceb29f] mb-4"></i>
            <h3 className="text-2xl font-bold text-[#3b2012] font-art mb-2">لا توجد أعمال لعرضها</h3>
            <p className="text-[#9c7b65]">حاول تصفح قسم آخر أو العودة لاحقاً لاكتشاف إبداعات جديدة.</p>
          </div>
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
                className="bg-white w-full max-w-5xl h-[92vh] md:max-h-[90vh] md:h-auto overflow-hidden rounded-[2rem] md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row relative"
              >
                {/* Close Button */}
                <button 
                  onClick={closeSlider}
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

                {/* Right Side: Details / Protected Content */}
                <div className="md:w-1/2 flex-1 min-h-0 p-5 md:p-10 overflow-y-auto bg-white flex flex-col no-scrollbar">
                  {isLoadingArtworkDetails ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-6 animate-pulse">
                      <div className="w-16 h-16 border-4 border-[#3b2012] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[#9c7b65] font-bold">جاري تحميل تفاصيل العمل الفني...</p>
                    </div>
                  ) : !isAuthenticated ? (
                    <div className="space-y-5 md:space-y-8 animate-fade-in">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <i className="fa-solid fa-tag text-[8px]"></i>
                            <span>الفئة: {categoryMapping[activeSliderWork.category] || activeSliderWork.category || 'متنوع'}</span>
                          </span>
                          <span className="text-[10px] bg-[#f0ece6] text-[#6b4c3b] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                            عرض للزوار
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-bold text-[#3b2012] font-art leading-tight">
                          {activeSliderWork.title}
                        </h2>
                      </div>

                      <div className="p-6 bg-[#fdfaf7] rounded-[2rem] border border-[#e8dcc4]/50 space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-brown-gradient rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                            {(activeSliderWork.artistName || 'ف').charAt(0)}
                          </div>
                          <div className="flex-1">
                             <p className="text-xs text-[#9c7b65] mb-0.5">الفنان المبدع</p>
                             <p className="text-lg font-bold text-[#3b2012]">{activeSliderWork.artistName || 'غير متوفر'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Link href="/login" className="relative overflow-hidden bg-white p-4 rounded-2xl border border-[#e8dcc4]/30 shadow-sm flex items-center gap-3 group">
                             <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                               <i className="fa-solid fa-location-dot"></i>
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-gray-400">الموقع</p>
                                <div className="relative mt-1">
                                  <p className="text-sm font-bold text-[#3b2012] blur-sm select-none">معلومات الموقع مخفية للزوار</p>
                                  <div className="absolute inset-0 flex items-center justify-end">
                                    <span className="inline-flex items-center gap-1 bg-white/90 text-[#6b4c3b] text-[10px] font-bold px-2 py-1 rounded-full border border-[#e8dcc4]">
                                      <i className="fa-solid fa-lock text-[9px]"></i>
                                       سجل الدخول أولا
                                    </span>
                                  </div>
                                </div>
                             </div>
                          </Link>
                          <Link href="/login" className="relative overflow-hidden bg-white p-4 rounded-2xl border border-[#e8dcc4]/30 shadow-sm flex items-center gap-3 group">
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
                                        سجل الدخول أولا  
                                    </span>
                                  </div>
                                </div>
                             </div>
                          </Link>
                        </div>

                        <Link href="/login" className="bg-white/80 border border-[#e8dcc4] hover:border-[#6b4c3b] hover:bg-[#fdfaf7] rounded-2xl p-4 flex items-start gap-3 transition-colors cursor-pointer">
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
                        <p className="text-[#9c7b65] text-lg leading-relaxed font-amiri">
                          {activeSliderWork.description}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold bg-gray-50 inline-block px-3 py-1 rounded-md">
                           تاريخ النشر: {activeSliderWork.createdAt ? new Date(activeSliderWork.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير متوفر'}
                        </p>
                      </div>

                      <div className="pt-8 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                         <div className="space-y-1">
                            <p className="text-xs text-gray-400 font-bold">السعر المطلوب</p>
                            <p className="text-3xl font-black text-[#3b2012]">
                              {activeSliderWork.price ? `${activeSliderWork.price} ₪` : 'حسب الطلب'}
                            </p>
                         </div>
                         <div className="flex gap-3 flex-wrap">
                           <Link 
                             href="/signup" 
                             className="h-14 px-6 bg-brown-gradient rounded-2xl flex items-center justify-center text-white font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
                           >
                             إنشاء حساب
                           </Link>
                           <Link 
                             href="/login" 
                             className="h-14 px-6 bg-[#f0ece6] text-[#6b4c3b] rounded-2xl font-bold flex items-center justify-center hover:bg-[#e8dcc4] transition-all"
                           >
                             تسجيل الدخول
                           </Link>
                         </div>
                      </div>
                    </div>
                  ) : isOwnerArtwork(activeSliderWork) ? (
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
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-brown-gradient rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                            {user?.artistAvatar || user?.firstName?.charAt(0) || 'أ'}
                          </div>
                          <div className="flex-1">
                             <p className="text-xs text-[#9c7b65] mb-0.5">الفنان (أنت)</p>
                             <p className="text-lg font-bold text-[#3b2012]">{user?.artistName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()}</p>
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
                           تاريخ النشر: {activeSliderWork.created_at ? new Date(activeSliderWork.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير متوفر'}
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
                  ) : (
                    <div className="space-y-8 animate-fade-in">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <i className="fa-solid fa-tag text-[8px]"></i>
                            <span>الفئة: {categoryMapping[activeSliderWork.category] || activeSliderWork.category || 'متنوع'}</span>
                          </span>
                        </div>
                        <h2 className="text-4xl font-bold text-[#3b2012] font-art leading-tight">
                          {activeSliderWork.title}
                        </h2>
                      </div>

                      <div className="p-6 bg-[#fdfaf7] rounded-[2rem] border border-[#e8dcc4]/50 space-y-6">
                        {/* Artist Box */}
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-brown-gradient rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                            {activeSliderWork.artistAvatar || (activeSliderWork.artistName ? activeSliderWork.artistName.charAt(0) : 'ف')}
                          </div>
                          <div className="flex-1">
                             <p className="text-xs text-[#9c7b65] mb-0.5">الفنان المبدع</p>
                             <p className="text-lg font-bold text-[#3b2012]">{activeSliderWork.artistName || 'غير متوفر'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-2xl border border-[#e8dcc4]/30 shadow-sm flex items-center gap-3 group">
                             <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                               <i className="fa-solid fa-location-dot"></i>
                             </div>
                             <div>
                                <p className="text-[10px] text-gray-400">الموقع</p>
                                <p className="text-sm font-bold text-[#3b2012]">{activeSliderWork.artistLocation || activeSliderWork.location || 'نابلس، فلسطين'}</p>
                             </div>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-[#e8dcc4]/30 shadow-sm flex items-center gap-3 group">
                             <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
                               <i className="fa-solid fa-phone"></i>
                             </div>
                             <div>
                                <p className="text-[10px] text-gray-400">رقم التواصل</p>
                                <p className="text-sm font-bold text-[#3b2012] font-mono tracking-wider" dir="ltr">{activeSliderWork.artistPhone || '059xxxxxxx'}</p>
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
                      </div>

                      <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
                         <div className="space-y-1">
                            <p className="text-xs text-gray-400 font-bold">السعر المطلوب</p>
                            <p className="text-3xl font-black text-[#3b2012]">
                              {activeSliderWork.price ? `${activeSliderWork.price} ₪` : 'حسب الطلب'}
                            </p>
                         </div>
                         {isOwnerArtwork(activeSliderWork) ? (
                           <Link
                             href={`/works/edit/${activeSliderWork.id}`}
                             className="h-14 px-10 bg-[#3b2012] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-[#5c3d2e] transition-all active:scale-95"
                           >
                             <span>تعديل العمل</span>
                             <i className="fa-solid fa-pen-to-square"></i>
                           </Link>
                         ) : (
                           <button className="h-14 px-10 bg-[#3b2012] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-[#5c3d2e] transition-all active:scale-95 group">
                              <span>إضافة للسلة</span>
                              <i className="fa-solid fa-bag-shopping transition-transform group-hover:-translate-y-1"></i>
                           </button>
                         )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
