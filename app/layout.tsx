import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import GlassFilter from '@/components/GlassFilter';
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>
        <GlassFilter />
        {children}
      </body>
    </html>
  );
}
