import type { Note } from '../types';

// Layout constants
const NECK_LEFT = 80;   // x of the nut
const NECK_RIGHT = 860; // x of the 12th fret line
const FRET_COUNT = 12;
const FRET_SPACING = (NECK_RIGHT - NECK_LEFT) / FRET_COUNT; // 65px
const STRING_COUNT = 6;
const STRING_TOP = 30;  // y of string 6 (low E)
const STRING_SPACING = 32;
const OPEN_X = 48;      // x of open-string circles (left of nut)
const SVG_WIDTH = 920;
const SVG_HEIGHT = 225;

// Frets with inlay dots (single)
const SINGLE_DOT_FRETS = [3, 5, 7, 9];
// y positions for the double dot at fret 12
// Between strings 5↔4 and 2↔1 (player-view orientation)
const DOUBLE_DOT_YS = [
  STRING_TOP + STRING_SPACING * 1.5, // between string 5 (y=62) and string 4 (y=94) → 78
  STRING_TOP + STRING_SPACING * 3.5, // between string 3 (y=126) and string 2 (y=158) → 142
];

// String 1 (high E) sits at the bottom; string 6 (low E) at the top — matches
// the player's-eye view of a guitar neck.
function stringY(s: number): number {
  return STRING_TOP + (6 - s) * STRING_SPACING;
}

function fretCx(fret: number): number {
  if (fret === 0) return OPEN_X;
  return NECK_LEFT + (fret - 0.5) * FRET_SPACING;
}

function dotCx(fret: number): number {
  return NECK_LEFT + (fret - 0.5) * FRET_SPACING;
}

// Vary string stroke width: string 6 (low E) is thickest
function stringWidth(s: number): number {
  return 0.5 + (s - 1) * 0.28;
}

interface Props {
  activeNotes: Note[];
}

export function GuitarNeck({ activeNotes }: Props) {
  const activeSet = new Set(activeNotes.map((n) => `${n.string}-${n.fret}`));

  const neckMidY = STRING_TOP + ((STRING_COUNT - 1) * STRING_SPACING) / 2;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full max-w-5xl mx-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fretboard body */}
        <rect
          x={NECK_LEFT}
          y={STRING_TOP - 12}
          width={NECK_RIGHT - NECK_LEFT}
          height={(STRING_COUNT - 1) * STRING_SPACING + 24}
          rx={3}
          fill="#1e1208"
        />

        {/* Headstock-side area (open strings) */}
        <rect
          x={12}
          y={STRING_TOP - 12}
          width={NECK_LEFT - 12}
          height={(STRING_COUNT - 1) * STRING_SPACING + 24}
          rx={3}
          fill="#14100a"
        />

        {/* Inlay dots */}
        {SINGLE_DOT_FRETS.map((fret) => (
          <circle
            key={fret}
            cx={dotCx(fret)}
            cy={neckMidY}
            r={5}
            fill="#3a2a18"
          />
        ))}
        {DOUBLE_DOT_YS.map((y, i) => (
          <circle key={i} cx={dotCx(12)} cy={y} r={5} fill="#3a2a18" />
        ))}

        {/* Fret lines */}
        {Array.from({ length: FRET_COUNT + 1 }).map((_, i) => (
          <line
            key={i}
            x1={NECK_LEFT + i * FRET_SPACING}
            y1={STRING_TOP - 12}
            x2={NECK_LEFT + i * FRET_SPACING}
            y2={STRING_TOP + (STRING_COUNT - 1) * STRING_SPACING + 12}
            stroke={i === 0 ? '#c8a84b' : '#3d2e1c'}
            strokeWidth={i === 0 ? 3 : 1}
          />
        ))}

        {/* Strings */}
        {Array.from({ length: STRING_COUNT }).map((_, i) => {
          const s = i + 1;
          return (
            <line
              key={s}
              x1={12}
              y1={stringY(s)}
              x2={NECK_RIGHT}
              y2={stringY(s)}
              stroke="#8a7a6a"
              strokeWidth={stringWidth(s)}
            />
          );
        })}

        {/* Note circles — all string/fret intersections */}
        {Array.from({ length: STRING_COUNT }).map((_, si) => {
          const s = si + 1;
          return Array.from({ length: FRET_COUNT + 1 }).map((_, fret) => {
            const key = `${s}-${fret}`;
            const active = activeSet.has(key);
            return (
              <circle
                key={key}
                cx={fretCx(fret)}
                cy={stringY(s)}
                r={9}
                fill={active ? '#6366f1' : 'transparent'}
                stroke={active ? '#a5b4fc' : 'transparent'}
                strokeWidth={1.5}
                style={{ transition: 'fill 40ms, stroke 40ms' }}
              />
            );
          });
        })}

        {/* Fret number labels */}
        {[...SINGLE_DOT_FRETS, 12].map((fret) => (
          <text
            key={fret}
            x={dotCx(fret)}
            y={SVG_HEIGHT - 4}
            textAnchor="middle"
            fill="#4b5563"
            fontSize={11}
            fontFamily="system-ui, sans-serif"
          >
            {fret}
          </text>
        ))}
      </svg>
    </div>
  );
}
