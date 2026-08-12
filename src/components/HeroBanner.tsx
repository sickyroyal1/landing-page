import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * Landing hero banner — sits at the top of the page, above the province → city
 * location picker. Shows the DINKLAB + 3D logo (plain PNG, no glow or blend
 * effects) with a heartbeat pulse, headline, and a "Book now" CTA that smooth
 * scrolls down to the location picker.
 */
export const HeroBanner: React.FC = () => {
  const scrollToLocationPicker = () => {
    document.getElementById('find-coach')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white min-h-screen flex flex-col items-center justify-center snap-start">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex flex-col items-center text-center">
        {/* Logo — transparent-background PNG, sits cleanly on the dark bg.
            Heartbeat: single pulse in place (no float) with a violet glow per beat. */}
        <img
          src={`${import.meta.env.BASE_URL}DINKLAB + Logo 3d No BG.png`}
          alt="DINKLAB + Logo"
          draggable={false}
          className="w-80 sm:w-96 lg:w-[30rem] h-auto animate-heartbeat pointer-events-none select-none"
        />

        <h1 className="mt-16 lg:mt-20 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1]">
          LEVEL UP YOUR GAME.
        </h1>
        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl">
          Precision coaching for players who want more from every session, every rally, and every match.
        </p>

        {/* CTA — smooth scrolls down to the province → city location picker */}
        <button
          onClick={scrollToLocationPicker}
          className="mt-8 bg-gradient-to-r from-purple-400 to-violet-400 hover:from-purple-300 hover:to-violet-300 text-slate-950 font-black px-8 py-4 rounded-xl text-base shadow-xl shadow-purple-500/20 hover:shadow-purple-500/35 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group active:scale-98"
        >
          Book now
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};
