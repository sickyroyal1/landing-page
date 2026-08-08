import React from 'react';
import { Calendar, ShieldCheck, Star, Award, ArrowRight, Video, Target, Zap, ChevronRight } from 'lucide-react';
import { CoachProfile, SiteCopy } from '../types';

// Using new header image asset
import heroCourtImage from '../assets/images/hero_header_image.jpg';

interface HeroProps {
  coachProfile: CoachProfile;
  siteCopy?: SiteCopy;
  availableSlotsCount: number;
  onOpenBooking: () => void;
  onScrollToAvailability: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  coachProfile,
  siteCopy,
  availableSlotsCount,
  onOpenBooking,
  onScrollToAvailability
}) => {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white min-h-[85vh] flex items-center pt-8 pb-16">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 z-0 opacity-35 bg-cover bg-center" style={{ backgroundImage: `url(${heroCourtImage})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/30" />
      </div>

      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & Call to Action */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              {siteCopy?.heroHeadline ? (
                siteCopy.heroHeadline.includes('FD Academy') ? (
                  <>
                    {siteCopy.heroHeadline.split('FD Academy')[0]}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-violet-300 to-fuchsia-300">
                      FD Academy
                    </span>
                    {siteCopy.heroHeadline.split('FD Academy')[1]}
                  </>
                ) : (
                  siteCopy.heroHeadline
                )
              ) : (
                <>
                  Elevate Your Pickleball Game with Coach Francis at{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-violet-300 to-fuchsia-300">
                    FD Academy
                  </span>
                </>
              )}
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl">
              {siteCopy?.heroSubheadline || `PPR Master Pro Coaching tailored to your exact level. Master the 3rd shot drop, dominate the kitchen line, and elevate your DUPR rating with structured 1-on-1 and partner training.`}
            </p>

            {/* Key Value Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200">
                <Video className="w-5 h-5 text-purple-400 shrink-0" />
                <span className="text-xs font-semibold">On-Court Video Review</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200">
                <Target className="w-5 h-5 text-violet-400 shrink-0" />
                <span className="text-xs font-semibold">DUPR Strategy Plans</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 col-span-2 sm:col-span-1">
                <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold">Indoor & Outdoor Courts</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={onOpenBooking}
                className="bg-gradient-to-r from-purple-400 to-violet-400 hover:from-purple-300 hover:to-violet-300 text-slate-950 font-black px-7 py-4 rounded-xl text-base shadow-xl shadow-purple-500/20 hover:shadow-purple-500/35 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group active:scale-98"
              >
                <Calendar className="w-5 h-5" />
                Book Private Session
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onScrollToAvailability}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-4 rounded-xl text-base border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                View Live Calendar
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

          </div>

          {/* Right Column: Coach Quick Card Preview */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md bg-gradient-to-b from-slate-900/90 to-slate-950/90 rounded-2xl p-6 border border-slate-800 shadow-2xl backdrop-blur-md">
              
              {/* Badge Overlay */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black uppercase px-3 py-1 rounded-full shadow-lg tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 fill-slate-950" />
                PPR Master Pro
              </div>

              {/* Coach Image + Name */}
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-purple-400/40 shadow-xl mx-auto">
                    <img
                      src={coachProfile.email ? "../assets/images/coach_portrait_1785645192774.jpg" : ""}
                      alt={coachProfile.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        // fallback placeholder if needed
                        (e.target as HTMLElement).setAttribute('src', 'https://picsum.photos/seed/coach/400/400');
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-slate-900 text-purple-400 px-2 py-0.5 rounded-lg border border-purple-400/30 text-[11px] font-bold flex items-center gap-1 shadow">
                    <ShieldCheck className="w-3 h-3 text-purple-400" />
                    5.0 DUPR
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-white">{coachProfile.name}</h3>
                  <p className="text-xs text-purple-400 font-semibold tracking-wide uppercase mt-0.5">
                    {coachProfile.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{coachProfile.locationCity}</p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-2 py-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-center">
                  <div className="p-2">
                    <div className="text-lg font-black text-white">8+</div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Yrs Coaching</div>
                  </div>
                  <div className="p-[2] border-x border-slate-800">
                    <div className="text-lg font-black text-purple-400">1.4k+</div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Students</div>
                  </div>
                  <div className="p-2">
                    <div className="text-lg font-black text-violet-400">5.0</div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium">DUPR Rating</div>
                  </div>
                </div>

                {/* Speciality Pills */}
                <div className="text-left pt-1 space-y-2">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Coach Specialties:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {coachProfile.specialties.map((spec, idx) => (
                      <span key={idx} className="text-[11px] bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded-md font-medium">
                        ✓ {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onOpenBooking}
                  className="w-full mt-2 py-3 bg-purple-400/10 hover:bg-purple-400/20 text-purple-400 border border-purple-400/30 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  Check Available Dates
                </button>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
