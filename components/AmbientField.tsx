'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

const LINK_DISTANCE = 120;

/**
 * A slow, quiet field of drifting points and faint connective threads —
 * the ambient suggestion of an ecology before the atlas is entered.
 */
export default function AmbientField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let particles: Particle[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const count = Math.min(90, Math.max(28, Math.floor((w * h) / 22000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14,
        r: 0.6 + Math.random() * 1.4,
      }));
    };

    const render = (advance: boolean) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const dark = themeRef.current === 'dark';
      const dotColor = dark ? 'rgba(232,226,212,0.34)' : 'rgba(42,38,30,0.26)';
      const linePrefix = dark ? 'rgba(232,226,212,' : 'rgba(42,38,30,';

      if (advance) {
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -20) p.x = w + 20;
          if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20;
          if (p.y > h + 20) p.y = -20;
        }
      }

      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DISTANCE * LINK_DISTANCE) {
            const alpha = 0.1 * (1 - Math.sqrt(d2) / LINK_DISTANCE);
            ctx.strokeStyle = `${linePrefix}${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = dotColor;
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      render(true);
      raf = window.requestAnimationFrame(loop);
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    resize();
    window.addEventListener('resize', resize);

    if (reduced) {
      render(false); // a single still frame
    } else {
      raf = window.requestAnimationFrame(loop);
    }

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="ambient-field" aria-hidden />;
}
