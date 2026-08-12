import React, { useEffect, useRef, useState } from 'react';
import { PHILIPPINE_PROVINCES, PROVINCE_VIEWBOX, PROVINCE_ALIASES } from './PhilippineProvinces';

/**
 * Line-art Philippine map rendered from GADM 4.1 province boundaries.
 *
 * When a province is selected (`highlight`), the SVG smoothly zooms into that
 * province's bounding box and back when deselected.
 */

const FULL_VIEWBOX = PROVINCE_VIEWBOX.split(' ').map(Number) as [number, number, number, number];
const MAP_W = FULL_VIEWBOX[2];
const MAP_H = FULL_VIEWBOX[3];
const MAP_RATIO = MAP_W / MAP_H;
const ANIMATION_MS = 550;

interface PhilippineMapProps {
  /** 10-digit PSGC code of the province to highlight and zoom into, or null for full map. */
  highlight: string | null;
  className?: string;
}

/** Compute the target viewBox to centre + zoom into a province's bounding box. */
function zoomViewBox(bbox: [number, number, number, number]): [number, number, number, number] {
  const [bx, by, bw, bh] = bbox;
  const cx = bx + bw / 2;
  const cy = by + bh / 2;
  // Province fills ~35 % of the viewport height; clamp to at least 250 SVG units tall
  const vh = Math.max(bh * 2.8, 250);
  const vw = Math.min(vh * MAP_RATIO, MAP_W);
  // Centre on the province, clamped so we don't overflow the map
  const vx = Math.max(0, Math.min(MAP_W - vw, cx - vw / 2));
  const vy = Math.max(0, Math.min(MAP_H - vh, cy - vh / 2));
  return [Math.round(vx), Math.round(vy), Math.round(vw), Math.round(vh)];
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Resolve a dropdown province code to the canonical map key. Some psgc.cloud
 * provinces (Davao Occidental, Maguindanao del Norte) have no polygon of their
 * own — GADM predates those splits — so we light up the combined parent polygon.
 */
function canonicalCode(code: string | null): string | null {
  return code ? (PROVINCE_ALIASES[code] ?? code) : null;
}

export const PhilippineMap: React.FC<PhilippineMapProps> = ({ highlight, className }) => {
  const [viewBox, setViewBox] = useState(FULL_VIEWBOX.join(' '));
  const animRef = useRef<number>(0);
  const fromRef = useRef<number[]>(FULL_VIEWBOX);

  useEffect(() => {
    const hl = canonicalCode(highlight);
    const target = hl && PHILIPPINE_PROVINCES[hl]
      ? zoomViewBox(PHILIPPINE_PROVINCES[hl].bbox)
      : FULL_VIEWBOX;
    const from = fromRef.current.map(Number);
    const startTime = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(1, elapsed / ANIMATION_MS);
      const e = easeOutCubic(t);
      const current = from.map((v, i) => v + (target[i] - v) * e);
      setViewBox(current.map(v => Math.round(v)).join(' '));
      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = [...target];
      }
    };

    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animRef.current);
  }, [highlight]);

  return (
    <svg
      viewBox={viewBox}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Map of the Philippines"
    >
      {/* SVG glow filter — two bright blurred copies composited behind the source.
          The region spans the whole map in user space (500×850) so the large
          stdDeviation blur can bleed out smoothly. The old objectBoundingBox
          region (-50%/200%) clipped the glow for small provinces, producing a
          hard box/line at the edge. */}
      <defs>
        <filter id="province-glow" x="-300" y="-300" width="1100" height="1450" filterUnits="userSpaceOnUse">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="28" result="blur2" />
          <feFlood floodColor="#a855f7" floodOpacity="1" result="color" />
          <feComposite in="color" in2="blur2" operator="in" result="outer" />
          <feComposite in="color" in2="blur1" operator="in" result="inner" />
          <feMerge>
            <feMergeNode in="outer" />
            <feMergeNode in="inner" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {Object.entries(PHILIPPINE_PROVINCES).map(([code, province]) => {
        const lit = code === canonicalCode(highlight);
        return (
          <path
            key={code}
            data-psgc={code}
            d={province.path}
            fillRule="evenodd"
            fill={lit ? 'rgba(192, 132, 252, 0.45)' : 'rgba(109, 40, 217, 0.06)'}
            stroke={lit ? '#f3e8ff' : '#6d28d9'}
            strokeWidth={lit ? 3 : 1.0}
            strokeLinejoin="round"
            strokeLinecap="round"
            filter={lit ? 'url(#province-glow)' : undefined}
            style={{
              transition: 'fill 0.35s ease, stroke 0.35s ease, stroke-width 0.35s ease',
            }}
          />
        );
      })}
    </svg>
  );
};
