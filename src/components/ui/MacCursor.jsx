'use client';

import { useEffect, useRef, useState } from 'react';

export default function MacCursor() {
  const cursorRef = useRef(null);
  const variantRef = useRef('arrow');
  const visibleRef = useRef(false);

  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState('arrow'); // 'arrow' | 'pointer' | 'grab' | 'text'
  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer) return;
    setEnabled(true);

    const isClickable = (el) => {
      if (!el || !(el instanceof Element)) return false;
      return Boolean(
        el.closest(
          'a, button, [role="button"], input[type="submit"], input[type="button"], select, summary, label, .cursor-pointer'
        )
      );
    };

    const isTextInput = (el) => {
      if (!el || !(el instanceof Element)) return false;
      return Boolean(
        el.closest(
          'input[type="text"], input[type="email"], input[type="password"], input[type="search"], input[type="number"], input[type="url"], textarea'
        )
      );
    };

    const isCarousel = (el) => {
      if (!el || !(el instanceof Element)) return false;
      return Boolean(el.closest('[data-carousel="true"]'));
    };

    const onMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }

      let next = 'arrow';
      if (isClickable(e.target)) {
        next = 'pointer';
      } else if (isTextInput(e.target)) {
        next = 'text';
      } else if (isCarousel(e.target)) {
        next = 'grab';
      }

      if (variantRef.current !== next) {
        variantRef.current = next;
        setVariant(next);
      }
    };

    const onDown = (e) => {
      setPressed(true);
      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev.slice(-3), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 450);
    };

    const onUp = () => setPressed(false);
    const onLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Click Ripple Animations */}
      {ripples.map((r) => (
        <span
          key={r.id}
          style={{ left: r.x, top: r.y }}
          className="fixed z-[9998] pointer-events-none -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border-2 border-[#0F294A]/50 dark:border-sky-400/60 bg-sky-400/20 animate-[macClickRipple_0.42s_cubic-bezier(0.22,1,0.36,1)_forwards]"
        />
      ))}

      {/* Floating macOS Cursor (instant 1:1 tracking) */}
      <div
        ref={cursorRef}
        style={{ opacity: visible ? 1 : 0 }}
        className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform"
      >
        <div
          className="transition-transform duration-75 ease-out origin-top-left"
          style={{
            transform: pressed ? 'scale(0.88)' : 'scale(1)',
          }}
        >
          {pressed && (variant === 'pointer' || variant === 'grab') ? (
            /* macOS 27 Golden Gate: Closed Fist (Pressing / Grabbing) */
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              className="-translate-x-[14px] -translate-y-[14px] drop-shadow-[0_3px_6px_rgba(0,0,0,0.28)]"
            >
              <path
                d="M10 13.5c0-1.4 1.1-2.5 2.5-2.5.6 0 1.2.2 1.6.6.4-.7 1.1-1.1 1.9-1.1s1.5.4 1.9 1.1c.4-.4 1-.6 1.6-.6 1.4 0 2.5 1.1 2.5 2.5v3.2c0 3.7-2.7 6.8-6 6.8s-6-3.1-6-6.8v-3.2z"
                fill="#FFFFFF"
                stroke="#0B0F19"
                strokeWidth="2.1"
                strokeLinejoin="round"
              />
              <path
                d="M13.5 16v3.2M16 15.6v3.6M18.5 16v3.2"
                stroke="#CBD5E1"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          ) : variant === 'pointer' ? (
            /* macOS 27 Golden Gate: Pointing Hand */
            <svg
              width="30"
              height="30"
              viewBox="0 0 32 32"
              className="-translate-x-[11px] -translate-y-[4px] drop-shadow-[0_3px_6px_rgba(0,0,0,0.26)]"
            >
              <path
                d="M12.2 4.5c-1.1 0-2 .9-2 2v8.8l-1.9-1.5c-.9-.7-2.2-.5-2.8.4-.6.8-.5 2 .3 2.7l4.9 4.5c1.1 1 2.5 1.6 4 1.6h4.1c2.9 0 5.2-2.3 5.2-5.2V13c0-1.1-.9-2-2-2-.5 0-.9.2-1.3.5-.3-.9-1.1-1.5-2.1-1.5-.5 0-1 .2-1.4.6-.3-.9-1.1-1.6-2.2-1.6-.4 0-.8.1-1.1.3V6.5c0-1.1-.9-2-2-2z"
                fill="#FFFFFF"
                stroke="#0B0F19"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.2 15.5v3.5M17.2 15.5v3.5M20.2 16v3"
                stroke="#CBD5E1"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          ) : variant === 'grab' ? (
            /* macOS 27 Golden Gate: Open Hand */
            <svg
              width="30"
              height="30"
              viewBox="0 0 32 32"
              className="-translate-x-[15px] -translate-y-[14px] drop-shadow-[0_3px_6px_rgba(0,0,0,0.25)]"
            >
              <path
                d="M9.5 14V8.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V14M12.5 13V6.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V13M15.5 13V7c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v6M18.5 14V9c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v7.5c0 4.1-2.8 7-6.5 7-2.6 0-4.9-1.3-6.2-3.5l-2.3-3.6c-.5-.8-.2-1.9.6-2.4.8-.5 1.8-.2 2.3.5l.1.1"
                fill="#FFFFFF"
                stroke="#0B0F19"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.5 16.5v3.5M15.5 16.5v3.5M18.5 16.5v3.5"
                stroke="#CBD5E1"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          ) : variant === 'text' ? (
            /* macOS I-Beam Text Cursor */
            <svg
              width="20"
              height="24"
              viewBox="0 0 20 24"
              className="-translate-x-[10px] -translate-y-[12px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
            >
              <path
                d="M6 3h8M6 21h8M10 3v18"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M6.5 3.5h7M6.5 20.5h7M10 3.5v17"
                stroke="#0B0F19"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            /* Classic macOS Black & White Arrow */
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="-translate-x-[4px] -translate-y-[2px] drop-shadow-[0_3px_5px_rgba(0,0,0,0.3)]"
            >
              <path
                d="M4.5 2.5L18.5 13l-6.2 1.2 3.3 6-2.3 1.2-3.3-6-5.5 4.3V2.5z"
                fill="#0B0F19"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    </>
  );
}
