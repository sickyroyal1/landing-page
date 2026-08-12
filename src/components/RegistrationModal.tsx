import React, { useState, useEffect } from 'react';
import { UserAccount, SkillLevel, CoachProfile, CoachAchievement } from '../types';
import { PSGCProvince, PSGCCity, fetchAllProvinces, fetchCities } from '../data/psgc';
import { initialCourts } from '../data/mockData';
import { X, User, Users, Mail, Phone, MapPin, Sparkles, TrendingUp, Trophy, Plus, Trash2 } from 'lucide-react';

// Fallback PSGC data (Negros Oriental) so registration still works offline or
// when the PSGC API is unreachable.
const FALLBACK_PROVINCES: PSGCProvince[] = [{ code: "0704600000", name: "Negros Oriental" }];
const FALLBACK_CITIES: PSGCCity[] = initialCourts.map((c) => ({
  code: c.psgcCode,
  name: c.name,
  type: c.type === "Indoor" ? "City" : "Mun",
  zip_code: "",
  district: ""
}));

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClient: (user: UserAccount) => void;
  onRegisterCoach: (coach: CoachProfile, user: UserAccount, areaNames?: Record<string, string>) => void;
  /** Called when the user clicks "Already have an account?" to switch to login. */
  onSwitchToLogin?: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisterClient,
  onRegisterCoach,
  onSwitchToLogin
}) => {
  const [activeTab, setActiveTab] = useState<'client' | 'coach'>('client');

  // Shared fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Client fields
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('3.5 - Intermediate');

  // Coach fields
  const [duprRating, setDuprRating] = useState(4.0);
  const [yearsCoaching, setYearsCoaching] = useState(1);
  const [bio, setBio] = useState('');
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);

  // PSGC geographic picker (province → city/municipality)
  const [psgcProvinces, setPsgcProvinces] = useState<PSGCProvince[]>([]);
  const [psgcCities, setPsgcCities] = useState<PSGCCity[]>([]);
  const [provinceCode, setProvinceCode] = useState('');
  const [cityCode, setCityCode] = useState('');
  const [cityLabels, setCityLabels] = useState<Record<string, string>>({});

  // Load the full PSGC province list once on mount (offline fallback available).
  useEffect(() => {
    fetchAllProvinces()
      .then((p) => setPsgcProvinces(p.length ? p : FALLBACK_PROVINCES))
      .catch(() => setPsgcProvinces(FALLBACK_PROVINCES));
  }, []);

  // Coach achievements (optional — shown on the hero if enabled)
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievements, setAchievements] = useState<CoachAchievement[]>([]);

  const addAchievement = () => {
    setAchievements((prev) => [
      ...prev,
      { id: `ach-draft-${prev.length}-${Date.now()}`, title: '', description: '', imageUrl: '' }
    ]);
  };
  const updateAchievement = (id: string, field: 'title' | 'description' | 'imageUrl', value: string) => {
    setAchievements((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };
  const removeAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  if (!isOpen) return null;

  // Cascading PSGC handlers — picking a region loads its provinces, picking a
  // province loads its cities. Coaches set availability at the city level.
  const handleProvinceChange = (code: string) => {
    setProvinceCode(code);
    setCityCode('');
    setPsgcCities([]);
    if (!code) return;
    fetchCities(code)
      .then((c) => setPsgcCities(c.length ? c : FALLBACK_CITIES))
      .catch(() => setPsgcCities(FALLBACK_CITIES));
  };

  const addLocation = () => {
    const city = psgcCities.find((c) => c.code === cityCode);
    if (!city || selectedAreaIds.includes(cityCode)) return;
    const province = psgcProvinces.find((p) => p.code === provinceCode);
    const label = province ? `${city.name}, ${province.name}` : city.name;
    setSelectedAreaIds((prev) => [...prev, cityCode]);
    setCityLabels((prev) => ({ ...prev, [cityCode]: label }));
    setCityCode('');
  };

  const removeLocation = (code: string) => {
    setSelectedAreaIds((prev) => prev.filter((id) => id !== code));
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setSkillLevel('3.5 - Intermediate');
    setDuprRating(4.0);
    setYearsCoaching(1);
    setBio('');
    setSelectedAreaIds([]);
    setCityLabels({});
    setProvinceCode('');
    setCityCode('');
    setPsgcCities([]);
    setShowAchievements(false);
    setAchievements([]);
    setActiveTab('client');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const user: UserAccount = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'user',
      phone: phone || '+63 917 000 0000',
      skillLevel
    };
    onRegisterClient(user);
    resetForm();
  };

  const handleCoachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || selectedAreaIds.length === 0) return;

    const firstLabel = cityLabels[selectedAreaIds[0]];

    const coach: CoachProfile = {
      id: `coach-reg-${Date.now()}`,
      name,
      title: 'Pickleball Coach at DINKLAB +',
      certification: '',
      duprRating,
      yearsCoaching,
      studentsTrained: 0,
      bio: bio || `${name} is a new member of the DINKLAB + team — full bio coming soon.`,
      specialties: [],
      email,
      phone: phone || '+63 917 000 0000',
      instagram: '',
      locationCity: firstLabel || 'Negros Oriental',
      locationIds: selectedAreaIds,
      photo: '',
      achievements: showAchievements ? achievements.filter((a) => a.title.trim() !== '') : undefined,
      showAchievements,
      isActive: true
    };

    const user: UserAccount = {
      id: `usr-coach-${coach.id}`,
      name: `Coach ${name}`,
      email,
      role: 'coach',
      coachId: coach.id,
      phone: coach.phone,
      skillLevel: '4.5+ - Advanced / Tournament'
    };

    onRegisterCoach(coach, user, cityLabels);
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl text-white overflow-hidden my-6 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500/20 via-slate-900 to-slate-900 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Create Your DINKLAB + Account</h3>
              <p className="text-xs text-slate-400">Register as a player — or apply to join our coaching team</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30">
          <button
            onClick={() => setActiveTab('client')}
            className={`flex-1 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
              activeTab === 'client'
                ? 'border-purple-400 text-purple-400 bg-purple-400/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Prospect Client
            </span>
          </button>
          <button
            onClick={() => setActiveTab('coach')}
            className={`flex-1 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
              activeTab === 'coach'
                ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" /> Be One of Our Coaches
            </span>
          </button>
        </div>

        {activeTab === 'client' ? (
          /* ------------------------- CLIENT REGISTRATION ------------------------- */
          <form onSubmit={handleClientSubmit} className="p-6 space-y-4 flex-1 min-h-0 overflow-y-auto">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-400/10 border border-purple-400/20 text-xs text-purple-300">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              Book sessions, track your schedule, and pay securely once you're registered.
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Juan Dela Cruz"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09xx xxx xxxx"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </div>

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

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-400 to-violet-400 hover:from-purple-300 hover:to-violet-300 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-purple-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <User className="w-4 h-4" />
              Register as a Client
            </button>

            {onSwitchToLogin && (
              <p className="text-center text-xs text-slate-400 pt-1">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-purple-300 font-bold hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </p>
            )}
          </form>
        ) : (
          /* ------------------------- COACH REGISTRATION ------------------------- */
          <form onSubmit={handleCoachSubmit} className="p-6 space-y-4 flex-1 min-h-0 overflow-y-auto">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              Apply to coach with DINKLAB +. Your profile goes live and players in your regions can book you right away.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Coach Maria Santos"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="coach@email.com"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09xx xxx xxxx"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">DUPR Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="2.0"
                  max="6.0"
                  value={duprRating}
                  onChange={(e) => setDuprRating(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Years Coaching</label>
                <input
                  type="number"
                  min="0"
                  value={yearsCoaching}
                  onChange={(e) => setYearsCoaching(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Coaching Bio <span className="text-slate-500">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell players about your coaching style and experience…"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Where are you available to coach — cascading PSGC dropdowns */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    Where are you available to coach?
                  </span>
                </label>
                <span className="text-[11px] font-bold text-slate-500">
                  {selectedAreaIds.length} location{selectedAreaIds.length !== 1 ? 's' : ''} selected
                </span>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 space-y-2.5">
                {/* Province → City cascading selects */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Province</label>
                    <select
                      value={provinceCode}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="">{psgcProvinces.length === 0 ? 'Loading provinces…' : 'Select a province'}</option>
                      {psgcProvinces.map((p) => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">City / Municipality</label>
                    <select
                      value={cityCode}
                      onChange={(e) => setCityCode(e.target.value)}
                      disabled={!provinceCode}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <option value="">{provinceCode ? 'Select a city' : 'Pick a province first'}</option>
                      {psgcCities.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Add this location */}
                <button
                  type="button"
                  onClick={addLocation}
                  disabled={!cityCode || selectedAreaIds.includes(cityCode)}
                  className="w-full py-2 rounded-lg border border-dashed border-amber-400/40 text-amber-300 text-xs font-bold hover:bg-amber-400/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add this location
                </button>

                {/* Added locations as removable chips */}
                {selectedAreaIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {selectedAreaIds.map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/30 px-2 py-1 rounded-lg"
                      >
                        {cityLabels[code] ?? code}
                        <button
                          type="button"
                          onClick={() => removeLocation(code)}
                          className="text-amber-300/60 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove location"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {selectedAreaIds.length === 0 && (
                <p className="text-[11px] text-rose-400 mt-1.5">Add at least one location to submit your application.</p>
              )}
            </div>

            {/* Coach achievements — optional display on the hero */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    Show achievements on your profile?
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowAchievements(true)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    showAchievements
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                      : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  ✓ Yes
                </button>
                <button
                  type="button"
                  onClick={() => setShowAchievements(false)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    !showAchievements
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                      : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  No
                </button>
              </div>

              {showAchievements && (
                <div className="mt-3 space-y-2">
                  <p className="text-[11px] text-slate-400">
                    Add up to 3 accomplishments — an image is optional (trophy icon shown instead).
                  </p>

                  {achievements.map((a) => (
                    <div key={a.id} className="rounded-xl border border-slate-700 bg-slate-950 p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={a.title}
                            onChange={(e) => updateAchievement(a.id, 'title', e.target.value)}
                            placeholder="e.g. IPTPA Certified Coach"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                          <input
                            type="text"
                            value={a.description ?? ''}
                            onChange={(e) => updateAchievement(a.id, 'description', e.target.value)}
                            placeholder="Short description (optional)"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                          <input
                            type="text"
                            value={a.imageUrl ?? ''}
                            onChange={(e) => updateAchievement(a.id, 'imageUrl', e.target.value)}
                            placeholder="Image URL (optional)"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAchievement(a.id)}
                          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
                          title="Remove achievement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {achievements.length < 3 && (
                    <button
                      type="button"
                      onClick={addAchievement}
                      className="w-full py-2.5 rounded-xl border border-dashed border-amber-400/40 text-amber-300 text-xs font-bold hover:bg-amber-400/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add achievement
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={selectedAreaIds.length === 0}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trophy className="w-4 h-4" />
              Submit Coach Application
            </button>

            {onSwitchToLogin && (
              <p className="text-center text-xs text-slate-400 pt-1">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-purple-300 font-bold hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
