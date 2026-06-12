'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to paper (light) mode' : 'Switch to ink (dark) mode'}
    >
      <span className="theme-toggle-dot" aria-hidden />
      {theme === 'dark' ? 'Paper' : 'Ink'}
    </button>
  );
}
