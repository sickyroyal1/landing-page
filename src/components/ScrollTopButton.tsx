import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollTopButtonProps {
  /** Only show once this section's top enters the lower part of the viewport. */
  triggerSectionId?: string;
}

export const ScrollTopButton: React.FC<ScrollTopButtonProps> = ({
  triggerSectionId = 'coach-profile'
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const el = triggerSectionId ? document.getElementById(triggerSectionId) : null;
      if (!el) {
        setVisible(false);
        return;
      }
      // Appear once the section's top edge reaches ~60% down the viewport
      const rect = el.getBoundingClientRect();
      setVisible(rect.top <= window.innerHeight * 0.6);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [triggerSectionId]);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      title="Back to top"
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-violet-400 text-slate-950 flex items-center justify-center shadow-xl shadow-purple-500/30 hover:from-purple-300 hover:to-violet-300 transition-all duration-300 cursor-pointer active:scale-90 ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5" strokeWidth={3} />
    </button>
  );
};
