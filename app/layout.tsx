import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import ThemeProvider from '@/components/ThemeProvider';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Speculative Ecology in the Age of Generative AI — A Living Atlas',
  description:
    'A living atlas of human-AI co-creation, accompanying the dissertation “Speculative Ecology in the Age of Generative AI” by Mingyong Cheng (UC San Diego, 2026).',
};

/* Applied before hydration so the stored theme never flashes. */
const themeInitScript = `(function(){try{var t=localStorage.getItem('atlas-theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:'dark';}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${display.variable} ${body.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
