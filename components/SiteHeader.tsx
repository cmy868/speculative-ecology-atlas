import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand display">
        Speculative Ecology <span className="brand-sub">· a living atlas</span>
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/atlas">Atlas</Link>
        <Link href="/dissertation">Dissertation</Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
