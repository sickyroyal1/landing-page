import React from 'react';
import { CoachProfile } from '../types';
import { ShieldCheck, Calendar, Mail, Phone, Instagram, MapPin } from 'lucide-react';

interface FooterProps {
  coachProfile: CoachProfile;
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ coachProfile, onOpenBooking }) => {
  return (
    <footer id="contact" className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/DINK LAB + Vector.png"
                alt="DINKLAB +"
                draggable={false}
                className="h-9 w-auto mix-blend-screen select-none"
              />
              <span className="font-extrabold text-lg text-white tracking-tight">DINKLAB +</span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              DINKLAB + private coaching, partner strategy, and on-court video analysis. Elevate your DUPR rating with structured mechanics.
            </p>

            {coachProfile.certification && (
              <div className="flex items-center gap-2 text-purple-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>{coachProfile.certification}</span>
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Coach {coachProfile.name} Direct Contact</h4>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                <a href={`mailto:${coachProfile.email}`} className="hover:text-purple-400 transition-colors">
                  {coachProfile.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" />
                <a href={`tel:${coachProfile.phone}`} className="hover:text-purple-400 transition-colors">
                  {coachProfile.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-slate-500" />
                <span className="text-slate-300">{coachProfile.instagram}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{coachProfile.locationCity}</span>
              </div>
            </div>
          </div>

          {/* Quick Action */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Ready to Train?</h4>
            <p className="text-slate-400 text-xs">
              Check live calendar availability and reserve your session online.
            </p>
            <button
              onClick={onOpenBooking}
              className="w-full py-3 bg-purple-400 hover:bg-purple-300 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Book Private Session
            </button>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} DINKLAB + & Coach {coachProfile.name}. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};
