'use client';

import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

export default function HeroBanner({
  heroTitle,
  heroSubtitle,
}) {
  return (
    <section
      className="relative w-full min-h-screen flex items-center overflow-hidden bg-[#0F294A] bg-cover bg-center bg-no-repeat md:bg-fixed pt-16"
      style={{ backgroundImage: "url('/tiu-campus.png')" }}
    >
      {/* Lightened Overlay so TIU Campus is bright and clear */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-[#0F294A]/30 to-slate-950/55" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-5xl mx-auto drop-shadow-md"
        >
          {heroTitle}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease }}
          className="text-base sm:text-lg md:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-sm"
        >
          {heroSubtitle}
        </motion.p>
      </div>
    </section>
  );
}
