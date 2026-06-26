import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.exchangeCodeForSession(window.location.href).then(() => {
      navigate('/');
    });
  }, [navigate]);

  const C = { bg: '#0D0D0D', text: '#F0F0F0', muted: '#6B6B6B', accent: '#E8C547', border: '#2E2E2E' };

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <>
        <style>{`@keyframes bard-spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: 32,
          height: 32,
          border: `2px solid ${C.border}`,
          borderTopColor: C.accent,
          borderRadius: '50%',
          animation: 'bard-spin 0.65s linear infinite',
        }} />
      </>
      <p style={{ color: C.muted, fontFamily: 'system-ui, sans-serif', fontSize: '14px', margin: 0 }}>
        Completing sign in…
      </p>
    </div>
  );
}
