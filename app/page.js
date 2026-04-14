import Hero from '@/components/Hero'
import { ArtworkGrid } from '@/components/ArtworkGrid'
import { ForYouSection } from '@/components/ForYouSection'

export default function Home() {
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
