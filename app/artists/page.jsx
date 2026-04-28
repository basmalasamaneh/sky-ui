"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeWork } from '@/lib/artwork-utils';

export default function ArtistsDirectoryPage() {
  const { token, isAuthenticated } = useAuth();
  const [artists, setArtists] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArtists = artists.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchArtists = async () => {
      setIsFetching(true);
      try {
        const artworksRes = await fetch('/api/v1/artworks?limit=200');
        const artworksResult = artworksRes.ok ? await artworksRes.json().catch(() => ({})) : {};
        const rawWorks = artworksResult?.data?.artworks ?? [];
        const normalizedWorks = rawWorks.map(normalizeWork);

        // Build artist entries from artworks (public endpoint embeds artist info)
        const artistMap = new Map();
        const previewMap = new Map();
        const worksCountMap = new Map();

        normalizedWorks.forEach((work) => {
          const aid = work.artist_id;
          if (!aid) return;

          worksCountMap.set(aid, (worksCountMap.get(aid) || 0) + 1);

          if (!previewMap.has(aid)) previewMap.set(aid, []);
          const imgs = previewMap.get(aid);
          if (imgs.length < 3 && work.images?.length > 0) {
            imgs.push(work.images[work.mainImageIndex || 0]);
          }

          if (!artistMap.has(aid)) {
            const displayName = work.artistName || 'غير متوفر';
            artistMap.set(aid, {
              id: aid,
              name: displayName,
              avatar: work.artistAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=5c4436&color=fff&size=200&font-size=0.4&bold=true`,
            });
          }
        });

        // For authenticated users, also fetch the full artists list for richer data
        if (token) {
          const artistsRes = await fetch('/api/v1/artists', { headers: { Authorization: `Bearer ${token}` } });
          const artistsResult = artistsRes.ok ? await artistsRes.json().catch(() => ({})) : {};
          const rawArtists = artistsResult?.data ?? [];

          rawArtists.forEach((a) => {
            const displayName =
              a.artist_name ||
              [a.first_name, a.last_name].filter(Boolean).join(' ') ||
              'غير متوفر';
            artistMap.set(a.id, {
              id: a.id,
              name: displayName,
              avatar: a.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=5c4436&color=fff&size=200&font-size=0.4&bold=true`,
            });
          });
        }

        const mapped = Array.from(artistMap.values()).map((a) => ({
          ...a,
          worksCount: worksCountMap.get(a.id) || 0,
          previewImages: previewMap.get(a.id) || [],
        }));

        setArtists(mapped);
      } catch (e) {
        console.error('Failed to fetch artists:', e);
      } finally {
        setIsFetching(false);
      }
    };

    fetchArtists();
  }, [token]);

  return (
    <div className="min-h-[80vh] bg-[#fdfaf7] dark:bg-black py-12 px-4 sm:px-6 lg:px-8 font-art" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brown-gradient rounded-full text-white text-3xl mb-6 shadow-lg">
            <i className="fa-solid fa-paintbrush"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#3b2012] dark:text-[#e8dcc4] mb-4">فنانونا المبدعون</h1>
          <p className="text-[#9c7b65] dark:text-[#e8dcc4] text-lg">
            اكتشف نخبة من الفنانين الموهوبين وتعرّف على أعمالهم وإبداعاتهم التي تترك أثراً في عالم الفن.
          </p>

          {/* Search */}
          <div className="relative mt-8 max-w-md mx-auto">
            <i className="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-[#9c7b65] pointer-events-none"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن فنان..."
              className="w-full h-12 bg-white dark:bg-[#1a0f0a] border border-[#e8dcc4] dark:border-[#3e2f27] rounded-2xl pr-12 pl-4 text-[#3b2012] dark:text-[#e8dcc4] placeholder:text-[#ceb29f] focus:outline-none focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c7b65] hover:text-[#3b2012] dark:hover:text-[#e8dcc4] transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>

        {isFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((skel) => (
              <div key={skel} className="bg-white dark:bg-black rounded-3xl p-6 shadow-sm border border-[#e8dcc4] dark:border-gray-800 animate-pulse">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded-md w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-1/3"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-24 bg-gray-200 rounded-xl flex-1"></div>
                  <div className="h-24 bg-gray-200 rounded-xl flex-1"></div>
                  <div className="h-24 bg-gray-200 rounded-xl flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-black rounded-[2rem] border border-[#e8dcc4] dark:border-gray-800 shadow-sm">
            <i className="fa-solid fa-users-slash text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-2xl font-bold text-[#3b2012] dark:text-[#e8dcc4] mb-2">لا يوجد فنانين حالياً</h2>
            <p className="text-[#9c7b65] dark:text-[#e8dcc4]">كن أنت أول فنان ينضم لمنصتنا من خلال إنشاء حساب فنان!</p>
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-black rounded-[2rem] border border-[#e8dcc4] dark:border-gray-800 shadow-sm">
            <i className="fa-solid fa-user-magnifying-glass text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-2xl font-bold text-[#3b2012] dark:text-[#e8dcc4] mb-2">لا توجد نتائج</h2>
            <p className="text-[#9c7b65] dark:text-[#e8dcc4]">لم نجد أي فنان يطابق &quot;{searchQuery}&quot;</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArtists.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link 
                  href={`/artists/${artist.id}`}
                  className="block bg-white dark:bg-black rounded-3xl p-6 shadow-sm border border-[#e8dcc4] dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 mb-6 relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                      <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#3b2012] dark:text-[#e8dcc4] group-hover:text-[#9c7b65] dark:text-[#e8dcc4] transition-colors flex items-center gap-2">
                        {artist.name}
                        <div className="text-[#fdfaf7] bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center text-[8px] shadow-sm" title="فنان موثق">
                          <i className="fa-solid fa-check"></i>
                        </div>
                      </h3>
                      <p className="text-sm text-[#9c7b65] dark:text-[#e8dcc4] font-bold"><i className="fa-solid fa-palette ml-1 text-amber-500"></i> {artist.worksCount} أعمال فنية</p>
                    </div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#f0ece6] dark:bg-black text-[#5c4436] dark:text-[#e8dcc4] w-8 h-8 flex items-center justify-center rounded-full opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <i className="fa-solid fa-arrow-left text-xs"></i>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {artist.previewImages.length > 0 ? (
                      artist.previewImages.slice(0, 3).map((img, idx) => (
                        <div key={idx} className="h-24 flex-1 rounded-xl overflow-hidden relative border border-gray-100 dark:border-gray-800 dark:border-gray-800">
                          <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      ))
                    ) : (
                      <div className="h-24 w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center rounded-xl border border-gray-100 dark:border-gray-800 dark:border-gray-800">
                        <i className="fa-solid fa-image text-gray-300 text-2xl"></i>
                      </div>
                    )}
                    
                    {/* Fill empty slots with generic placeholders so design doesn't break */}
                    {Array.from({ length: Math.max(0, 3 - artist.previewImages.length) }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="h-24 flex-1 rounded-xl bg-[#fdfaf7] dark:bg-black border border-[#e8dcc4]/50 flex items-center justify-center">
                        <i className="fa-regular fa-image text-[#ceb29f]/30"></i>
                      </div>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

