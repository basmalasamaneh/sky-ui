'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Hero from '@/components/Hero'
import { ArtworkGrid } from '@/components/ArtworkGrid'
import { ForYouSection } from '@/components/ForYouSection'
import { useSearch } from '@/contexts/SearchContext'
import { normalizeWork } from '@/lib/artwork-utils';

function SearchResults({ query }) {
  const [artists, setArtists] = useState([]);
  const [isFetchingArtists, setIsFetchingArtists] = useState(true);

  useEffect(() => {
    if (!query.trim()) return;

    const fetchArtists = async () => {
      setIsFetchingArtists(true);
      try {
        const res = await fetch('/api/artworks?limit=200');
        const result = res.ok ? await res.json().catch(() => ({})) : {};
        const rawWorks = result?.data?.artworks ?? [];
        const normalizedWorks = rawWorks.map(normalizeWork);

        const artistMap = new Map();
        const worksCountMap = new Map();

        normalizedWorks.forEach((work) => {
          const aid = work.artist_id;
          if (!aid) return;
          worksCountMap.set(aid, (worksCountMap.get(aid) || 0) + 1);
          if (!artistMap.has(aid)) {
            const displayName = work.artistName || 'غير متوفر';
            artistMap.set(aid, {
              id: aid,
              name: displayName,
              avatar:
                work.artistAvatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=5c4436&color=fff&size=200&font-size=0.4&bold=true`,
            });
          }
        });

        const q = query.trim().toLowerCase();
        const matched = Array.from(artistMap.values())
          .filter((a) => a.name.toLowerCase().includes(q))
          .map((a) => ({ ...a, worksCount: worksCountMap.get(a.id) || 0 }));

        setArtists(matched);
      } catch {
        setArtists([]);
      } finally {
        setIsFetchingArtists(false);
      }
    };

    fetchArtists();
  }, [query]);

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen" dir="rtl">
      <div className="mb-10">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
          <i className="fa-solid fa-magnifying-glass"></i>
          نتائج البحث عن: &quot;{query.trim()}&quot;
        </span>
      </div>

      {/* Artists section */}
      {(isFetchingArtists || artists.length > 0) && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#3b2012] dark:text-[#e8dcc4] font-art mb-5 flex items-center gap-2">
            <i className="fa-solid fa-user-pen text-amber-500"></i> الفنانون
          </h2>
          {isFetchingArtists ? (
            <div className="flex gap-4 flex-wrap">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white dark:bg-[#1a0f0a] border border-[#e8dcc4] dark:border-[#3e2f27] rounded-2xl px-4 py-3 min-w-[200px] animate-pulse"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded-full"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4 flex-wrap">
              {artists.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artists/${artist.id}`}
                  className="flex items-center gap-3 bg-white dark:bg-[#1a0f0a] border border-[#e8dcc4] dark:border-[#3e2f27] rounded-2xl px-4 py-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group min-w-[200px]"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow flex-shrink-0">
                    <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-[#3b2012] dark:text-[#e8dcc4] group-hover:text-[#9c7b65] transition-colors text-sm flex items-center gap-1">
                      {artist.name}
                      <i className="fa-solid fa-circle-check text-[#1d9bf0] text-[9px]"></i>
                    </p>
                    <p className="text-xs text-[#9c7b65] dark:text-[#c4a993] font-amiri">
                      <i className="fa-solid fa-palette ml-1 text-amber-500 text-[10px]"></i>
                      {artist.worksCount} أعمال
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Artworks section */}
      <section>
        <h2 className="text-xl font-bold text-[#3b2012] dark:text-[#e8dcc4] font-art mb-5 flex items-center gap-2">
          <i className="fa-solid fa-paintbrush text-amber-500"></i> الأعمال الفنية
        </h2>
        <ArtworkGrid limit={null} title={null} showCategories={true} />
      </section>
    </div>
  );
}

export default function Home() {
  const { globalSearchQuery } = useSearch();
  const showSearchResults = globalSearchQuery.trim().length > 0;

  if (showSearchResults) {
    return (
      <main>
        <SearchResults query={globalSearchQuery} />
      </main>
    );
  }

  return (
    <main>
      <Hero />
      <ForYouSection />
      <div className="container mx-auto px-4">
        <ArtworkGrid limit={8} title="استكشف أحدث الإبداعات" showCategories={true} />
      </div>
    </main>
  );
}
