import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldAlert, Sparkles } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What gear should I bring to my coaching session?",
      a: "Bring your paddle, court shoes (non-marking rubber soles recommended), a water bottle, and athletic apparel. Coach Alex provides tournament-grade pickleballs, drill cones, video tripod gear, and demo paddles if you want to test new equipment."
    },
    {
      q: "How are court locations selected?",
      a: "You can select your preferred court during booking! Coach Alex conducts sessions at Central Park Pickleball Club, Highland Indoor Hub, and Riverside Park. Alternatively, if you have access to a private court or HOA community court within 15 miles, select 'Private/Client Court'."
    },
    {
      q: "What happens if there is bad weather (rain or extreme heat)?",
      a: "For outdoor sessions, if weather prevents safe court conditions, Coach Alex will automatically transition your session to the climate-controlled Highland Indoor Hub or offer a 100% free reschedule at your convenience."
    },
    {
      q: "Can I bring my regular tournament partner?",
      a: "Absolutely! The '2-on-1 Partner Strategy' session is specifically crafted for doubles teams looking to master stacking, middle court communication, and tactical partner coverage."
    },
    {
      q: "How does the video stroke breakdown work?",
      a: "Coach Alex uses high-speed iPad cameras on court to capture key strokes (3rd shot drops, dinks, serves). During water breaks, you'll review slow-motion footage together with drawing overlays so you can instantly see and feel biomechanical adjustments."
    },
    {
      q: "What is the cancellation and rescheduling policy?",
      a: "You can freely reschedule or cancel up to 24 hours prior to your scheduled session time with zero penalty."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-slate-900 text-white relative border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-400/10 border border-purple-400/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Everything You Need to Know Before Booking
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-100 hover:text-purple-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-purple-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
