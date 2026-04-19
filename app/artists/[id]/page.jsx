"use client";

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeWork } from '@/lib/artwork-utils';
import ArtworkDetailModal from '@/components/ArtworkDetailModal';

export default function ArtistPage({ params }) {
  const resolvedParams = use(params);
  const artistId = resolvedParams.id;
  const { token, isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [artistData, setArtistData] = useState(null);
  const [works, setWorks] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [activeSliderWork, setActiveSliderWork] = useState(null);
  const [isLoadingArtworkDetails, setIsLoadingArtworkDetails] = useState(false);

  useEffect(() => {
    const fetchArtistDataAndWorks = async () => {
      setIsFetching(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        // Fetch artworks belonging to this artist to get works AND artist info
        const res = await fetch(`/api/artworks?artist_id=${artistId}`, { headers });
        const contentType = res.headers.get('content-type') || '';
        const result = contentType.includes('application/json') ? await res.json().catch(() => ({})) : {};

        if (res.ok && result?.data?.artworks) {
          const rawWorks = result.data.artworks;
          const normalized = rawWorks.map(normalizeWork);
          setWorks(normalized);

          if (normalized.length > 0) {
            const firstWork = normalized[0];
            setArtistData({
              id: artistId,
              name: firstWork.artistName || 'غير متوفر',
              location: firstWork.artistLocation || null,
              phone: firstWork.artistPhone || null,
              bio: firstWork.artistBio || 'أهلاً بكم في مساحتي الفنية الخاصة! 🎨 أنا فنان شغوف بتقديم أعمال تلامس الروح وتجسد الجمال بلمسات فريدة. أؤمن أن الفن لغة عالمية لا تحتاج إلى ترجمة. أتمنى أن تجدوا في أعمالي ما يبهجكم ويضيف لمسة سحرية لأيامكم.',
              socialMedia: firstWork.artistSocialMedia?.length > 0 ? firstWork.artistSocialMedia : [
                { platform: 'instagram', url: 'https://instagram.com' },
                { platform: 'facebook', url: 'https://facebook.com' },
                { platform: 'linkedin', url: 'https://linkedin.com' }
              ],
              // Fallback simulated avatar since no backend image field exists
              avatar: firstWork.artistAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstWork.artistName || 'ف')}&background=5c4436&color=fff&size=200&font-size=0.4&bold=true`,
            });
          }
        }
      } catch (e) {
        console.error('Failed to fetch artist details:', e);
      } finally {
        setIsFetching(false);
      }
    };

    fetchArtistDataAndWorks();
  }, [artistId, token]);

  const openSlider = async (work) => {
    setActiveSliderWork(work);
    setIsLoadingArtworkDetails(true);

    try {
      const res = await fetch(`/api/artworks/${work.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const contentType = res.headers.get('content-type') || '';
      const result = contentType.includes('application/json') ? await res.json().catch(() => ({})) : {};

      if (res.ok && result?.data?.artwork) {
        setActiveSliderWork(normalizeWork(result.data.artwork));
      }
    } catch (error) {
      console.error('Failed to fetch artwork details:', error);
    } finally {
      setIsLoadingArtworkDetails(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#faf8f5] py-12 px-4 sm:px-6 lg:px-8 font-art" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-[#9c7b65] hover:text-[#5c4436] font-bold mb-8 transition-colors group border-none bg-transparent cursor-pointer">
          <i className="fa-solid fa-arrow-right group-hover:-translate-x-1 transition-transform"></i>
          الرجوع
        </button>

        {isFetching ? (
          <div className="space-y-10">
            {/* Skeleton Profile */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8 animate-pulse border border-[#e8dcc4]">
              <div className="w-32 h-32 bg-gray-200 rounded-full shrink-0"></div>
              <div className="flex-1 space-y-4 w-full">
                <div className="h-8 bg-gray-200 rounded-md w-1/3 mx-auto md:mx-0"></div>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                  <div className="h-4 bg-gray-200 rounded-md w-24"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-24"></div>
                </div>
              </div>
            </div>
          </div>
        ) : !artistData ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-[#e8dcc4] shadow-sm">
            <i className="fa-solid fa-user-slash text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-2xl font-bold text-[#3b2012]">لم يتم العثور على الفنان</h2>
            <p className="text-[#9c7b65] mt-2">قد يكون هذا الفنان غير موجود أو لا يملك أعمالاً حالياً.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Artist Profile Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#e8dcc4] flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden"
            >
              <div className="w-32 h-32 relative rounded-full overflow-hidden shrink-0 border-4 border-white shadow-xl bg-[#fdfaf7] flex items-center justify-center -mt-16 md:mt-0 group/profilepic">
                <img src={artistData.avatar} alt={artistData.name} className="w-full h-full object-cover transition-transform group-hover/profilepic:scale-105" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/profilepic:opacity-100 transition-opacity cursor-pointer">
                  <i className="fa-solid fa-camera text-white text-2xl"></i>
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const url = URL.createObjectURL(e.target.files[0]);
                      setArtistData(prev => ({ ...prev, avatar: url }));
                    }
                  }}
                  title="تغيير الصورة الشخصية (يتم التغيير شكلياً فقط)"
                />
              </div>
              
              <div className="flex-1 text-center md:text-right space-y-4 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                      <h1 className="text-3xl md:text-4xl font-bold text-[#3b2012]">{artistData.name}</h1>
                      <div className="text-[#fdfaf7] bg-blue-500 rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-sm shadow-md mt-1" title="فنان موثق">
                        <i className="fa-solid fa-check"></i>
                      </div>
                    </div>
                    <p className="text-[#9c7b65] font-medium text-lg">فنان مبدع</p>
                    {artistData.bio && (
                      <p className="text-[#5c4436] text-sm leading-relaxed mt-4 p-4 bg-[#fcfbf9] rounded-xl border border-[#e8dcc4]/50 max-w-2xl mx-auto md:mx-0">
                        {artistData.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-6 border-t border-gray-100">
                  <div className="bg-[#fcfbf9] border border-[#e8dcc4] rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold mb-0.5">الموقع</span>
                      {artistData.location ? (
                        <span className="text-sm font-bold text-[#3b2012]">{artistData.location}</span>
                      ) : !isAuthenticated ? (
                        <span className="text-xs font-bold text-[#9c7b65]"><i className="fa-solid fa-lock text-[10px] ml-1"></i> معلومات مخفية للزوار</span>
                      ) : (
                        <span className="text-xs text-gray-400">غير محدد</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#fcfbf9] border border-[#e8dcc4] rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-phone"></i>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold mb-0.5">رقم التواصل</span>
                      {artistData.phone ? (
                        <span className="text-sm font-bold text-[#3b2012]" dir="ltr">{artistData.phone}</span>
                      ) : !isAuthenticated ? (
                        <span className="text-xs font-bold text-[#9c7b65]"><i className="fa-solid fa-lock text-[10px] ml-1"></i> معلومات مخفية للزوار</span>
                      ) : (
                        <span className="text-xs text-gray-400">غير محدد</span>
                      )}
                    </div>
                  </div>
                  
                  {artistData.socialMedia && artistData.socialMedia.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      {artistData.socialMedia.map((social, index) => {
                        let icon = 'fa-link';
                        let colorClass = 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-[#e8dcc4]';
                        const p = social.platform?.toLowerCase();
                        
                        if (p === 'instagram') { icon = 'fa-instagram'; colorClass = 'bg-pink-50 text-pink-600 hover:bg-pink-100 hover:text-pink-700 border-pink-100'; }
                        else if (p === 'facebook') { icon = 'fa-facebook-f'; colorClass = 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-100'; }
                        else if (p === 'x') { icon = 'fa-x-twitter'; colorClass = 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-black border-gray-200'; }
                        else if (p === 'linkedin') { icon = 'fa-linkedin-in'; colorClass = 'bg-blue-50 text-blue-800 hover:bg-blue-100 hover:text-blue-900 border-blue-200'; }
                        else if (p === 'pinterest') { icon = 'fa-pinterest-p'; colorClass = 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-100'; }

                        return (
                          <a 
                            key={index} 
                            href={social.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            title={social.platform} 
                            className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm ${colorClass}`}
                          >
                            <i className={`fa-brands ${icon} text-xl`}></i>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Artworks Grid */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#3b2012] flex items-center gap-3">
                <i className="fa-solid fa-paintbrush text-[#ae8c73]"></i>
                أعمال الفنان
                <span className="text-sm bg-[#5c4436] text-white px-3 py-0.5 rounded-full mr-2">{works.length}</span>
              </h2>

              {works.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-[#e8dcc4]">
                  <p className="text-xl text-[#9c7b65] font-bold">لا يوجد أعمال فنية حالياً</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {works.map((work, index) => (
                    <motion.div
                      key={work.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
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
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-bold text-[#3b2012] mb-4 line-clamp-1">{work.title}</h3>
                        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4" onClick={(e) => e.stopPropagation()}>
                          <span className="font-bold text-lg text-[#3b2012]">
                            {work.price ? `${work.price} ₪` : 'حسب الطلب'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openSlider(work);
                            }}
                            className="bg-[#f0ece6] text-[#5c4436] hover:bg-[#5c4436] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                          >
                            عرض التفاصيل
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
}
