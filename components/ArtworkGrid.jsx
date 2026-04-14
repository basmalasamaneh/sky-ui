"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSearch } from '@/contexts/SearchContext';
import { normalizeWork, categoryMapping, categories } from '@/lib/artwork-utils';

export const ArtworkGrid = ({ limit = null, showCategories = true, title = null }) => {
  const { isAuthenticated, user, token } = useAuth();
  const { globalSearchQuery } = useSearch();
  const [works, setWorks] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [debouncedGlobalSearch, setDebouncedGlobalSearch] = useState(globalSearchQuery || '');
  
  // Slider states
  const [activeSliderWork, setActiveSliderWork] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoadingArtworkDetails, setIsLoadingArtworkDetails] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedGlobalSearch(globalSearchQuery || '');
    }, 400);

    return () => clearTimeout(timer);
  }, [globalSearchQuery]);

  useEffect(() => {
    const fetchAllWorks = async () => {
      setIsFetching(true);
      try {
        const queryParams = new URLSearchParams();
        if (activeCategory !== 'الكل') queryParams.append('category', activeCategory);
        if (debouncedGlobalSearch.trim()) {
          queryParams.append('search', debouncedGlobalSearch.trim());
          queryParams.append('searchBy', 'global');
        }
        if (limit) queryParams.append('limit', String(limit));

        const query = queryParams.toString();
        const res = await fetch(`/api/artworks${query ? `?${query}` : ''}`);
        const contentType = res.headers.get('content-type') || '';
        const result = contentType.includes('application/json')
          ? await res.json().catch(() => ({}))
          : {};
        if (!res.ok) {
          setWorks([]);
          return;
        }
        const rawWorks = Array.isArray(result?.data?.artworks) ? result.data.artworks : [];
        setWorks(rawWorks.map(normalizeWork));
      } catch (e) {
        console.error('Failed to fetch works:', e);
        setWorks([]);
      } finally {
        setIsFetching(false);
      }
    };

    fetchAllWorks();
  }, [activeCategory, debouncedGlobalSearch, limit]);

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

      if (res.ok && result?.data?.artwork) {
        setActiveSliderWork(normalizeWork(result.data.artwork));
      }
    } catch (error) {
      console.error('Failed to fetch artwork details:', error);
    } finally {
      setIsLoadingArtworkDetails(false);
    }
  };

  const displayedWorks = works;

  const isOwnerArtwork = (work) => Boolean(user?.id && work?.artist_id && user.id === work.artist_id);

  if (!isFetching && displayedWorks.length === 0 && !debouncedGlobalSearch.trim() && activeCategory === 'الكل') {
    return null;
  }

  return (
    <div className="py-10">
      {title && (
        <h2 className="text-3xl font-bold text-[#3b2012] font-art mb-8 text-center">{title}</h2>
      )}

      {showCategories && (
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
      )}

      {isFetching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-3xl h-[420px] animate-pulse border border-[#e8dcc4] p-3 flex flex-col">
              <div className="w-full h-56 bg-gray-200 rounded-2xl mb-4"></div>
              <div className="px-2 space-y-3">
                <div className="w-3/4 h-5 bg-gray-200 rounded-full"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : displayedWorks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {displayedWorks.map((work, index) => (
              <motion.div
                key={work.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (index % 10) * 0.05 }}
                onClick={() => openSlider(work)}
                className="group bg-white rounded-3xl overflow-hidden border border-[#e8dcc4] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] hover:shadow-xl transition-all duration-500 flex flex-col cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden m-2 rounded-2xl">
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
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-[#3b2012] mb-4 line-clamp-1">{work.title}</h3>
                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4" onClick={(e) => e.stopPropagation()}>
                    <span className="font-bold text-lg text-[#3b2012]">
                      {work.price ? `${work.price} ₪` : 'متاح للعرض'}
                    </span>
                    {isOwnerArtwork(work) ? (
                      <Link href={`/works/edit/${work.id}`} className="bg-[#f0ece6] text-[#5c4436] hover:bg-[#5c4436] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">تعديل العمل</Link>
                    ) : (
                      <button className="bg-[#f0ece6] text-[#5c4436] hover:bg-[#5c4436] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">إضافة للسلة</button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-[#e8dcc4] text-center">
          <i className="fa-regular fa-folder-open text-6xl text-[#ceb29f] mb-4"></i>
          <h3 className="text-2xl font-bold text-[#3b2012] font-art mb-2">لا توجد نتائج بحث</h3>
          <p className="text-[#9c7b65]">حاول البحث بكلمات أخرى أو تصفح فئة مختلفة.</p>
        </div>
      )}

      {/* Modal is shared here */}
      <AnimatePresence>
        {activeSliderWork && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveSliderWork(null)}
          >
            {/* Simple Modal Content for brevity in this component, or move full modal logic here */}
            {/* For now, I'll just close it. Ideally, you'd have a separate ArtworkModal component */}
            <div 
              className="bg-white w-full max-w-5xl h-[90vh] overflow-hidden rounded-[2rem] shadow-2xl relative flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
               <button 
                onClick={() => setActiveSliderWork(null)}
                className="absolute top-6 left-6 z-50 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-[#3b2012] shadow-md"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
              
              <div className="md:w-1/2 bg-[#fdfaf7] relative h-[40vh] md:h-auto">
                 <Image
                    src={activeSliderWork.images?.[0] || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800'}
                    alt={activeSliderWork.title}
                    fill
                    className="object-contain p-4"
                  />
              </div>
              
              <div className="md:w-1/2 p-8 overflow-y-auto">
                <h2 className="text-3xl font-bold text-[#3b2012] mb-4">{activeSliderWork.title}</h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-brown-gradient rounded-full flex items-center justify-center text-white font-bold">{activeSliderWork.artistName?.charAt(0)}</div>
                  <div>
                    <p className="text-xs text-[#9c7b65]">الفنان</p>
                    <p className="font-bold text-[#3b2012]">{activeSliderWork.artistName}</p>
                  </div>
                </div>
                <p className="text-[#9c7b65] leading-relaxed mb-8">{activeSliderWork.description}</p>
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-3xl font-black text-[#3b2012]">{activeSliderWork.price} ₪</p>
                  <button className="h-14 px-8 bg-[#3b2012] text-white rounded-2xl font-bold">إضافة للسلة</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
