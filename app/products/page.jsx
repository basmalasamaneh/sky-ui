"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useSearch } from '@/contexts/SearchContext';
import { categories, normalizeWork } from '@/lib/artwork-utils';
import ArtworkDetailModal from '@/components/ArtworkDetailModal';

export default function ProductsPage() {
  const { isAuthenticated, user, token } = useAuth();
  const { addItem } = useCart();
  const {
    marketplaceSearchQuery,
    setMarketplaceSearchQuery,
    clearMarketplaceSearch,
    clearGlobalSearch,
  } = useSearch();
  const [works, setWorks] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  
  // Slider states
  const [activeSliderWork, setActiveSliderWork] = useState(null);
  const [isLoadingArtworkDetails, setIsLoadingArtworkDetails] = useState(false);

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

  const [debouncedSearch, setDebouncedSearch] = useState(marketplaceSearchQuery);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(marketplaceSearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [marketplaceSearchQuery]);

  useEffect(() => {
    clearGlobalSearch();

    return () => {
      clearMarketplaceSearch();
    };
  }, [clearGlobalSearch, clearMarketplaceSearch]);

  useEffect(() => {
    const fetchWorks = async () => {
      setIsFetching(true);

      try {
        const queryParams = new URLSearchParams();
        if (activeCategory !== 'الكل') queryParams.append('category', activeCategory);
        if (debouncedSearch) queryParams.append('search', debouncedSearch);
        if (debouncedSearch) queryParams.append('searchBy', 'artwork');
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
  }, [activeCategory, debouncedSearch, currentPage]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeCategory]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isOwnerArtwork = (work) => Boolean(user?.id && work?.artist_id && user.id === work.artist_id);

  return (
    <div className="min-h-screen bg-[#fdfaf7] dark:bg-black font-amiri" dir="rtl">
      <Header />
      
      <div className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#3b2012] dark:text-[#e8dcc4] font-art mb-4">معرض أثر</h1>
          <p className="text-[#9c7b65] dark:text-[#e8dcc4] text-lg md:text-xl max-w-2xl mx-auto">
            اكتشف أروع الإبداعات الفنية من مجتمع الفنانين في أثر. تصفح، وتأمل، واقتنِ ما يلامس روحك.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto transition-all duration-300">
          <div className="flex items-center gap-3 bg-white dark:bg-black border border-[#e8dcc4] dark:border-gray-800 rounded-2xl px-5 py-3.5 shadow-sm focus-within:border-[#9c7b65] focus-within:shadow-md transition-all">
            <i className="fa-solid fa-magnifying-glass text-[#9c7b65] dark:text-[#e8dcc4]"></i>
            <input
              type="text"
              value={marketplaceSearchQuery}
              onChange={(e) => setMarketplaceSearchQuery(e.target.value)}
              placeholder="ابحث باسم العمل أو الوصف..."
              className="flex-1 bg-transparent border-none text-[#4a3728] dark:text-[#e8dcc4] text-sm md:text-base focus:outline-none font-art placeholder:text-gray-400"
              dir="rtl"
            />
            {marketplaceSearchQuery && (
              <button
                onClick={() => clearMarketplaceSearch()}
                className="text-gray-400 hover:text-[#5c4436] dark:text-[#e8dcc4] transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>

        {/* Categories Filter */}
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

        {/* Gallery Grid */}
        {isFetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white dark:bg-black rounded-3xl h-[420px] animate-pulse border border-[#e8dcc4] dark:border-gray-800 p-3 flex flex-col">
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
                    className="group bg-white dark:bg-black rounded-3xl overflow-hidden border border-[#e8dcc4] dark:border-gray-800 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] hover:shadow-xl transition-all duration-500 flex flex-col cursor-pointer"
                  >
                      <div 
                        className="relative h-64 overflow-hidden m-2 rounded-2xl"
                      >
                        <Image
                          src={work.images?.[work.mainImageIndex || 0] || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800'}
                          alt={work.title}
                          fill
                          className={`object-cover transition-transform duration-700 group-hover:scale-110 ${work.quantity <= 0 ? 'grayscale opacity-60' : ''}`}
                        />

                        {work.quantity <= 0 && (
                          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl z-10">
                            نفذت الكمية
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                          <div className="self-end bg-white dark:bg-black dark:black/20 dark:bg-black/20 backdrop-blur-md border border-white/30 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-white dark:bg-black hover:text-[#3b2012] dark:text-[#e8dcc4] transition-colors mb-2">
                            <i className="fa-solid fa-expand text-sm"></i>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <h3 className={`text-lg font-bold text-[#3b2012] dark:text-[#e8dcc4] mb-4 line-clamp-1 ${work.quantity <= 0 ? 'opacity-50' : ''}`}>{work.title}</h3>
                        
                        <div className="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-gray-800 dark:border-gray-800 pt-4" onClick={(e) => e.stopPropagation()}>
                          <span className={`font-bold text-lg text-[#3b2012] dark:text-[#e8dcc4] ${work.quantity <= 0 ? 'opacity-50 line-through' : ''}`}>
                            {work.price ? `${work.price} ₪` : 'متاح للعرض'}
                          </span>
                          {isOwnerArtwork(work) ? (
                            <Link
                              href={`/works/edit/${work.id}`}
                              className="bg-[#f0ece6] dark:bg-black text-[#5c4436] dark:text-[#e8dcc4] hover:bg-[#5c4436] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                            >
                              تعديل العمل
                            </Link>
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
                            disabled={work.quantity <= 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              addItem({
                                id: work.id,
                                title: work.title,
                                price: work.price,
                                image: work.images?.[0],
                                artistName: work.artistName
                              });
                            }}
                            className={`bg-[#f0ece6] dark:bg-black text-[#5c4436] dark:text-[#e8dcc4] px-4 py-2 rounded-xl text-xs font-bold transition-colors ${work.quantity <= 0 ? 'opacity-50 cursor-not-allowed line-through' : 'hover:bg-[#5c4436] hover:text-white'}`}
                          >
                            {work.quantity <= 0 ? 'مباع' : 'إضافة للسلة'}
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
                  className="w-10 h-10 rounded-xl border border-[#e8dcc4] dark:border-gray-800 bg-white dark:bg-black text-[#9c7b65] dark:text-[#e8dcc4] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#6b4c3b] hover:text-[#3b2012] dark:text-[#e8dcc4] transition-all"
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
                              : 'bg-white dark:bg-black border border-[#e8dcc4] dark:border-gray-800 text-[#9c7b65] dark:text-[#e8dcc4] hover:border-[#6b4c3b] hover:text-[#3b2012] dark:text-[#e8dcc4]'
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
                  className="w-10 h-10 rounded-xl border border-[#e8dcc4] dark:border-gray-800 bg-white dark:bg-black text-[#9c7b65] dark:text-[#e8dcc4] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#6b4c3b] hover:text-[#3b2012] dark:text-[#e8dcc4] transition-all"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-black rounded-3xl border border-[#e8dcc4] dark:border-gray-800 text-center">
            <i className="fa-regular fa-folder-open text-6xl text-[#ceb29f] mb-4"></i>
            <h3 className="text-2xl font-bold text-[#3b2012] dark:text-[#e8dcc4] font-art mb-2">لا توجد أعمال لعرضها</h3>
            <p className="text-[#9c7b65] dark:text-[#e8dcc4]">حاول تصفح قسم آخر أو العودة لاحقاً لاكتشاف إبداعات جديدة.</p>
          </div>
        )}

        {/* Global Product Detail Modal */}
        <AnimatePresence>
          {activeSliderWork && (
            <ArtworkDetailModal
              work={activeSliderWork}
              isLoadingDetails={isLoadingArtworkDetails}
              onClose={closeSlider}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
