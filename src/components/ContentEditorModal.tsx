import React, { useState } from 'react';
import { X, Save, Edit3, Type, User, DollarSign, RotateCcw, Check } from 'lucide-react';
import { CoachProfile, CoachingService, SiteCopy } from '../types';

interface ContentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  coachProfile: CoachProfile;
  services: CoachingService[];
  siteCopy: SiteCopy;
  onSaveProfile: (profile: CoachProfile) => void;
  onSaveServices: (services: CoachingService[]) => void;
  onSaveSiteCopy: (siteCopy: SiteCopy) => void;
  onResetDefaults: () => void;
}

export const ContentEditorModal: React.FC<ContentEditorModalProps> = ({
  isOpen,
  onClose,
  coachProfile,
  services,
  siteCopy,
  onSaveProfile,
  onSaveServices,
  onSaveSiteCopy,
  onResetDefaults
}) => {
  const [activeTab, setActiveTab] = useState<'headings' | 'profile' | 'services'>('headings');

  // Form states
  const [localSiteCopy, setLocalSiteCopy] = useState<SiteCopy>({ ...siteCopy });
  const [localProfile, setLocalProfile] = useState<CoachProfile>({ ...coachProfile });
  const [localServices, setLocalServices] = useState<CoachingService[]>([...services]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveAll = () => {
    onSaveSiteCopy(localSiteCopy);
    onSaveProfile(localProfile);
    onSaveServices(localServices);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleServiceChange = (id: string, field: keyof CoachingService, value: any) => {
    setLocalServices(prev =>
      prev.map(srv => (srv.id === id ? { ...srv, [field]: value } : srv))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-400/10 text-purple-400 border border-purple-400/20">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Live Visual Content Editor</h3>
              <p className="text-xs text-slate-400">Edit any website text, headlines, bio, and service prices without prompts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('headings')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'headings'
                ? 'bg-slate-900 text-purple-400 border-t-2 border-purple-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="w-4 h-4" />
            Headings & Page Text
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-purple-400 border-t-2 border-purple-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            Coach Bio & Details
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'services'
                ? 'bg-slate-900 text-purple-400 border-t-2 border-purple-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Services & Pricing
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: Headings & Copy */}
          {activeTab === 'headings' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Hero Main Headline</label>
                <input
                  type="text"
                  value={localSiteCopy.heroHeadline}
                  onChange={(e) => setLocalSiteCopy({ ...localSiteCopy, heroHeadline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-semibold focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Hero Subheadline / Pitch</label>
                <textarea
                  rows={2}
                  value={localSiteCopy.heroSubheadline}
                  onChange={(e) => setLocalSiteCopy({ ...localSiteCopy, heroSubheadline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Hero Status Badge</label>
                <input
                  type="text"
                  value={localSiteCopy.heroBadgeText}
                  onChange={(e) => setLocalSiteCopy({ ...localSiteCopy, heroBadgeText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Services Section Title</label>
                  <input
                    type="text"
                    value={localSiteCopy.servicesTitle}
                    onChange={(e) => setLocalSiteCopy({ ...localSiteCopy, servicesTitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Coach Section Title</label>
                  <input
                    type="text"
                    value={localSiteCopy.coachSectionTitle}
                    onChange={(e) => setLocalSiteCopy({ ...localSiteCopy, coachSectionTitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Coach Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Coach Full Name</label>
                  <input
                    type="text"
                    value={localProfile.name}
                    onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 font-semibold focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Title / Tagline</label>
                  <input
                    type="text"
                    value={localProfile.title}
                    onChange={(e) => setLocalProfile({ ...localProfile, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Certification & Credentials</label>
                <input
                  type="text"
                  value={localProfile.certification}
                  onChange={(e) => setLocalProfile({ ...localProfile, certification: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Coach Bio / Story</label>
                <textarea
                  rows={4}
                  value={localProfile.bio}
                  onChange={(e) => setLocalProfile({ ...localProfile, bio: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Location / Courts</label>
                  <input
                    type="text"
                    value={localProfile.locationCity}
                    onChange={(e) => setLocalProfile({ ...localProfile, locationCity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email</label>
                  <input
                    type="text"
                    value={localProfile.email}
                    onChange={(e) => setLocalProfile({ ...localProfile, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone</label>
                  <input
                    type="text"
                    value={localProfile.phone}
                    onChange={(e) => setLocalProfile({ ...localProfile, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Services & Pricing */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              {localServices.map((srv, idx) => (
                <div key={srv.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-extrabold text-purple-400">Service #{idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Price ($):</span>
                      <input
                        type="number"
                        value={srv.price}
                        onChange={(e) => handleServiceChange(srv.id, 'price', Number(e.target.value))}
                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 font-bold text-white text-right focus:ring-2 focus:ring-purple-400 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Title</label>
                      <input
                        type="text"
                        value={srv.title}
                        onChange={(e) => handleServiceChange(srv.id, 'title', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 font-semibold focus:ring-2 focus:ring-purple-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Subtitle</label>
                      <input
                        type="text"
                        value={srv.subtitle}
                        onChange={(e) => handleServiceChange(srv.id, 'subtitle', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={srv.description}
                      onChange={(e) => handleServiceChange(srv.id, 'description', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={onResetDefaults}
            className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All to Defaults
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className={`px-6 py-2.5 rounded-xl text-slate-950 text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                savedSuccess
                  ? 'bg-emerald-400 shadow-emerald-500/20'
                  : 'bg-purple-400 hover:bg-purple-300 shadow-purple-500/20'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved to App!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save & Update Site
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
