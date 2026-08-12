import React, { useState } from 'react';
import { UserAccount, SkillLevel, CoachProfile } from '../types';
import { X, ShieldCheck, User, Mail, Sparkles, UserCheck, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserAccount) => void;
  coaches: CoachProfile[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  coaches
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'user' | 'coach' | 'admin'>('user');
  const [selectedCoachId, setSelectedCoachId] = useState<string>('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('3.5 - Intermediate');

  if (!isOpen) return null;

  // Demo accounts
  const demoAdmin: UserAccount = {
    id: 'usr-admin-1',
    name: 'Coach Francis',
    email: 'admin@dinklab.com',
    role: 'admin',
    phone: '+63 917 234 5678',
    skillLevel: '4.5+ - Advanced / Tournament'
  };

  const demoUser: UserAccount = {
    id: 'usr-player-1',
    name: 'Alex Morgan',
    email: 'alex.m@gmail.com',
    role: 'user',
    phone: '+63 918 987 6543',
    skillLevel: '3.5 - Intermediate'
  };

  // One demo coach account per coach in the roster
  const demoCoachAccounts: UserAccount[] = coaches.map((c) => ({
    id: `usr-coach-${c.id}`,
    name: `Coach ${c.name}`,
    email: c.email,
    role: 'coach',
    coachId: c.id,
    phone: c.phone,
    skillLevel: '4.5+ - Advanced / Tournament'
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const coach = coaches.find((c) => c.id === selectedCoachId) ?? coaches[0];

    const user: UserAccount = {
      id: `usr-${Date.now()}`,
      name: role === 'coach' ? `Coach ${coach?.name ?? 'Coach'}` : name || (email.split('@')[0]),
      email,
      role,
      coachId: role === 'coach' ? coach?.id : undefined,
      phone: phone || '+63 917 123 4567',
      skillLevel
    };

    onLogin(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white max-h-[90vh] flex flex-col overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500/20 via-slate-900 to-slate-900 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">DINKLAB + Account</h3>
              <p className="text-xs text-slate-400">Log in or sign up to manage bookings</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Logins Banner */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Quick Demo One-Click Login:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onLogin(demoAdmin);
                onClose();
              }}
              className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Log in as <strong>Admin</strong></span>
            </button>

            <button
              onClick={() => {
                onLogin(demoUser);
                onClose();
              }}
              className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Log in as <strong>Player</strong></span>
            </button>
          </div>

          {demoCoachAccounts.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {demoCoachAccounts.map((ca) => (
                <button
                  key={ca.id}
                  onClick={() => { onLogin(ca); onClose(); }}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Coach <strong>{ca.name.replace('Coach ', '')}</strong></span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabs: Login / Sign Up */}
        <div className="flex border-b border-slate-800 bg-slate-950/30">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'border-purple-400 text-purple-400 bg-purple-400/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'border-purple-400 text-purple-400 bg-purple-400/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 min-h-0 overflow-y-auto">
          
          {/* Role selector for signup or explicit role choice */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Account Role</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'user'
                    ? 'bg-purple-400/20 border-purple-400 text-purple-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Player
              </button>
              <button
                type="button"
                onClick={() => setRole('coach')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'coach'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Coach
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'admin'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Admin
              </button>
            </div>

            {role === 'coach' && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-300 mb-1">Which coach are you?</label>
                <select
                  value={selectedCoachId}
                  onChange={(e) => setSelectedCoachId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {coaches.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {activeTab === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'admin' ? 'admin@dinklab.com' : 'player@gmail.com'}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {activeTab === 'signup' && role === 'user' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Skill Level</label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
              >
                <option value="2.5 - Beginner">2.5 - Beginner</option>
                <option value="3.0 - Advanced Beginner">3.0 - Advanced Beginner</option>
                <option value="3.5 - Intermediate">3.5 - Intermediate</option>
                <option value="4.0 - Advanced Intermediate">4.0 - Advanced Intermediate</option>
                <option value="4.5+ - Advanced / Tournament">4.5+ - Advanced / Tournament</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-400 to-violet-400 hover:from-purple-300 hover:to-violet-300 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-purple-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <KeyRound className="w-4 h-4" />
            {activeTab === 'login' ? `Log In as ${role === 'admin' ? 'Admin' : 'User'}` : 'Create Account'}
          </button>
        </form>

      </div>
    </div>
  );
};
