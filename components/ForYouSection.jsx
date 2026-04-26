"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { normalizeWork } from '@/lib/artwork-utils';
import { useAuth } from '@/contexts/AuthContext';
import ArtworkDetailModal from '@/components/ArtworkDetailModal';

export const ForYouSection = () => {
  const { token } = useAuth();
  const [works, setWorks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeWork, setActiveWork] = useState(null);
  const [isLoadingArtworkDetails, setIsLoadingArtworkDetails] = useState(false);

  useEffect(() => {
    const fetchForYou = async () => {
      try {
        const res = await fetch('/api/v1/artworks');
        const result = await res.json();
        if (res.ok && result?.data?.artworks) {
          // Just take 3 or 4 random or latest works for "For You"
          const shuffled = result.data.artworks
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(normalizeWork);
          setWorks(shuffled);
        }
      } catch (error) {
        console.error('Failed to fetch For You works:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchForYou();
  }, []);

  const openArtworkDetails = async (work) => {
    setActiveWork(work);
    setIsLoadingArtworkDetails(true);

    try {
      const res = await fetch(`/api/v1/artworks/${work.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const contentType = res.headers.get('content-type') || '';
      const result = contentType.includes('application/json')
        ? await res.json().catch(() => ({}))
        : {};

      if (!res.ok || !result?.data?.artwork) {
        return;
      }

      setActiveWork(normalizeWork(result.data.artwork));
    } catch (error) {
      console.error('Failed to fetch artwork details:', error);
    } finally {
      setIsLoadingArtworkDetails(false);
    }
  };

  if (!isLoading && works.length === 0) return null;

  return (
    <section className="py-24 bg-white dark:bg-black overflow-hidden" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <span className="inline-block px-4 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full tracking-widest uppercase">
              لك أنت
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#1a0f0a] dark:text-[#e8dcc4] font-art leading-tight">
              قطع مختارة <br />
              <span className="text-[#9c7b65] dark:text-[#e8dcc4]">تلائم ذوقك الرفيع</span>
            </h2>
          </div>
          <Link href="/products" className="group flex items-center gap-3 text-[#1a0f0a] dark:text-[#e8dcc4] font-bold hover:text-[#9c7b65] dark:text-[#e8dcc4] transition-colors">
            <span>اكتشف المزيد</span>
            <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 dark:border-gray-700 flex items-center justify-center group-hover:bg-[#1a0f0a] group-hover:text-white transition-all">
              <i className="fa-solid fa-arrow-left text-xs"></i>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-[500px] bg-gray-50 dark:bg-gray-900 rounded-[3rem] animate-pulse"></div>
            ))
          ) : (
            works.map((work, index) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                onClick={() => openArtworkDetails(work)}
                className="group relative h-[550px] rounded-[3rem] overflow-hidden shadow-2xl hover:shadow-amber-900/10 transition-all duration-700 cursor-pointer"
              >
                {/* Background Image */}
                <Image
                  src={work.images?.[0] || '/images/hero-bg.jpg'}
                  alt={work.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                {/* Content */}
                <div className="absolute inset-0 p-10 flex flex-col justify-end text-white text-right">
                  <div className="space-y-4 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-3">
                      <span className="bg-white dark:bg-black dark:black/20 dark:bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/30">
                        {work.category}
                      </span>
                    </div>
                    
                    <h3 className="text-3xl font-bold font-art leading-tight">
                      {work.title}
                    </h3>
                    
                    <p className="text-white/70 text-sm line-clamp-2 font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                      {work.description}
                    </p>

                    <div className="pt-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity delay-200">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-white/50 font-bold uppercase">السعر</span>
                        <span className="text-2xl font-black md:text-3xl">
                          {work.price ? `${work.price} ₪` : 'حسب الطلب'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openArtworkDetails(work);
                        }}
                        className="bg-white dark:bg-black text-[#1a0f0a] dark:text-[#e8dcc4] px-6 py-3 rounded-2xl font-bold text-sm hover:bg-amber-50 transition-colors shadow-lg"
                      >
                        تفاصيل العمل
                      </button>
                    </div>
                  </div>
                </div>

                {/* Artist Badge */}
                <div className="absolute top-8 right-8 flex items-center gap-3 bg-white dark:bg-black dark:black/10 dark:bg-black/10 backdrop-blur-xl p-2 pr-4 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                   <div className="text-right">
                      <p className="text-[10px] text-white/60">بأنامل المبدع</p>
                      <p className="text-xs font-bold text-white leading-none">{work.artistName}</p>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-white dark:bg-black flex items-center justify-center text-[#1a0f0a] dark:text-[#e8dcc4] font-bold text-xs uppercase shadow-inner">
                      {work.artistName?.charAt(0)}
                   </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <AnimatePresence>
          {activeWork && (
            <ArtworkDetailModal
              work={activeWork}
              isLoadingDetails={isLoadingArtworkDetails}
              onClose={() => {
                setActiveWork(null);
                setIsLoadingArtworkDetails(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
