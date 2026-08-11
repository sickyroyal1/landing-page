import React from 'react';
import { CoachingService, SiteCopy } from '../types';
import { User, Users, Video, Clock, ArrowRight } from 'lucide-react';

interface ServicesSectionProps {
  services: CoachingService[];
  siteCopy?: SiteCopy;
  onSelectService: (service: CoachingService) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  siteCopy,
  onSelectService
}) => {
  const getIconForService = (id: string) => {
    if (id.includes('1on1')) return <User className="w-5 h-5 text-purple-400" />;
    if (id.includes('2on1') || id.includes('group')) return <Users className="w-5 h-5 text-violet-400" />;
    if (id.includes('video')) return <Video className="w-5 h-5 text-amber-400" />;
    return <User className="w-5 h-5 text-purple-400" />;
  };

  return (
    <section id="services" className="py-20 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {siteCopy?.servicesTitle || "Coaching Sessions Built to Accelerate Your DUPR"}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            {siteCopy?.servicesSubtitle || "Choose the format that fits your immediate goals. All on-court sessions include pro video breakdown, customized mechanics drills, and post-session progress action notes."}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {services.map((service) => (
            <div
              key={service.id}
              className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 ${
                service.popular
                  ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-purple-400 shadow-xl shadow-purple-500/10 scale-102'
                  : 'bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600'
              }`}
            >
              {/* Optional Badge */}
              {service.badge && (
                <div className={`absolute -top-3 right-6 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  service.popular ? 'bg-purple-400 text-slate-950 shadow-md' : 'bg-slate-700 text-slate-200 border border-slate-600'
                }`}>
                  {service.badge}
                </div>
              )}

              {/* Top Meta */}
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 inline-flex">
                    {getIconForService(service.id)}
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">₱{service.price}</span>
                    <span className="text-xs text-slate-400 block font-medium">
                      {service.maxPlayers > 1 ? `total / session` : `per session`}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight">{service.title}</h3>
                <p className="text-xs text-purple-400 font-semibold mt-1">{service.subtitle}</p>

                {/* Duration */}
                <div className="flex items-center justify-center gap-1.5 py-3 my-4 border-y border-slate-700/60 text-xs text-slate-300 font-medium">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{service.durationMinutes} Minutes</span>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed mb-8">
                  {service.description}
                </p>
              </div>

              {/* Book Button */}
              <button
                onClick={() => onSelectService(service)}
                className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  service.popular
                    ? 'bg-gradient-to-r from-purple-400 to-violet-400 hover:from-purple-300 hover:to-violet-300 text-slate-950 shadow-md shadow-purple-500/20'
                    : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                }`}
              >
                Book This Session
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
