// components/layout/TextScaler.tsx
"use client";

import { useState, useEffect } from 'react';

export default function TextScaler() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem('text-scale');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setScale(parseFloat(saved));
  }, []);

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--text-label-size', `${0.6 * scale}rem`);
    root.setProperty('--text-detail-size', `${0.7 * scale}rem`);
    root.setProperty('--text-body-size', `${0.8 * scale}rem`);
    root.setProperty('--text-header-size', `${1.0 * scale}rem`);
    localStorage.setItem('text-scale', String(scale));
  }, [scale]);

  const adjustScale = (delta: number) => {
    setScale(prev => Math.min(Math.max(prev + delta, 0.8), 1.4));
  };

  return (
    <div className="flex items-center border-2 border-zinc-900 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      <button
        onClick={() => adjustScale(-0.1)}
        className="px-3 py-1.5 text-[12px] font-black hover:bg-zinc-100 transition-colors cursor-pointer border-r border-zinc-200"
      >
        −
      </button>
      <span className="text-[10px] font-mono w-10 text-center text-zinc-900 font-bold">
        {Math.round(scale * 100)}%
      </span>
      <button
        onClick={() => adjustScale(0.1)}
        className="px-3 py-1.5 text-[12px] font-black hover:bg-zinc-100 transition-colors cursor-pointer border-l border-zinc-200"
      >
        +
      </button>
    </div>
  );
}