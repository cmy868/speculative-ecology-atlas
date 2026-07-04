import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand display glass glass-pill">
        Speculative Ecology <span className="brand-sub">· a living atlas</span>
      </Link>
      <nav className="site-nav glass glass-pill" aria-label="Main navigation">
        <Link href="/atlas">Atlas</Link>
        <Link href="/dissertation">Dissertation</Link>
      </nav>
    </header>
  );
}
