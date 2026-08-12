import React, { useState } from 'react';
import { Review } from '../types';
import { Star, Quote, CheckCircle2, ShieldCheck, Plus, MessageSquare } from 'lucide-react';

interface TestimonialsProps {
  reviews: Review[];
  onAddReview: (review: Review) => void;
}

export const Testimonials: React.FC<TestimonialsProps> = ({ reviews, onAddReview }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [author, setAuthor] = useState('');
  const [duprRating, setDuprRating] = useState('3.5 DUPR');
  const [comment, setComment] = useState('');
  const [sessionType, setSessionType] = useState('1-on-1 Private Mastery');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !comment) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author,
      duprRating,
      rating: 5,
      date: 'Just now',
      comment,
      sessionType
    };

    onAddReview(newRev);
    setAuthor('');
    setComment('');
    setShowReviewForm(false);
  };

  return (
    <section id="reviews" className="py-20 bg-slate-950 text-white relative border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            Verified Player Reviews
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Real Results from Real Pickleball Players
          </h2>
          <p className="text-slate-300 text-base">
            See how players went from beginner errors to tournament podiums with DINKLAB + structured coaching.
          </p>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="inline-flex items-center gap-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl transition-all cursor-pointer mt-2"
          >
            <MessageSquare className="w-4 h-4 text-purple-400" />
            {showReviewForm ? 'Close Review Form' : 'Leave a Player Review'}
          </button>
        </div>

        {/* Optional Review Form */}
        {showReviewForm && (
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-12 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h4 className="text-sm font-extrabold text-white">Share Your Coaching Experience</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Kim"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">DUPR Level</label>
                <input
                  type="text"
                  placeholder="e.g. 3.5 DUPR"
                  value={duprRating}
                  onChange={(e) => setDuprRating(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Session Attended</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="1-on-1 Private Mastery">1-on-1 Private Mastery</option>
                <option value="2-on-1 Partner Strategy">2-on-1 Partner Strategy</option>
                <option value="90-Min Intensive Deep Dive">90-Min Intensive Deep Dive</option>
                <option value="Small Group Clinic">Small Group Clinic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Your Review</label>
              <textarea
                required
                rows={3}
                placeholder="How did the coaching session improve your game?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-400 hover:bg-purple-300 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Post Review
            </button>
          </form>
        )}

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 relative flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <span className="text-[11px] font-bold text-slate-400">{rev.date}</span>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    {rev.author}
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">{rev.sessionType}</div>
                </div>

                <span className="text-xs font-extrabold text-purple-400 bg-purple-400/10 px-2.5 py-1 rounded-lg border border-purple-400/20">
                  {rev.duprRating}
                </span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
