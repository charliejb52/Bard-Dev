import { useRef } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#0D0D0D',
  surface: '#1A1A1A',
  border: '#2E2E2E',
  accent: '#E8C547',
  text: '#F0F0F0',
  muted: '#6B6B6B',
} as const;

const DISPLAY = "'Space Grotesk', system-ui, sans-serif";
const BODY = "system-ui, sans-serif";

// ── Tab staff watermark ──────────────────────────────────────────────────────
function TabWatermark() {
  // 6 horizontal lines spread across the column height, matching real tab paper
  const ys = ['16%', '31%', '46%', '61%', '76%', '91%'];
  return (
    <svg
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      preserveAspectRatio="none"
    >
      {ys.map((y, i) => (
        <line key={i} x1="0" y1={y} x2="100%" y2={y} stroke={C.text} strokeWidth="1" />
      ))}
    </svg>
  );
}

// ── Empty table placeholder ───────────────────────────────────────────────────
const COLUMNS = ['Title', 'Artist', 'Duration', 'Tempo'];

function SongTable() {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: BODY }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${C.border}` }}>
          {COLUMNS.map((col) => (
            <th
              key={col}
              style={{
                padding: '10px 16px',
                textAlign: 'left',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: C.muted,
                fontFamily: DISPLAY,
                textTransform: 'uppercase',
              }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td
            colSpan={4}
            style={{
              padding: '48px 16px',
              textAlign: 'center',
              color: C.muted,
              fontSize: '14px',
            }}
          >
            No songs yet. Upload one to get started.
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// ── Upload section ────────────────────────────────────────────────────────────
function UploadSection() {
  const { upload, status } = useFileUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  const loading = status.kind === 'loading';
  const label = loading ? status.label : 'Upload Guitar Pro file';

  return (
    <div style={{ borderTop: `1px solid ${C.border}`, padding: '20px 20px 24px' }}>
      <p style={{ fontSize: '13px', color: C.muted, marginBottom: '12px', fontFamily: BODY }}>
        Don&rsquo;t see your song?
      </p>

      <button
        disabled={loading}
        onClick={() => !loading && inputRef.current?.click()}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '9px 18px',
          border: `1px solid ${loading ? C.border : C.accent}`,
          borderRadius: '8px',
          background: 'transparent',
          color: loading ? C.muted : C.accent,
          fontSize: '14px',
          fontWeight: 600,
          fontFamily: DISPLAY,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 150ms, color 150ms',
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.background = C.accent;
            e.currentTarget.style.color = C.bg;
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = C.accent;
          }
        }}
      >
        {!loading && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        )}
        {label}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".gp,.gp3,.gp4,.gp5,.gpx"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = '';
        }}
      />

      {status.kind === 'error' && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px',
          }}
        >
          <p style={{ fontSize: '11px', color: '#f87171', fontFamily: DISPLAY, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
            {status.stage}
          </p>
          <p style={{ fontSize: '13px', color: '#fca5a5', fontFamily: BODY }}>{status.message}</p>
          {status.hint && (
            <p style={{ fontSize: '12px', color: C.muted, fontFamily: BODY, marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(239,68,68,0.2)' }}>
              {status.hint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Home page ─────────────────────────────────────────────────────────────────
export function HomePage() {
  return (
    <div
      style={{ minHeight: '100vh', background: C.bg, color: C.text, display: 'flex', flexDirection: 'column' }}
    >
      <div
        className="flex flex-col md:flex-row flex-1"
        style={{ minHeight: '100vh' }}
      >
        {/* ── Left: identity ──────────────────────────────────────────────── */}
        <div
          className="relative w-full md:w-2/5 flex items-center justify-center md:justify-start border-b md:border-b-0 md:border-r"
          style={{
            padding: '64px 48px',
            borderColor: C.border,
          }}
        >
          {/* Tab staff watermark — very faint */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.045 }}>
            <TabWatermark />
          </div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '380px' }}>
            {/* App name */}
            <h1
              style={{
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 'clamp(40px, 5vw, 64px)',
                letterSpacing: '0.15em',
                color: C.text,
                lineHeight: 1,
                margin: 0,
              }}
            >
              BARD
            </h1>

            {/* Gold accent rule */}
            <div
              style={{
                width: '48px',
                height: '2px',
                background: C.accent,
                margin: '20px 0',
              }}
            />

            {/* Tagline */}
            <p
              style={{
                fontFamily: BODY,
                fontSize: '16px',
                lineHeight: 1.65,
                color: C.muted,
                margin: 0,
              }}
            >
              Visualize any Guitar Pro file on a real-time fretboard. Built for guitarists, by guitarists.
            </p>
          </div>
        </div>

        {/* ── Right: library panel ─────────────────────────────────────────── */}
        <div
          className="flex flex-col flex-1 p-6 md:p-10"
          style={{ minWidth: 0 }}
        >
          <div
            className="flex flex-col flex-1"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            {/* Panel header */}
            <div
              className="flex items-center justify-between"
              style={{
                padding: '16px 20px',
                borderBottom: `1px solid ${C.border}`,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 600,
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: C.muted,
                }}
              >
                Library
              </span>

              <input
                type="text"
                placeholder="Search songs…"
                style={{
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  color: C.text,
                  fontFamily: BODY,
                  outline: 'none',
                  width: '180px',
                  caretColor: C.accent,
                  transition: 'border-color 150ms',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = C.accent)}
                onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
              />
            </div>

            {/* Song table */}
            <div className="flex-1 overflow-auto">
              <SongTable />
            </div>

            {/* Upload section */}
            <UploadSection />
          </div>
        </div>
      </div>
    </div>
  );
}
