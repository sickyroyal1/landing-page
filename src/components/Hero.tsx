import React from 'react';
import { Calendar, ArrowRight, ChevronRight, Trophy, Award } from 'lucide-react';
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
  const achievements = coachProfile.achievements ?? [];
  const hasAchievements = (coachProfile.showAchievements ?? true) && achievements.length > 0;

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white min-h-[60vh] flex items-center py-12">
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
          <div className={`space-y-6 text-left ${hasAchievements ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              {siteCopy?.heroHeadline ? (
                siteCopy.heroHeadline.includes('PB Coach') ? (
                  <>
                    {siteCopy.heroHeadline.split('PB Coach')[0]}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-violet-300 to-fuchsia-300">
                      PB Coach
                    </span>
                    {siteCopy.heroHeadline.split('PB Coach')[1]}
                  </>
                ) : (
                  siteCopy.heroHeadline
                )
              ) : (
                <>
                  Elevate Your Pickleball Game with Pro Coaches at{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-violet-300 to-fuchsia-300">
                    PB Coach
                  </span>
                </>
              )}
            </h1>

            {/* Sub-headline */}
            {siteCopy?.heroSubheadline && (
              <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl">
                {siteCopy.heroSubheadline}
              </p>
            )}

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={onOpenBooking}
                className="bg-gradient-to-r from-purple-400 to-violet-400 hover:from-purple-300 hover:to-violet-300 text-slate-950 font-black px-7 py-4 rounded-xl text-base shadow-xl shadow-purple-500/20 hover:shadow-purple-500/35 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group active:scale-98"
              >
                <Calendar className="w-5 h-5" />
                Book with Coach {coachProfile.name}
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

          {/* Right Column: Coach Achievements */}
          {hasAchievements && (
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-gradient-to-b from-slate-900/90 to-slate-950/90 rounded-2xl p-6 border border-slate-800 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-extrabold text-white">Coach Achievements</h3>
                </div>

                <div className="space-y-4">
                  {achievements.map((a) => (
                    <div key={a.id} className="flex items-start gap-3">
                      {a.imageUrl ? (
                        <img
                          src={a.imageUrl}
                          alt={a.title}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
                          <Award className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-white leading-snug">{a.title}</p>
                        {a.description && (
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{a.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
