import React from 'react';
import { CoachProfile } from '../types';

interface CoachAvatarProps {
  coach: CoachProfile;
  /** Extra classes appended to the photo/initials element (e.g. hover transforms). */
  className?: string;
  /** Text-size classes for the initials fallback (defaults to `text-4xl`). */
  initialsClassName?: string;
}

const PALETTES = [
  'from-purple-500 to-violet-600',
  'from-rose-500 to-orange-500',
  'from-emerald-500 to-teal-600'
];

/**
 * Renders a coach's photo when one is set, otherwise a clean gradient
 * initials avatar — so placeholder coaches look intentional (and never
 * fall back to another coach's face) until real headshots are added.
 */
export const CoachAvatar: React.FC<CoachAvatarProps> = ({
  coach,
  className = '',
  initialsClassName = 'text-4xl'
}) => {
  if (coach.photo) {
    return (
      <img
        src={coach.photo}
        alt={coach.name}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover object-top ${className}`}
      />
    );
  }

  const initials =
    coach.name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'C';
  const palette = PALETTES[(coach.name.charCodeAt(0) + coach.name.length) % PALETTES.length];

  return (
    <div
      role="img"
      aria-label={`${coach.name} — photo coming soon`}
      className={`w-full h-full bg-gradient-to-br ${palette} flex items-center justify-center text-white font-black tracking-wide select-none ${className} ${initialsClassName}`}
    >
      {initials}
    </div>
  );
};
