import React, { useState } from 'react';
import { Trophy, Calendar, User, ShieldCheck, Sparkles, LayoutDashboard, Menu, X, LogIn, LogOut, UserCheck } from 'lucide-react';
import { CoachProfile, UserAccount } from '../types';

interface NavbarProps {
  coachProfile: CoachProfile;
  isCoachPortalOpen: boolean;
  onToggleCoachPortal: () => void;
  onOpenBooking: () => void;
  onOpenQuiz: () => void;
  onOpenContentEditor?: () => void;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  onOpenMyBookings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  coachProfile,
  isCoachPortalOpen,
  onToggleCoachPortal,
  onOpenBooking,
  onOpenQuiz,
  onOpenContentEditor,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenMyBookings
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Live Availability', href: '#availability' },
    { name: 'Meet Coach Francis', href: '#coach-profile' },
    { name: 'Coaching Services & Rates', href: '#services' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-purple-500/20 ring-2 ring-purple-400/30">
              <span className="tracking-tighter">FD</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">FD Academy</span>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full border border-purple-400/20">
                  Pickleball
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Coach {coachProfile.name} • PPR Certified</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-medium text-slate-300 hover:text-purple-400 transition-colors py-1 relative group cursor-pointer"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* Actions & Portal Toggle */}
          <div className="hidden lg:flex items-center space-x-3">

            {/* Find my fit quiz button */}
            <button
              onClick={onOpenQuiz}
              className="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Session Quiz
            </button>

            {/* User / Admin Authentication Toolbar */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                {currentUser.role === 'admin' ? (
                  <button
                    onClick={onToggleCoachPortal}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Open Coach Admin Dashboard"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Coach Dashboard</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenMyBookings}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/40 hover:bg-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="View My Bookings"
                  >
                    <UserCheck className="w-4 h-4 text-purple-400" />
                    <span>My Bookings</span>
                  </button>
                )}

                <div className="px-2 text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{currentUser.name}</span>
                </div>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="text-xs font-extrabold px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-400/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-purple-400" />
                Log In
              </button>
            )}

            {/* Book Now Button */}
            <button
              onClick={onOpenBooking}
              className="bg-gradient-to-r from-purple-400 to-violet-400 hover:from-purple-300 hover:to-violet-300 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              Book Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            {currentUser ? (
              <button
                onClick={currentUser.role === 'admin' ? onToggleCoachPortal : onOpenMyBookings}
                className="p-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/40 text-xs font-bold flex items-center gap-1"
              >
                {currentUser.role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> : <UserCheck className="w-3.5 h-3.5" />}
                {currentUser.role === 'admin' ? 'Coach' : 'Bookings'}
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="p-2 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-400/30 text-xs font-bold flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                Log In
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.href)}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-purple-400"
            >
              {link.name}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-800 space-y-2">
            {!currentUser && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-500/10 text-purple-300 font-bold text-sm border border-purple-400/30"
              >
                <LogIn className="w-4 h-4 text-purple-400" />
                Log In / Create Account
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuiz();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 text-slate-200 font-medium text-sm border border-slate-700"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              Which Session Fits Me? (Quiz)
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-400 text-slate-950 font-bold text-sm shadow-md"
            >
              <Calendar className="w-4 h-4" />
              Book Private Session
            </button>

            {currentUser && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onLogout) onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-rose-400 font-medium text-xs border border-slate-700"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Out ({currentUser.name})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

