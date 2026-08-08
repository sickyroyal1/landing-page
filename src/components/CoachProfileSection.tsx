import React from 'react';
import { CoachProfile } from '../types';
import { ShieldCheck, Award, Trophy, Users, Video, MapPin, CheckCircle, Flame } from 'lucide-react';
import coachPortraitImg from '../assets/images/coach_portrait_1785645192774.jpg';

interface CoachProfileSectionProps {
  coachProfile: CoachProfile;
  onOpenBooking: () => void;
}

export const CoachProfileSection: React.FC<CoachProfileSectionProps> = ({
  coachProfile,
  onOpenBooking
}) => {
  const pillars = [
    {
      title: "Biomechanical Precision",
      desc: "Streamlining paddle path and body weight transfer to minimize unforced errors and maximize repeatability under pressure."
    },
    {
      title: "Tactical Court Geometry",
      desc: "Smart shot selection: knowing exactly when to drop, drive, lob, or reset based on opponent position and balance."
    },
    {
      title: "Kitchen Dominance & Soft Game",
      desc: "Mastering footwork, paddle readiness, and soft dinking resets to turn aggressive drives into unattackable kitchen battles."
    },
    {
      title: "Tournament Mental Toughness",
      desc: "Building partner communication, game plan adaptability, and staying calm during tight game points."
    }
  ];

  return (
    <section id="coach-profile" className="py-20 bg-slate-950 text-white relative border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Image & Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl group">
              <img
                src={coachPortraitImg}
                alt={coachProfile.name}
                referrerPolicy="no-referrer"
                className="w-full h-[480px] object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>{coachProfile.certification}</span>
                  </div>
                  <div className="text-purple-400 font-extrabold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    5.0 DUPR
                  </div>
                </div>
              </div>
            </div>

            {/* Float Stats Badge */}
            <div className="absolute -bottom-6 -right-2 sm:right-6 bg-slate-900 border border-slate-700 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
              <div className="p-3 bg-purple-400/10 rounded-xl text-purple-400">
                <Trophy className="w-6 h-6" />
              </div>
            
            </div>
          </div>

          {/* Right Column: Bio & Methodology */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold">
              <Award className="w-4 h-4 text-amber-400" />
              Meet Your Head Coach
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Coach {coachProfile.name}
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              {coachProfile.bio}
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 bg-purple-400/10 px-3 py-1.5 rounded-lg border border-purple-400/20 w-fit">
              <MapPin className="w-4 h-4" />
              <span>Primary Courts: {coachProfile.locationCity}</span>
            </div>

            {/* 4 Pillars of Coaching */}
            <div className="pt-4 space-y-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                The Apex Coaching Methodology
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pillars.map((pillar, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                      <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>{pillar.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed pl-6">
                      {pillar.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <button
                onClick={onOpenBooking}
                className="bg-purple-400 hover:bg-purple-300 text-slate-950 font-black px-6 py-3 rounded-xl text-sm shadow-md shadow-purple-500/15 transition-all cursor-pointer"
              >
                Schedule Session with Coach {coachProfile.name}
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
