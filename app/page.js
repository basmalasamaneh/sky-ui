'use client';

import Hero from '@/components/Hero'
import { ArtworkGrid } from '@/components/ArtworkGrid'
import { ForYouSection } from '@/components/ForYouSection'
import { useSearch } from '@/contexts/SearchContext'

export default function Home() {
  const { globalSearchQuery } = useSearch();
  
  // Show search results if global search is active, otherwise show home content
  const showSearchResults = globalSearchQuery.trim().length > 0;

  if (showSearchResults) {
    return (
      <main>
        <div className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
              <i className="fa-solid fa-magnifying-glass"></i>
              نتائج البحث عن: "{globalSearchQuery.trim()}"
            </span>
          </div>
          <ArtworkGrid limit={null} title={null} showCategories={true} />
        </div>
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
  )
}
