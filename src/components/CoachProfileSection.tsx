import React from 'react';
import { CoachProfile, CourtLocation } from '../types';
import { MapPin } from 'lucide-react';
import { CoachAvatar } from './CoachAvatar';

interface CoachProfileSectionProps {
  coachProfile: CoachProfile;
  courts: CourtLocation[];
  onOpenBooking: () => void;
}

export const CoachProfileSection: React.FC<CoachProfileSectionProps> = ({
  coachProfile,
  courts,
  onOpenBooking
}) => {
  // Preferred courts: explicit list when set, otherwise the areas the coach serves.
  const preferredIds = coachProfile.preferredCourts && coachProfile.preferredCourts.length > 0
    ? coachProfile.preferredCourts
    : coachProfile.locationIds;
  const preferredCourts = preferredIds
    .map(id => courts.find(c => c.id === id))
    .filter((c): c is CourtLocation => !!c);

  return (
    <section id="coach-profile" className="py-20 bg-slate-950 text-white relative border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative h-[480px] rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl group">
              <CoachAvatar coach={coachProfile} className="transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            </div>
          </div>

          {/* Right Column: Bio & Preferred Courts */}
          <div className="lg:col-span-7 space-y-6 text-left">

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Coach {coachProfile.name}
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              {coachProfile.bio}
            </p>

            {/* Preferred Courts */}
            <div className="pt-4 space-y-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                Preferred Courts
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {preferredCourts.map((court) => (
                  <div key={court.id} className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="text-sm font-bold text-slate-100">{court.name}</span>
                      <span className="text-[11px] text-slate-400 ml-1.5">{court.type}</span>
                    </div>
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
