import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const C = {
  bg: '#0D0D0D',
  surface: '#1A1A1A',
  border: '#2E2E2E',
  accent: '#E8C547',
  text: '#F0F0F0',
  muted: '#6B6B6B',
  error: '#f87171',
  errorBg: 'rgba(239,68,68,0.08)',
  errorBorder: 'rgba(239,68,68,0.3)',
} as const;

const DISPLAY = "'Space Grotesk', system-ui, sans-serif";
const BODY = 'system-ui, sans-serif';

type Tab = 'signin' | 'signup';

function TabWatermark() {
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

function Spinner() {
  return (
    <>
      <style>{`@keyframes bard-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 16,
        height: 16,
        border: `2px solid ${C.border}`,
        borderTopColor: C.bg,
        borderRadius: '50%',
        animation: 'bard-spin 0.65s linear infinite',
        flexShrink: 0,
      }} />
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: C.bg,
  border: `1px solid ${C.border}`,
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '14px',
  color: C.text,
  fontFamily: BODY,
  outline: 'none',
  caretColor: C.accent,
  boxSizing: 'border-box',
  transition: 'border-color 150ms',
};

export function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function resetForm() {
    setError(null);
    setSuccessMsg(null);
  }

  function switchTab(t: Tab) {
    setTab(t);
    resetForm();
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (tab === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        navigate('/');
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg('Check your email to confirm your account, then sign in.');
        setPassword('');
      }
    }

    setLoading(false);
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  const tabBtn = (t: Tab, label: string) => (
    <button
      type="button"
      onClick={() => switchTab(t)}
      style={{
        flex: 1,
        padding: '8px 0',
        background: 'none',
        border: 'none',
        borderBottom: `2px solid ${tab === t ? C.accent : 'transparent'}`,
        color: tab === t ? C.text : C.muted,
        fontFamily: DISPLAY,
        fontWeight: 600,
        fontSize: '13px',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'color 150ms, border-color 150ms',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'stretch' }}>

      {/* Left branding panel */}
      <div
        className="hidden md:flex"
        style={{
          width: '40%',
          position: 'relative',
          borderRight: `1px solid ${C.border}`,
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '64px 48px',
          flexShrink: 0,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, opacity: 0.045 }}>
          <TabWatermark />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 'clamp(40px, 4vw, 64px)',
            letterSpacing: '0.15em',
            color: C.text,
            lineHeight: 1,
            margin: 0,
          }}>
            BARD
          </h1>
          <div style={{ width: '48px', height: '2px', background: C.accent, margin: '20px 0' }} />
          <p style={{ fontFamily: BODY, fontSize: '16px', lineHeight: 1.65, color: C.muted, margin: 0 }}>
            Visualize any Guitar Pro file on a real-time fretboard. Built for guitarists, by guitarists.
          </p>
        </div>
      </div>

      {/* Right auth panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Mobile logo */}
          <div className="block md:hidden" style={{ marginBottom: '32px', textAlign: 'center' }}>
            <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '32px', letterSpacing: '0.15em', color: C.text }}>
              BARD
            </span>
          </div>

          {/* Card */}
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
              {tabBtn('signin', 'Sign In')}
              {tabBtn('signup', 'Sign Up')}
            </div>

            <div style={{ padding: '28px 28px 32px' }}>

              {/* Google OAuth */}
              <button
                type="button"
                onClick={handleGoogle}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: '8px',
                  color: C.text,
                  fontFamily: DISPLAY,
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'border-color 150ms, background 150ms',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.muted; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                <div style={{ flex: 1, height: '1px', background: C.border }} />
                <span style={{ fontSize: '12px', color: C.muted, fontFamily: BODY }}>or</span>
                <div style={{ flex: 1, height: '1px', background: C.border }} />
              </div>

              {/* Email / password form */}
              <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontFamily: DISPLAY, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = C.accent; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontFamily: DISPLAY, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = C.accent; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }}
                  />
                </div>

                {error && (
                  <div style={{ padding: '10px 14px', background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: C.error, fontFamily: BODY }}>{error}</p>
                  </div>
                )}

                {successMsg && (
                  <div style={{ padding: '10px 14px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6ee7b7', fontFamily: BODY }}>{successMsg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px 16px',
                    background: loading ? C.border : C.accent,
                    border: 'none',
                    borderRadius: '8px',
                    color: loading ? C.muted : C.bg,
                    fontFamily: DISPLAY,
                    fontWeight: 700,
                    fontSize: '14px',
                    letterSpacing: '0.04em',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background 150ms',
                    marginTop: '4px',
                  }}
                >
                  {loading && <Spinner />}
                  {tab === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
