/**
 * PSGC (Philippine Standard Geographic Code) API service.
 * Fetches the province → city/municipality hierarchy from psgc.cloud
 * with localStorage caching (7-day TTL) to minimize API calls.
 */

const BASE_URL = 'https://psgc.cloud/api';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Types ────────────────────────────────────────────────────────────────────

export interface PSGCProvince {
  name: string;
  code: string;
}

export interface PSGCCity {
  name: string;
  code: string;
  type: string;      // "City" | "Mun"
  zip_code: string;
  district: string;
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

function cacheKey(prefix: string, code?: string): string {
  return code ? `psgc_${prefix}_${code}` : `psgc_${prefix}`;
}

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, fetchedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Storage full or unavailable — silently skip caching
  }
}

// ── Fetch functions ───────────────────────────────────────────────────────────

/**
 * Fetch all 82 provinces nationwide in a single call — no region selection
 * needed. Cached under `psgc_provinces` (7-day TTL).
 */
export async function fetchAllProvinces(): Promise<PSGCProvince[]> {
  const key = cacheKey('provinces');
  const cached = readCache<PSGCProvince[]>(key);
  if (cached) {
    cached.sort((a, b) => a.name.localeCompare(b.name));
    return cached;
  }

  const res = await fetch(`${BASE_URL}/provinces`);
  if (!res.ok) throw new Error(`PSGC provinces fetch failed: ${res.status}`);
  const data: PSGCProvince[] = await res.json();
  data.sort((a, b) => a.name.localeCompare(b.name));
  writeCache(key, data);
  return data;
}

export async function fetchCities(provinceCode: string): Promise<PSGCCity[]> {
  const key = cacheKey('cities', provinceCode);
  const cached = readCache<PSGCCity[]>(key);
  if (cached) return cached;

  const res = await fetch(`${BASE_URL}/provinces/${provinceCode}/cities-municipalities`);
  if (!res.ok) throw new Error(`PSGC cities fetch failed: ${res.status}`);
  const data: PSGCCity[] = await res.json();
  writeCache(key, data);
  return data;
}

// ── Coach matching helpers ────────────────────────────────────────────────────

import { CoachProfile } from '../types';

/** Check if a coach serves a specific city/municipality (by PSGC code). */
export function coachServesCity(coach: CoachProfile, cityCode: string): boolean {
  return coach.locationIds.includes(cityCode);
}

/** Check if a coach serves any city within a province. */
export function coachServesProvince(
  coach: CoachProfile,
  provinceCode: string,
  cities: PSGCCity[]
): boolean {
  return coach.locationIds.some((id) => cities.some((c) => c.code === id));
}

/** Check if a coach serves any city within a region (requires province → city mapping). */
export function coachServesRegion(
  coach: CoachProfile,
  regionCode: string,
  provinceCityMap: Map<string, PSGCCity[]>
): boolean {
  for (const [, cities] of provinceCityMap) {
    if (coach.locationIds.some((id) => cities.some((c) => c.code === id))) {
      return true;
    }
  }
  return false;
}

/**
 * Look up a city name from its PSGC code.
 * Requires the cities array for the relevant province.
 */
export function cityNameFromCode(code: string, cities: PSGCCity[]): string {
  return cities.find((c) => c.code === code)?.name ?? code;
}

/**
 * Build a flat lookup map from city PSGC code to city name.
 * Pass all fetched cities (from any number of provinces).
 */
export function buildCityNameMap(...cityArrays: PSGCCity[][]): Map<string, string> {
  const map = new Map<string, string>();
  for (const cities of cityArrays) {
    for (const c of cities) {
      map.set(c.code, c.name);
    }
  }
  return map;
}
