import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SongPage } from './pages/SongPage';
import { AuthPage } from './pages/AuthPage';
import { AuthCallback } from './pages/AuthCallback';
import { ProtectedRoute } from './components/ProtectedRoute';
import { supabase } from './lib/supabase';
import { useStore } from './store';

const MISSING_ENV = !supabase;

export function App() {
  const setUser = useStore((s) => s.setUser);
  const setAuthLoading = useStore((s) => s.setAuthLoading);

  useEffect(() => {
    if (MISSING_ENV) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setAuthLoading]);

  if (MISSING_ENV) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ maxWidth: '480px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '28px 32px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', fontFamily: "'Space Grotesk', system-ui", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f87171' }}>
            Missing configuration
          </p>
          <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#fca5a5', fontFamily: 'system-ui', lineHeight: 1.6 }}>
            <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> are not set in <code>frontend/.env</code>.
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: '#6B6B6B', fontFamily: 'system-ui', lineHeight: 1.6 }}>
            Find these values in your Supabase dashboard under Settings → API, then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/song" element={<ProtectedRoute><SongPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
