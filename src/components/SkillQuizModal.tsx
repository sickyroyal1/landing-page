import React, { useState } from 'react';
import { CoachingService } from '../types';
import { X, Sparkles, CheckCircle2, ArrowRight, RefreshCw, Trophy } from 'lucide-react';

interface SkillQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: CoachingService[];
  onSelectRecommendedService: (service: CoachingService) => void;
}

export const SkillQuizModal: React.FC<SkillQuizModalProps> = ({
  isOpen,
  onClose,
  services,
  onSelectRecommendedService
}) => {
  const [step, setStep] = useState<number>(1);
  const [formatChoice, setFormatChoice] = useState<'solo' | 'partner' | 'group' | 'remote'>('solo');
  const [goalChoice, setGoalChoice] = useState<string>('');

  if (!isOpen) return null;

  const handleFinishQuiz = () => {
    // Recommend service based on answers
    let matchedId = 'service-1on1-60';
    if (formatChoice === 'partner') matchedId = 'service-2on1-60';
    else if (formatChoice === 'group') matchedId = 'service-group-4p';
    else if (formatChoice === 'remote') matchedId = 'service-video-eval';
    else if (goalChoice.includes('tournament')) matchedId = 'service-1on1-90';

    const service = services.find(s => s.id === matchedId) || services[0];
    onSelectRecommendedService(service);
    onClose();
  };

  const resetQuiz = () => {
    setStep(1);
    setFormatChoice('solo');
    setGoalChoice('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white overflow-hidden p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-400/10 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Find Your Ideal Session</h3>
              <p className="text-xs text-slate-400">30-second coaching match test</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question 1 */}
        {step === 1 && (
          <div className="py-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-200">
              Question 1 of 2: Who will be attending the session?
            </h4>

            <div className="space-y-2.5">
              {[
                { id: 'solo', label: 'Just me (1-on-1 private coaching)', desc: 'Maximum direct focus on my personal mechanics' },
                { id: 'partner', label: 'Me and my regular doubles partner', desc: 'Work on stacking, middle communication & partner synergy' },
                { id: 'group', label: 'A small group of 3-4 friends', desc: 'High-energy drills and competitive rotation play' },
                { id: 'remote', label: 'I want remote match video breakdown', desc: 'Send my match footage for detailed annotated video feedback' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFormatChoice(item.id as any)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                    formatChoice === item.id
                      ? 'bg-purple-400/10 border-purple-400 text-white ring-1 ring-purple-400'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                  </div>
                  {formatChoice === item.id && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-4 py-3 bg-purple-400 hover:bg-purple-300 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              Next Step →
            </button>
          </div>
        )}

        {/* Question 2 */}
        {step === 2 && (
          <div className="py-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-200">
              Question 2 of 2: What is your primary coaching focus?
            </h4>

            <div className="space-y-2.5">
              {[
                { id: 'drops', label: 'Mastering the 3rd Shot Drop & Soft Game', desc: 'Stop popping up dinks and build un-attackable kitchen drops' },
                { id: 'tournament', label: 'Preparing for an Upcoming Tournament / DUPR Push', desc: 'High intensity match scenarios and pressure counter-attacks' },
                { id: 'mechanics', label: 'Overhauling stroke mechanics & serve/return', desc: 'Consistent depth and cleaner biomechanics' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setGoalChoice(item.id)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                    goalChoice === item.id
                      ? 'bg-purple-400/10 border-purple-400 text-white ring-1 ring-purple-400'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                  </div>
                  {goalChoice === item.id && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                ← Back
              </button>
              <button
                onClick={handleFinishQuiz}
                className="flex-1 py-3 bg-purple-400 hover:bg-purple-300 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                See Recommendation & Book
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
