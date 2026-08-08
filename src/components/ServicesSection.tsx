import React from 'react';
import { CoachingService, SiteCopy } from '../types';
import { User, Users, Video, Clock, CheckCircle2, Sparkles, ArrowRight, Shield } from 'lucide-react';

interface ServicesSectionProps {
  services: CoachingService[];
  siteCopy?: SiteCopy;
  onSelectService: (service: CoachingService) => void;
  onOpenQuiz: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  siteCopy,
  onSelectService,
  onOpenQuiz
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-400/10 border border-purple-400/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            Tailored Coaching Programs
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {siteCopy?.servicesTitle || "Coaching Sessions Built to Accelerate Your DUPR"}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            {siteCopy?.servicesSubtitle || "Choose the format that fits your immediate goals. All on-court sessions include pro video breakdown, customized mechanics drills, and post-session progress action notes."}
          </p>


          <div className="pt-2">
            <button
              onClick={onOpenQuiz}
              className="inline-flex items-center gap-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-purple-300 px-4 py-2 rounded-lg border border-slate-700 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              Unsure which session to pick? Take our 30-sec match quiz →
            </button>
          </div>
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
                    <span className="text-2xl font-black text-white">${service.price}</span>
                    <span className="text-xs text-slate-400 block font-medium">
                      {service.maxPlayers > 1 ? `total / session` : `per session`}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight">{service.title}</h3>
                <p className="text-xs text-purple-400 font-semibold mt-1">{service.subtitle}</p>

                {/* Duration & Recommended Skill Level */}
                <div className="flex items-center gap-4 py-3 my-4 border-y border-slate-700/60 text-xs text-slate-300 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{service.durationMinutes} Minutes</span>
                  </div>
                  <div className="h-3 w-px bg-slate-700" />
                  <div>
                    <span className="text-slate-400">Level: </span>
                    <span className="text-slate-200 font-semibold">{service.recommendedLevel}</span>
                  </div>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Highlights List */}
                <div className="space-y-2.5 mb-8">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">What's Included:</p>
                  {service.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
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
