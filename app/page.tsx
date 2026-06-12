import Link from 'next/link';
import AmbientField from '@/components/AmbientField';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function HomePage() {
  return (
    <div className="home">
      <AmbientField />
      <SiteHeader />
      <main className="hero">
        <p className="hero-kicker">A dissertation and its living companion</p>
        <h1 className="display">Speculative Ecology in the Age of Generative AI</h1>
        <p className="hero-subtitle display">A Living Atlas of Human-AI Co-Creation</p>
        <p className="hero-intro">
          This atlas accompanies a dissertation on speculative ecology, generative AI,
          memory, life, and embodiment. Rather than presenting artworks as isolated
          projects, it maps them as relations within an evolving ecosystem.
        </p>
        <div className="hero-actions">
          <Link href="/atlas" className="button button-primary">
            Enter the Atlas
          </Link>
          <Link href="/dissertation" className="button">
            The Dissertation
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
