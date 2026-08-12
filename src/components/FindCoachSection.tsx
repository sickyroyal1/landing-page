import React, { useState } from 'react';
import { CoachProfile } from '../types';
import { PSGCProvince, PSGCCity } from '../data/psgc';
import { MapPin, Users, ChevronRight, RotateCcw, Building2, Loader2, Search, X } from 'lucide-react';
import { CoachAvatar } from './CoachAvatar';
import { PhilippineMap } from './PhilippineMap';

interface FindCoachSectionProps {
  provinces: PSGCProvince[];
  cities: PSGCCity[];
  loading: boolean;
  coaches: CoachProfile[];
  selectedProvinceCode: string | null;
  selectedCityCode: string | null;
  onSelectProvince: (provinceCode: string | null) => void;
  onSelectCity: (cityCode: string | null) => void;
  onSelectCoach: (coachId: string) => void;
}

const selectClass =
  "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-purple-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none";

export const FindCoachSection: React.FC<FindCoachSectionProps> = ({
  provinces,
  cities,
  loading,
  coaches,
  selectedProvinceCode,
  selectedCityCode,
  onSelectProvince,
  onSelectCity,
  onSelectCoach
}) => {
  // "Know your coach already?" name search — independent of the city dropdown.
  const [searchQuery, setSearchQuery] = useState('');
  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;

  const activeCoaches = coaches.filter((c) => c.isActive);
  const selectedProvince = provinces.find((p) => p.code === selectedProvinceCode) ?? null;
  const selectedCity = selectedCityCode
    ? cities.find((c) => c.code === selectedCityCode) ?? null
    : null;

  // City filter: coaches serving the picked city/municipality.
  const filteredCoaches = selectedCityCode
    ? activeCoaches.filter((c) => c.locationIds.includes(selectedCityCode))
    : [];

  // Province-wide roster for the name search — every active coach serving any
  // city in the selected province (all seeded coaches are in Negros Oriental).
  // Falls back to the full roster when no province has been picked.
  const provinceCoaches = selectedProvinceCode
    ? activeCoaches.filter((c) => c.locationIds.some((id) => cities.some((city) => city.code === id)))
    : activeCoaches;

  const searchResults = isSearching
    ? provinceCoaches.filter((c) => c.name.toLowerCase().includes(query))
    : [];

  // The coach list appears once a city is picked OR once a name is searched.
  const showCoachList = selectedCityCode !== null || isSearching;
  const listCoaches = isSearching ? searchResults : filteredCoaches;

  // Cities a coach serves for the card chips — the selected city in city mode,
  // or every served city in the province when searching by name.
  const servedCities = (coach: CoachProfile): PSGCCity[] =>
    selectedCityCode
      ? cities.filter((c) => c.code === selectedCityCode && coach.locationIds.includes(c.code))
      : cities.filter((c) => coach.locationIds.includes(c.code));

  const resetAll = () => {
    onSelectProvince(null);
    onSelectCity(null);
    setSearchQuery('');
  };

  return (
    <section id="find-coach" className="min-h-screen py-20 bg-slate-950 text-white relative flex items-center snap-start">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-400/10 border border-purple-400/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            Philippines
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Find Your Coach Anywhere in the Philippines
          </h2>
          <p className="text-slate-300 text-base">
            Select your province and city — we'll show you pro coaches serving your area.
          </p>
        </div>

        {/* Cascading dropdowns + name search: Province → City → Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {/* Province */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
              <Building2 className="w-3.5 h-3.5 text-purple-400" /> Province
            </label>
            <div className="relative">
              <select
                value={selectedProvinceCode ?? ''}
                onChange={(e) => onSelectProvince(e.target.value || null)}
                disabled={loading}
                className={`${selectClass} ${selectedProvinceCode ? 'text-white' : 'text-slate-500'}`}
              >
                <option value="">{loading ? 'Loading provinces…' : 'Select a province'}</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
              {loading && <Loader2 className="w-4 h-4 text-purple-400 absolute right-3 top-3.5 animate-spin pointer-events-none" />}
            </div>
          </div>

          {/* City / Municipality */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
              <MapPin className="w-3.5 h-3.5 text-purple-400" /> City / Municipality
            </label>
            <select
              value={selectedCityCode ?? ''}
              onChange={(e) => onSelectCity(e.target.value || null)}
              disabled={!selectedProvinceCode}
              className={`${selectClass} ${selectedCityCode ? 'text-white' : 'text-slate-500'}`}
            >
              <option value="">
                {selectedProvinceCode
                  ? `All areas in ${selectedProvince.name}`
                  : 'Pick a province first'}
              </option>
              {cities.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Search by coach name — third cell in the header row */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
              <Search className="w-3.5 h-3.5 text-purple-400" /> Know your coach already?
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search them here"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-9 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 transition-colors"
              />
              {isSearching && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-4 text-slate-500 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {isSearching && (
              <p className="text-[11px] text-slate-400 mt-2 font-semibold">
                {searchResults.length > 0
                  ? `${searchResults.length} coach${searchResults.length === 1 ? '' : 'es'} found`
                  : 'No coaches match that name'}
              </p>
            )}
          </div>
        </div>

        {/* Result area — map always visible; coach list appears on the right
            when a city is picked or a coach name is searched */}
        <div className="mt-10">
          <div className={`flex gap-6 items-start ${!showCoachList ? 'justify-center' : ''}`}>

            {/* ── Map ──────────────────────────────────────────────────────── */}
            <div
              className={`rounded-2xl bg-slate-900 border border-slate-800 px-6 py-10 flex flex-col items-center transition-all duration-500 ease-in-out ${
                showCoachList ? 'flex-1 min-w-0' : 'flex-1 max-w-3xl min-w-0'
              }`}
            >
              <div className={`${selectedProvinceCode ? 'h-[42rem]' : 'h-[33rem]'} w-full`}>
                <PhilippineMap
                  highlight={selectedProvinceCode}
                  className="w-full h-full"
                />
              </div>

              {/* Instruction text — only shown when no city is picked and nothing is being searched */}
              {!selectedCityCode && !isSearching && (
                <p className="mt-8 text-sm text-center max-w-md leading-relaxed">
                  {selectedProvince ? (
                    <>
                      <span className="text-white font-bold">{selectedProvince.name}</span>
                      <span className="text-slate-400">
                        {' '}is lit up on the map. Now pick a city or municipality to see coaches there.
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400">
                      Select a province and we'll light it up on the map, then choose your city to find coaches nearby.
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* ── Coach list (right side, when a city is picked or name searched) ── */}
            {showCoachList && (
              <div className="flex-1 space-y-4 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 truncate">
                    {isSearching
                      ? `Results for “${searchQuery.trim()}”`
                      : selectedCity
                        ? `Coaches in ${selectedCity.name}${selectedProvince ? `, ${selectedProvince.name}` : ''}`
                        : 'Coaches'}
                  </h3>
                  <button
                    onClick={resetAll}
                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>

                {listCoaches.length === 0 ? (
                  <div className="p-10 bg-slate-900 rounded-2xl border border-slate-800 text-center">
                    <p className="text-slate-300 font-semibold">
                      {isSearching ? `No coaches match “${searchQuery.trim()}”.` : 'No coaches in this area yet.'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {isSearching ? 'Try another name or check the spelling.' : "Check back soon — we're expanding to more cities."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 overflow-y-auto max-h-[44rem] pr-1 scrollbar-thin">
                    {listCoaches.map((coach) => {
                      const served = servedCities(coach);
                      return (
                        <div
                          key={coach.id}
                          className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-purple-400/50 transition-all"
                        >
                          <div className="h-40 bg-slate-800/60 relative overflow-hidden">
                            <CoachAvatar coach={coach} />
                          </div>

                          <div className="p-5">
                            <h4 className="text-lg font-black text-white">{coach.name}</h4>
                            <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                              <Users className="w-3 h-3" /> DUPR {coach.duprRating.toFixed(1)}
                            </p>

                            {served.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {served.map((a) => (
                                  <span key={a.code} className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                                    {a.name}
                                  </span>
                                ))}
                              </div>
                            )}

                            <button
                              onClick={() => onSelectCoach(coach.id)}
                              className="mt-4 w-full py-2.5 rounded-xl bg-purple-400 hover:bg-purple-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                            >
                              View Schedule & Book
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
