import React, { useState } from 'react';
import { Menu, X, LogIn, LogOut, UserCheck, UserPlus, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { CoachProfile, UserAccount } from '../types';

interface NavbarProps {
  coachProfile: CoachProfile;
  isCoachPortalOpen: boolean;
  onToggleCoachPortal: () => void;
  onOpenBooking: () => void;
  onOpenAdminDashboard?: () => void;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
  onOpenRegistration?: () => void;
  onLogout?: () => void;
  onOpenMyBookings?: () => void;
  /** True on the landing view, which shows only the coach picker. */
  isLanding?: boolean;
  /** When set, the "Find a Coach" link exits the current coach's portal. */
  onFindCoach?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  coachProfile,
  isCoachPortalOpen,
  onToggleCoachPortal,
  onOpenBooking,
  onOpenAdminDashboard,
  currentUser,
  onOpenAuthModal,
  onOpenRegistration,
  onLogout,
  onOpenMyBookings,
  isLanding = false,
  onFindCoach
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Availability', href: '#availability' },
    { name: 'Rates', href: '#services' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white transition-all" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo & Branding */}
          <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src={`${import.meta.env.BASE_URL}DINKLAB + Text White.png`}
              alt="DINKLAB +"
              draggable={false}
              className="h-42 md:h-48 w-auto select-none"
            />
          </div>

          {/* Desktop Navigation Links — hidden on landing (picker only) */}
          {!isLanding && (
            <nav className="hidden md:flex items-center space-x-12">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className="text-sm font-semibold tracking-wide text-slate-300 hover:text-purple-400 transition-colors py-1 relative group cursor-pointer"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full" />
                </button>
              ))}
            </nav>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              /* Logged-in toolbar: role chip + name + logout */
              <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                {currentUser.role === 'admin' ? (
                  <button
                    onClick={onOpenAdminDashboard}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/40 hover:bg-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Open the full Admin Dashboard"
                  >
                    <LayoutDashboard className="w-4 h-4 text-purple-400" />
                    <span>Admin Dashboard</span>
                  </button>
                ) : currentUser.role === 'coach' ? (
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
              /* Not logged in: single Sign In button (opens AuthModal with Login + Sign Up tabs) */
              <button
                onClick={onOpenAuthModal}
                className="text-xs font-extrabold px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-400/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-purple-400" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile: Sign In (if not logged in) + Hamburger */}
          <div className="flex items-center space-x-2 md:hidden">
            {!currentUser && (
              <button
                onClick={onOpenAuthModal}
                className="p-2 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-400/30 text-xs font-bold flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}

            {currentUser && (
              <button
                onClick={currentUser.role === 'admin' ? onOpenAdminDashboard : currentUser.role === 'coach' ? onToggleCoachPortal : onOpenMyBookings}
                className="p-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/40 text-xs font-bold flex items-center gap-1"
              >
                {currentUser.role === 'admin' ? <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" /> : currentUser.role === 'coach' ? <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> : <UserCheck className="w-3.5 h-3.5" />}
                {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'coach' ? 'Coach' : 'Bookings'}
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-2">
          {/* Nav links */}
          {!isLanding && navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.href)}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-purple-400 transition-colors"
            >
              {link.name}
            </button>
          ))}

          {/* Auth actions */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            {!currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-500/10 text-purple-300 font-bold text-sm border border-purple-400/30"
              >
                <LogIn className="w-4 h-4 text-purple-400" />
                Sign In
              </button>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-semibold">{currentUser.name}</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 text-rose-400 font-medium text-sm border border-slate-700"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
