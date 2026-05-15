import { useState, useEffect, useRef } from 'react';
import { buildApiUrl } from '../config/api';

const PING_URL = buildApiUrl('ping/');
const POLL_MS  = 3000;  // intento cada 3 s
const TICK_MS  = 400;   // actualiza la barra cada 400 ms
const MAX_AUTO = 88;    // tope antes de recibir respuesta

export default function StartupLoader({ onReady }) {
  const [progress, setProgress] = useState(0);
  const [fase, setFase]         = useState('Iniciando servidor…');
  const [visible, setVisible]   = useState(true);

  const progressRef = useRef(0);
  const readyRef    = useRef(false);

  /* ── Simula progreso hasta MAX_AUTO ─────────────── */
  useEffect(() => {
    const tick = setInterval(() => {
      if (readyRef.current) return;
      progressRef.current = progressRef.current + (MAX_AUTO - progressRef.current) * 0.045;
      const p = Math.min(Math.round(progressRef.current), MAX_AUTO);
      setProgress(p);

      if (p < 30)       setFase('Iniciando servidor…');
      else if (p < 60)  setFase('Cargando servicios…');
      else              setFase('Casi listo…');
    }, TICK_MS);

    return () => clearInterval(tick);
  }, []);

  /* ── Sondea /api/ping/ ──────────────────────────── */
  useEffect(() => {
    let alive = true;

    const ping = async () => {
      try {
        await fetch(PING_URL, { signal: AbortSignal.timeout(5000) });
        if (!alive) return;
        readyRef.current = true;
        setFase('¡Conectado!');

        // Anima de donde está hasta 100 %
        let p = progressRef.current;
        const fill = setInterval(() => {
          p = Math.min(p + 4, 100);
          progressRef.current = p;
          setProgress(Math.round(p));
          if (p >= 100) {
            clearInterval(fill);
            setTimeout(() => {
              setVisible(false);
              setTimeout(onReady, 350); // espera el fade-out
            }, 450);
          }
        }, 30);
      } catch {
        // servidor todavía no responde, seguir esperando
      }
    };

    ping();
    const id = setInterval(ping, POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, [onReady]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0f172a',
      transition: 'opacity 0.35s ease',
      opacity: visible ? 1 : 0,
    }}>

      {/* Logo / marca */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, marginBottom: 16, margin: '0 auto 16px',
          boxShadow: '0 0 40px rgba(99,102,241,0.4)',
        }}>🐴</div>
        <p style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>
          Donacianocore
        </p>
        <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
          Sistema de gestión
        </p>
      </div>

      {/* Barra de progreso */}
      <div style={{ width: 280 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 10,
        }}>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>{fase}</span>
          <span style={{
            color: '#6366f1', fontSize: 14, fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}>{progress}%</span>
        </div>

        {/* Track */}
        <div style={{
          height: 6, borderRadius: 99,
          background: '#1e293b', overflow: 'hidden',
        }}>
          {/* Fill */}
          <div style={{
            height: '100%', borderRadius: 99,
            background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
            width: `${progress}%`,
            transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: progress > 10 ? '0 0 8px rgba(99,102,241,0.6)' : 'none',
          }} />
        </div>

        <p style={{ color: '#334155', fontSize: 11, marginTop: 14, textAlign: 'center' }}>
          El servidor en Render tarda ~30 s en activarse tras inactividad
        </p>
      </div>

    </div>
  );
}
