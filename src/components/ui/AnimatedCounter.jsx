'use client';

import { useEffect, useState } from 'react';

export default function AnimatedCounter({ value, duration = 800 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    if (target === 0) {
      setDisplayValue(0);
      return;
    }

    let start = null;
    let rafId;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  return <span className="tabular-nums">{displayValue.toLocaleString()}</span>;
}
