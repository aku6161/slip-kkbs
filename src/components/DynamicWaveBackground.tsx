import React, { useEffect, useRef } from 'react';

// SLIP color palette – deep navy → electric cyan/blue binary rain
const COLORS = {
  bg: '#020d1a',
  bgMid: '#030f22',
  bgFar: '#04152e',
  primary: '#00c8ff',        // Electric Cyan
  secondary: '#0066ff',      // Royal Blue
  accent: '#00ffcc',         // Teal Glow
  faded: '#003a5c',
  dim: '#001824',
  white: '#e0f8ff',
};

interface Column {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  length: number;          // number of chars in this stream
  opacity: number;
  glowPulse: number;
  glowPhase: number;
  colorVariant: number;    // 0=cyan, 1=blue, 2=teal
  // Wave modifier
  waveAmplitude: number;
  waveFrequency: number;
  wavePhase: number;
}

// Binary + tech character set
const CHAR_SETS = [
  '01',                   // pure binary
  '01',                   // more binary weight
  '0123456789',           // digits
  'ABCDEF0123456789',     // hex
  '{}[]<>/\\|=+-*&%$#@!', // symbols
];

function randomChar(): string {
  const set = CHAR_SETS[Math.floor(Math.random() * CHAR_SETS.length)];
  return set[Math.floor(Math.random() * set.length)];
}

const COLUMN_COLORS = [
  // [head, mid, tail]
  ['rgba(0, 255, 255, 1)', 'rgba(0, 200, 255, 0.85)', 'rgba(0, 100, 180, 0)'],   // Cyan
  ['rgba(100, 200, 255, 1)', 'rgba(0, 100, 255, 0.8)', 'rgba(0, 40, 120, 0)'],   // Blue
  ['rgba(0, 255, 200, 1)', 'rgba(0, 180, 160, 0.8)', 'rgba(0, 80, 80, 0)'],      // Teal
];

export const DynamicWaveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const FONT_SIZE = 14;
    const MIN_STREAM_LENGTH = 8;
    const MAX_STREAM_LENGTH = 32;
    let columns: Column[] = [];
    let time = 0;

    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      initColumns();
    };

    const initColumns = () => {
      const cols = Math.floor(width / FONT_SIZE);
      columns = [];

      for (let i = 0; i < cols; i++) {
        const x = i * FONT_SIZE + FONT_SIZE / 2;
        const streamLength = MIN_STREAM_LENGTH + Math.floor(Math.random() * (MAX_STREAM_LENGTH - MIN_STREAM_LENGTH));
        const chars = Array.from({ length: streamLength + 5 }, () => randomChar());

        columns.push({
          x,
          y: -(Math.random() * height * 1.5),  // stagger starts above viewport
          speed: 1.5 + Math.random() * 3.5,
          chars,
          length: streamLength,
          opacity: 0.6 + Math.random() * 0.4,
          glowPulse: 0,
          glowPhase: Math.random() * Math.PI * 2,
          colorVariant: Math.floor(Math.random() * 3),
          waveAmplitude: 12 + Math.random() * 20,
          waveFrequency: 0.008 + Math.random() * 0.018,
          wavePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      time += 1;

      ctx.save();
      ctx.scale(dpr, dpr);

      // --- Background ---
      // Trailing fade (creates persistence / motion blur effect)
      ctx.fillStyle = 'rgba(2, 13, 26, 0.18)';
      ctx.fillRect(0, 0, width, height);

      // Deep background every 60 frames to prevent ghosting buildup
      if (time % 60 === 0) {
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, width, height);
      }

      // Ambient blue-teal radial glow in the center
      const ambientGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        50,
        width * 0.5,
        height * 0.4,
        Math.max(width, height) * 0.75
      );
      ambientGlow.addColorStop(0, 'rgba(0, 100, 200, 0.08)');
      ambientGlow.addColorStop(0.5, 'rgba(0, 60, 140, 0.04)');
      ambientGlow.addColorStop(1, 'rgba(2, 13, 26, 0)');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${FONT_SIZE}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // --- Render each column stream ---
      for (let ci = 0; ci < columns.length; ci++) {
        const col = columns[ci];
        col.y += col.speed;
        col.glowPhase += 0.04;
        col.glowPulse = 0.7 + Math.sin(col.glowPhase) * 0.3;

        // Occasionally mutate chars for digital glitch feel
        if (Math.random() < 0.025) {
          const ri = Math.floor(Math.random() * col.chars.length);
          col.chars[ri] = randomChar();
        }

        // Sine-wave X displacement for wave motion
        const waveX = col.x + Math.sin(time * 0.025 + col.wavePhase + col.y * col.waveFrequency) * col.waveAmplitude;

        const colors = COLUMN_COLORS[col.colorVariant];

        // Draw each character in the stream
        for (let ci2 = 0; ci2 < col.length; ci2++) {
          const charY = col.y - ci2 * FONT_SIZE;

          if (charY < -FONT_SIZE || charY > height + FONT_SIZE) continue;

          // t=0 is head, t=1 is tail
          const t = ci2 / (col.length - 1);

          // --- Character color & brightness ---
          if (ci2 === 0) {
            // HEAD: Bright white/cyan with heavy glow
            ctx.fillStyle = COLORS.white;
            ctx.shadowColor = colors[0];
            ctx.shadowBlur = 18 * col.glowPulse;
          } else if (t < 0.25) {
            // NEAR HEAD: Bright cyan
            const fade = 1 - t / 0.25;
            ctx.fillStyle = colors[0];
            ctx.shadowColor = colors[0];
            ctx.shadowBlur = 12 * fade * col.glowPulse;
          } else if (t < 0.65) {
            // MID BODY: Medium blue-cyan fading
            const fade = 1 - (t - 0.25) / 0.4;
            ctx.fillStyle = `rgba(0, 160, 255, ${0.4 + fade * 0.45})`;
            ctx.shadowColor = colors[1];
            ctx.shadowBlur = 5 * fade;
          } else {
            // TAIL: Fading dark blue
            const fade = 1 - (t - 0.65) / 0.35;
            ctx.fillStyle = `rgba(0, 70, 180, ${0.05 + fade * 0.25})`;
            ctx.shadowBlur = 0;
          }

          ctx.globalAlpha = col.opacity;
          ctx.fillText(col.chars[ci2 % col.chars.length], waveX, charY);
          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = 1;

        // Reset column when stream scrolls fully past bottom
        if (col.y - col.length * FONT_SIZE > height) {
          col.y = -(Math.random() * height * 0.4);
          col.speed = 1.5 + Math.random() * 3.5;
          col.length = MIN_STREAM_LENGTH + Math.floor(Math.random() * (MAX_STREAM_LENGTH - MIN_STREAM_LENGTH));
          col.chars = Array.from({ length: col.length + 5 }, () => randomChar());
          col.colorVariant = Math.floor(Math.random() * 3);
          col.waveAmplitude = 12 + Math.random() * 20;
          col.waveFrequency = 0.008 + Math.random() * 0.018;
          col.wavePhase = Math.random() * Math.PI * 2;
          col.glowPhase = Math.random() * Math.PI * 2;
          col.opacity = 0.6 + Math.random() * 0.4;
        }
      }

      // --- Scanline overlay for cinematic CRT depth ---
      for (let sy = 0; sy < height; sy += 4) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.fillRect(0, sy, width, 1);
      }

      // --- Subtle top & bottom gradient vignette ---
      const topVig = ctx.createLinearGradient(0, 0, 0, height * 0.18);
      topVig.addColorStop(0, 'rgba(2, 13, 26, 0.7)');
      topVig.addColorStop(1, 'rgba(2, 13, 26, 0)');
      ctx.fillStyle = topVig;
      ctx.fillRect(0, 0, width, height * 0.18);

      const botVig = ctx.createLinearGradient(0, height * 0.82, 0, height);
      botVig.addColorStop(0, 'rgba(2, 13, 26, 0)');
      botVig.addColorStop(1, 'rgba(2, 13, 26, 0.75)');
      ctx.fillStyle = botVig;
      ctx.fillRect(0, height * 0.82, width, height * 0.18);

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ display: 'block' }}
    />
  );
};
