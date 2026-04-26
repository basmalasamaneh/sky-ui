"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSearch } from '@/contexts/SearchContext';
import { normalizeWork, categories } from '@/lib/artwork-utils';
import ArtworkDetailModal from '@/components/ArtworkDetailModal';
import { useCart } from '@/contexts/CartContext';

export const ArtworkGrid = ({ limit = null, showCategories = true, title = null }) => {
  const { isAuthenticated, user, token } = useAuth();
  const { globalSearchQuery } = useSearch();
  const { addItem } = useCart();
  const [works, setWorks] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [debouncedGlobalSearch, setDebouncedGlobalSearch] = useState(globalSearchQuery || '');
  
  // Slider states
  const [activeSliderWork, setActiveSliderWork] = useState(null);
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
        const res = await fetch(`/api/v1/artworks${query ? `?${query}` : ''}`);
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
    setIsLoadingArtworkDetails(true);

    try {
      const res = await fetch(`/api/v1/artworks/${work.id}`, {
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
        <h2 className="text-3xl font-bold text-[#3b2012] dark:text-[#e8dcc4] font-art mb-8 text-center">{title}</h2>
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
                : 'bg-white dark:bg-black text-[#9c7b65] dark:text-[#e8dcc4] border border-[#e8dcc4] dark:border-gray-800 hover:border-[#6b4c3b] hover:text-[#3b2012] dark:text-[#e8dcc4]'
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
            <div key={i} className="bg-white dark:bg-black rounded-3xl h-[420px] animate-pulse border border-[#e8dcc4] dark:border-gray-800 p-3 flex flex-col">
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
                className="group bg-white dark:bg-black rounded-3xl overflow-hidden border border-[#e8dcc4] dark:border-gray-800 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] hover:shadow-xl transition-all duration-500 flex flex-col cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden m-2 rounded-2xl">
                  <Image
                    src={work.images?.[work.mainImageIndex || 0] || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800'}
                    alt={work.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-[#3b2012] dark:text-[#e8dcc4] mb-4 line-clamp-1">{work.title}</h3>
                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-gray-800 dark:border-gray-800 pt-4" onClick={(e) => e.stopPropagation()}>
                    <span className="font-bold text-lg text-[#3b2012] dark:text-[#e8dcc4]">
                      {work.price ? `${work.price} ₪` : 'متاح للعرض'}
                    </span>
                    {isOwnerArtwork(work) ? (
                      <Link href={`/works/edit/${work.id}`} className="bg-[#f0ece6] dark:bg-black text-[#5c4436] dark:text-[#e8dcc4] hover:bg-[#5c4436] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">تعديل العمل</Link>
                    ) : !isAuthenticated ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openSlider(work);
                        }}
                        className="bg-[#f0ece6] dark:bg-black text-[#5c4436] dark:text-[#e8dcc4] hover:bg-[#5c4436] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                      >
                        تسوق الآن
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem({
                            id: work.id,
                            title: work.title,
                            price: work.price,
                            image: work.images?.[0] || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800',
                            artistName: work.artistName
                          });
                        }}
                        className="bg-[#f0ece6] dark:bg-black text-[#5c4436] dark:text-[#e8dcc4] hover:bg-[#5c4436] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                      >
                        إضافة للسلة
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-black rounded-3xl border border-[#e8dcc4] dark:border-gray-800 text-center">
          <i className="fa-regular fa-folder-open text-6xl text-[#ceb29f] mb-4"></i>
          <h3 className="text-2xl font-bold text-[#3b2012] dark:text-[#e8dcc4] font-art mb-2">لا توجد نتائج بحث</h3>
          <p className="text-[#9c7b65] dark:text-[#e8dcc4]">حاول البحث بكلمات أخرى أو تصفح فئة مختلفة.</p>
        </div>
      )}

      {/* Artwork Detail Modal */}
      <AnimatePresence>
        {activeSliderWork && (
          <ArtworkDetailModal
            work={activeSliderWork}
            isLoadingDetails={isLoadingArtworkDetails}
            onClose={() => { setActiveSliderWork(null); setIsLoadingArtworkDetails(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
