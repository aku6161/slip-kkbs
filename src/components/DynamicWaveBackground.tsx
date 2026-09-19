import React, { useEffect, useRef } from 'react';

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  bgDeep:  '#06071a',
  bgMid:   '#080c28',
  bgShift: '#0a1035',
  indigo:  '55, 60, 180',
  indigoD: '30, 36, 120',
  indigoBr:'100, 115, 255',
  blue:    '60, 120, 255',
  blueS:   '80, 160, 255',
  red:     '220, 40, 60',
  redA:    '255, 80, 90',
  white:   '220, 230, 255',
  neutral: '140, 155, 200',
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const randInt = (a: number, b: number) => Math.floor(rand(a, b + 1));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ─── Types ───────────────────────────────────────────────────────────────────
interface Particle {
  wx: number;
  wy: number;
  speed: number;
  size: number;
  opacity: number;
  opacityTarget: number;
  blink: number;
  blinkSpeed: number;
  color: string;
  trail: { x: number; y: number }[];
  maxTrail: number;
  isRed: boolean;
  vx: number;   // ← velocity for mouse repulsion
  vy: number;
}

interface BinaryGlyph {
  x: number;
  y: number;
  char: string;
  opacity: number;
  speed: number;
  size: number;
}

interface GeomShape {
  type: 'triangle' | 'rect' | 'line';
  cx: number;
  cy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  opacityBase: number;
  breathPhase: number;
  breathSpeed: number;
  isRed: boolean;
  driftX: number;
  driftY: number;
  driftPhase: number;
  driftSpeed: number;
}

interface FlowLine {
  points: { x: number; y: number }[];
  opacity: number;
  speed: number;
  progress: number;
  color: string;
  width: number;
}

// ─── Ripple (click burst) ────────────────────────────────────────────────────
interface Ripple {
  x: number;
  y: number;
  r: number;
  maxR: number;
  alpha: number;
  speed: number;
  color: string;
  rings: number;
}

export const DynamicWaveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let raf: number;
    let W = 0, H = 0, dpr = 1;
    let t = 0;

    // ─── Mouse state ──────────────────────────────────────────────────────────
    let rawMX = 0.5, rawMY = 0.5;     // normalised 0-1 raw
    let mX = 0.5, mY = 0.5;           // smoothed normalised
    let mScreenX = 0, mScreenY = 0;   // smoothed pixel
    let isMouseInside = false;

    // ─── Entities ─────────────────────────────────────────────────────────────
    let particles: Particle[] = [];
    let glyphs: BinaryGlyph[] = [];
    let shapes: GeomShape[] = [];
    let flowLines: FlowLine[] = [];
    let ripples: Ripple[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      init();
    };

    // ─── Mouse handlers ────────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      rawMX = e.clientX / W;
      rawMY = e.clientY / H;
      isMouseInside = true;
    };
    const onMouseLeave = () => { isMouseInside = false; };
    const onTouchMove = (e: TouchEvent) => {
      rawMX = e.touches[0].clientX / W;
      rawMY = e.touches[0].clientY / H;
      isMouseInside = true;
    };

    // ─── Click ripple ──────────────────────────────────────────────────────────
    const onClick = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      // Main large ripple
      ripples.push({
        x, y, r: 0,
        maxR: rand(120, 220),
        alpha: 0.85,
        speed: rand(4, 7),
        color: C.blueS,
        rings: 3,
      });
      // Red accent small burst
      ripples.push({
        x: x + rand(-30, 30),
        y: y + rand(-20, 20),
        r: 0,
        maxR: rand(50, 90),
        alpha: 0.6,
        speed: rand(3, 5),
        color: C.red,
        rings: 1,
      });
    };

    const onTouch = (e: TouchEvent) => {
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      ripples.push({ x, y, r: 0, maxR: rand(100, 180), alpha: 0.75, speed: 5, color: C.blueS, rings: 2 });
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('click', onClick);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });

    // ─── Wave function ─────────────────────────────────────────────────────────
    // Mouse Y pushes/pulls the wave at cursor X position
    const waveY = (nx: number, time: number): number => {
      const base = H * 0.52;
      const s1 = Math.sin(nx * Math.PI * 2.8 - time * 0.55) * H * 0.085;
      const s2 = Math.sin(nx * Math.PI * 1.4 + time * 0.32) * H * 0.055;
      const s3 = Math.sin(nx * Math.PI * 5.2 - time * 0.9) * H * 0.022;

      // Mouse wave distortion: gaussian bump centred at cursor X
      const mouseInfluence = isMouseInside
        ? Math.exp(-((nx - mX) ** 2) / 0.03) * (mY - 0.5) * H * 0.28
        : 0;

      return base + s1 + s2 + s3 + mouseInfluence;
    };

    // ─── Init ─────────────────────────────────────────────────────────────────
    const init = () => {
      const pCount = Math.min(180, Math.max(90, Math.floor(W / 12)));
      particles = Array.from({ length: pCount }, (): Particle => {
        const isRed = Math.random() < 0.07;
        const colorBase = isRed ? C.redA : Math.random() < 0.5 ? C.blueS : C.indigoBr;
        return {
          wx: Math.random(),
          wy: rand(-0.35, 0.35) * H,
          speed: rand(0.0008, 0.003),
          size: rand(isRed ? 2.5 : 1.5, isRed ? 4.5 : 3.2),
          opacity: rand(0.35, 0.9),
          opacityTarget: rand(0.3, 1),
          blink: rand(0.3, 1),
          blinkSpeed: rand(0.012, 0.04),
          color: colorBase,
          trail: [],
          maxTrail: randInt(4, 18),
          isRed,
          vx: 0,
          vy: 0,
        };
      });

      const gCount = Math.min(90, Math.floor(W / 20));
      glyphs = Array.from({ length: gCount }, (): BinaryGlyph => ({
        x: rand(0, W),
        y: rand(0, H),
        char: Math.random() < 0.6 ? (Math.random() < 0.5 ? '0' : '1') : ['A','F','E','C','7','9'][randInt(0,5)],
        opacity: rand(0.04, 0.13),
        speed: rand(0.2, 0.8),
        size: rand(9, 15),
      }));

      shapes = [];
      for (let i = 0; i < 5; i++) {
        shapes.push({
          type: Math.random() < 0.6 ? 'triangle' : 'rect',
          cx: rand(W * 0.05, W * 0.95),
          cy: rand(H * 0.05, H * 0.9),
          size: rand(W * 0.08, W * 0.22),
          rotation: rand(0, Math.PI * 2),
          rotSpeed: rand(-0.0006, 0.0006),
          opacityBase: rand(0.04, 0.10),
          breathPhase: rand(0, Math.PI * 2),
          breathSpeed: rand(0.008, 0.018),
          isRed: false,
          driftX: rand(-1, 1),
          driftY: rand(-0.5, 0.5),
          driftPhase: rand(0, Math.PI * 2),
          driftSpeed: rand(0.005, 0.015),
        });
      }
      for (let i = 0; i < 3; i++) {
        shapes.push({
          type: Math.random() < 0.5 ? 'triangle' : 'line',
          cx: rand(W * 0.1, W * 0.9),
          cy: rand(H * 0.1, H * 0.9),
          size: rand(W * 0.025, W * 0.065),
          rotation: rand(0, Math.PI * 2),
          rotSpeed: rand(-0.001, 0.001),
          opacityBase: rand(0.08, 0.22),
          breathPhase: rand(0, Math.PI * 2),
          breathSpeed: rand(0.01, 0.02),
          isRed: true,
          driftX: rand(-0.8, 0.8),
          driftY: rand(-0.5, 0.5),
          driftPhase: rand(0, Math.PI * 2),
          driftSpeed: rand(0.007, 0.018),
        });
      }

      flowLines = Array.from({ length: 14 }, (): FlowLine => spawnFlowLine());
    };

    const spawnFlowLine = (): FlowLine => {
      const steps = 60;
      const startX = rand(-0.2, 0) * W;
      const offsetY = rand(-0.38, 0.38) * H;
      const pts = Array.from({ length: steps }, (_, i) => {
        const nx = (startX + i * W / (steps - 1)) / W;
        return { x: startX + i * W / (steps - 1), y: waveY(nx, 0) + offsetY };
      });
      const isRed = Math.random() < 0.06;
      return {
        points: pts,
        opacity: rand(0.06, 0.28),
        speed: rand(0.003, 0.01),
        progress: rand(0, 1),
        color: isRed ? C.red : (Math.random() < 0.5 ? C.blueS : C.indigoBr),
        width: rand(isRed ? 0.8 : 0.6, isRed ? 1.8 : 1.4),
      };
    };

    // ─── Draw helpers ─────────────────────────────────────────────────────────
    const drawTriangle = (cx: number, cy: number, size: number, rot: number) => {
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = rot + (i * Math.PI * 2) / 3;
        i === 0 ? ctx.moveTo(cx + Math.cos(a) * size, cy + Math.sin(a) * size)
                : ctx.lineTo(cx + Math.cos(a) * size, cy + Math.sin(a) * size);
      }
      ctx.closePath();
    };

    const drawRect = (cx: number, cy: number, size: number, rot: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      const s = size * 0.7;
      ctx.beginPath();
      ctx.rect(-s, -s * 0.6, s * 2, s * 1.2);
      ctx.restore();
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    const render = () => {
      t += 0.016;

      // ── Smooth mouse tracking ─────────────────────────────────────────────
      const targetMX = isMouseInside ? rawMX : 0.5;
      const targetMY = isMouseInside ? rawMY : 0.5;
      mX = lerp(mX, targetMX, 0.055);
      mY = lerp(mY, targetMY, 0.055);
      mScreenX = mX * W;
      mScreenY = mY * H;

      // Parallax offset (shapes react to mouse position)
      const parallaxX = (mX - 0.5) * 2;  // -1 to +1
      const parallaxY = (mY - 0.5) * 2;

      ctx.save();
      ctx.scale(dpr, dpr);

      // ── Background ────────────────────────────────────────────────────────
      const bg = ctx.createLinearGradient(0, 0, W * 0.5, H);
      bg.addColorStop(0, C.bgDeep);
      bg.addColorStop(0.45, C.bgMid);
      bg.addColorStop(1, C.bgShift);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Ambient nebula top-right (shifts with mouse parallax)
      const neb1 = ctx.createRadialGradient(
        W * 0.82 + parallaxX * -30, H * 0.12 + parallaxY * -20, 10,
        W * 0.82, H * 0.12, W * 0.55
      );
      neb1.addColorStop(0, `rgba(${C.indigo}, 0.18)`);
      neb1.addColorStop(0.6, `rgba(${C.indigoD}, 0.06)`);
      neb1.addColorStop(1, 'rgba(6,7,26,0)');
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, W, H);

      // Ambient nebula bottom-left (opposite parallax)
      const neb2 = ctx.createRadialGradient(
        W * 0.15 + parallaxX * 25, H * 0.88 + parallaxY * 18, 10,
        W * 0.15, H * 0.88, W * 0.5
      );
      neb2.addColorStop(0, `rgba(${C.blue}, 0.12)`);
      neb2.addColorStop(1, 'rgba(6,7,26,0)');
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, W, H);

      // ── MOUSE CURSOR GLOW (soft radial light following cursor) ────────────
      if (isMouseInside) {
        const cursorGlow = ctx.createRadialGradient(
          mScreenX, mScreenY, 0,
          mScreenX, mScreenY, 180
        );
        cursorGlow.addColorStop(0, `rgba(${C.blueS}, 0.14)`);
        cursorGlow.addColorStop(0.4, `rgba(${C.indigo}, 0.06)`);
        cursorGlow.addColorStop(1, 'rgba(6,7,26,0)');
        ctx.fillStyle = cursorGlow;
        ctx.fillRect(0, 0, W, H);
      }

      // ── 1. Geometric shapes (parallax depth layers) ───────────────────────
      shapes.forEach((s, si) => {
        s.rotation += s.rotSpeed;
        s.breathPhase += s.breathSpeed;
        s.driftPhase += s.driftSpeed;

        const breath = 0.8 + Math.sin(s.breathPhase) * 0.2;
        const alpha = s.opacityBase * breath;

        // Parallax: deeper shapes (larger) move less, small shapes more
        const parallaxFactor = s.isRed ? 28 : 18 - si * 2;
        const driftX = s.cx + Math.sin(s.driftPhase) * 25 * s.driftX
                     + parallaxX * parallaxFactor;
        const driftY = s.cy + Math.cos(s.driftPhase * 0.7) * 18 * s.driftY
                     + parallaxY * parallaxFactor * 0.6;

        const col = s.isRed ? C.red : C.indigo;

        // Highlight shape nearest to cursor
        const distToCursor = Math.hypot(driftX - mScreenX, driftY - mScreenY);
        const nearCursor = isMouseInside ? Math.max(0, 1 - distToCursor / (W * 0.25)) : 0;
        const finalAlpha = alpha * (1 + nearCursor * 1.6);

        ctx.save();
        ctx.globalAlpha = Math.min(0.55, finalAlpha);

        if (s.type === 'triangle') {
          drawTriangle(driftX, driftY, s.size * (1 + nearCursor * 0.08), s.rotation);
          ctx.strokeStyle = `rgba(${col}, 0.9)`;
          ctx.lineWidth = s.isRed ? 1.5 + nearCursor * 2 : 1 + nearCursor;
          ctx.stroke();
          ctx.fillStyle = `rgba(${col}, ${0.06 + nearCursor * 0.1})`;
          ctx.fill();
        } else if (s.type === 'rect') {
          drawRect(driftX, driftY, s.size, s.rotation);
          ctx.strokeStyle = `rgba(${col}, 0.8)`;
          ctx.lineWidth = 1 + nearCursor * 0.8;
          ctx.stroke();
        } else {
          const len = s.size * 2;
          ctx.beginPath();
          ctx.moveTo(driftX - Math.cos(s.rotation) * len, driftY - Math.sin(s.rotation) * len);
          ctx.lineTo(driftX + Math.cos(s.rotation) * len, driftY + Math.sin(s.rotation) * len);
          ctx.strokeStyle = `rgba(${col}, 0.95)`;
          ctx.lineWidth = s.isRed ? 2 + nearCursor * 2 : 1;
          ctx.stroke();
        }
        ctx.restore();
      });

      // ── 2. Wave body ──────────────────────────────────────────────────────
      const waveSteps = 200;
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i <= waveSteps; i++) {
        const nx = i / waveSteps;
        const py = waveY(nx, t);
        i === 0 ? ctx.moveTo(0, py) : ctx.lineTo(nx * W, py);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      const wfill = ctx.createLinearGradient(0, H * 0.3, 0, H);
      wfill.addColorStop(0, `rgba(${C.indigo}, 0.09)`);
      wfill.addColorStop(0.5, `rgba(${C.indigoD}, 0.05)`);
      wfill.addColorStop(1, 'rgba(6,7,26,0)');
      ctx.fillStyle = wfill;
      ctx.fill();
      ctx.restore();

      // Wave crest line
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i <= waveSteps; i++) {
        const nx = i / waveSteps;
        const py = waveY(nx, t);
        i === 0 ? ctx.moveTo(0, py) : ctx.lineTo(nx * W, py);
      }
      const wlineGrad = ctx.createLinearGradient(0, 0, W, 0);
      wlineGrad.addColorStop(0, `rgba(${C.blueS}, 0)`);
      wlineGrad.addColorStop(0.15, `rgba(${C.blueS}, 0.55)`);
      wlineGrad.addColorStop(0.5, `rgba(${C.indigoBr}, 0.85)`);
      wlineGrad.addColorStop(0.85, `rgba(${C.blueS}, 0.55)`);
      wlineGrad.addColorStop(1, `rgba(${C.blueS}, 0)`);
      ctx.strokeStyle = wlineGrad;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = `rgba(${C.blueS}, 0.6)`;
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      for (let i = 0; i <= waveSteps; i++) {
        const nx = i / waveSteps;
        const py = waveY(nx, t - 0.28) + 18;
        i === 0 ? ctx.moveTo(0, py) : ctx.lineTo(nx * W, py);
      }
      ctx.strokeStyle = `rgba(${C.indigo}, 0.18)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // ── 3. Flow lines ─────────────────────────────────────────────────────
      for (let li = flowLines.length - 1; li >= 0; li--) {
        const fl = flowLines[li];
        fl.progress += fl.speed;
        if (fl.progress > 1.3) { flowLines[li] = spawnFlowLine(); continue; }

        const vis = Math.min(1, fl.progress / 0.2) * Math.max(0, 1 - (fl.progress - 0.8) / 0.5);
        const startIdx = Math.max(0, Math.floor(fl.progress * fl.points.length) - 22);
        const endIdx = Math.min(fl.points.length - 1, Math.floor(fl.progress * fl.points.length));
        if (endIdx - startIdx < 2) continue;

        ctx.save();
        ctx.globalAlpha = fl.opacity * vis;
        ctx.lineWidth = fl.width;
        ctx.lineCap = 'round';
        const grad = ctx.createLinearGradient(
          fl.points[startIdx].x, fl.points[startIdx].y,
          fl.points[endIdx].x, fl.points[endIdx].y
        );
        grad.addColorStop(0, `rgba(${fl.color}, 0)`);
        grad.addColorStop(0.6, `rgba(${fl.color}, 0.85)`);
        grad.addColorStop(1, `rgba(255,255,255, 0.95)`);
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(fl.points[startIdx].x, fl.points[startIdx].y);
        for (let pi = startIdx + 1; pi <= endIdx; pi++) {
          ctx.lineTo(fl.points[pi].x, fl.points[pi].y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // ── 4. Binary glyphs ─────────────────────────────────────────────────
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      glyphs.forEach(g => {
        g.y += g.speed;
        if (g.y > H + 20) { g.y = -20; g.x = rand(0, W); }
        ctx.font = `${g.size}px monospace`;
        const drift = Math.sin(t * 0.4 + g.x * 0.01) * 6;
        const wy = waveY(g.x / W, t);
        const distToWave = Math.abs(g.y - wy);
        const nearWave = Math.max(0, 1 - distToWave / (H * 0.2));
        // Also brighten near cursor
        const distToCursor = isMouseInside ? Math.hypot(g.x - mScreenX, g.y - mScreenY) : 9999;
        const nearCursor = Math.max(0, 1 - distToCursor / 140);
        ctx.globalAlpha = g.opacity * (1 + nearWave * 0.8 + nearCursor * 2.5);
        ctx.fillStyle = nearCursor > 0.3 ? `rgba(255,255,255,1)` : `rgba(${C.blueS}, 1)`;
        ctx.fillText(g.char, g.x + drift, g.y);
      });
      ctx.restore();

      // ── 5. Particles with mouse repulsion / attraction ─────────────────────
      const REPEL_RADIUS = 130;
      const REPEL_FORCE = 0.45;
      const ATTRACT_RING_MIN = 140;
      const ATTRACT_RING_MAX = 250;
      const ATTRACT_FORCE = 0.06;

      particles.forEach(p => {
        p.wx += p.speed + p.vx / W;
        if (p.wx > 1.08) { p.wx = -0.08; p.trail = []; }

        p.blink += p.blinkSpeed;
        p.opacity += (p.opacityTarget - p.opacity) * 0.03;
        if (Math.abs(p.opacity - p.opacityTarget) < 0.01) {
          p.opacityTarget = rand(0.2, 1.0);
        }

        const px = p.wx * W;
        const baseY = waveY(p.wx, t);
        const py = baseY + p.wy + Math.sin(t * 0.6 + p.wx * 8) * 12 + p.vy;

        // Mouse interaction
        if (isMouseInside) {
          const dx = px - mScreenX;
          const dy = py - mScreenY;
          const dist = Math.hypot(dx, dy);

          if (dist < REPEL_RADIUS && dist > 0.5) {
            // Repel particles close to cursor
            const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
            p.vx = lerp(p.vx, (dx / dist) * force * 6, 0.12);
            p.vy = lerp(p.vy, (dy / dist) * force * 6, 0.12);
          } else if (dist > ATTRACT_RING_MIN && dist < ATTRACT_RING_MAX) {
            // Gently attract particles in the ring just outside repel radius
            const force = (1 - Math.abs(dist - (ATTRACT_RING_MIN + ATTRACT_RING_MAX) * 0.5) /
                              ((ATTRACT_RING_MAX - ATTRACT_RING_MIN) * 0.5)) * ATTRACT_FORCE;
            p.vx = lerp(p.vx, -(dx / dist) * force * 3, 0.04);
            p.vy = lerp(p.vy, -(dy / dist) * force * 3, 0.04);
          } else {
            // Dampen velocity when not near cursor
            p.vx = lerp(p.vx, 0, 0.06);
            p.vy = lerp(p.vy, 0, 0.06);
          }
        } else {
          p.vx = lerp(p.vx, 0, 0.04);
          p.vy = lerp(p.vy, 0, 0.04);
        }

        // Trail
        p.trail.push({ x: px, y: py });
        if (p.trail.length > p.maxTrail) p.trail.shift();

        if (p.trail.length > 1) {
          ctx.save();
          ctx.lineCap = 'round';
          for (let ti = 1; ti < p.trail.length; ti++) {
            const frac = ti / p.trail.length;
            ctx.globalAlpha = p.opacity * frac * 0.45;
            ctx.strokeStyle = `rgba(${p.color}, 1)`;
            ctx.lineWidth = p.size * frac * 0.5;
            ctx.beginPath();
            ctx.moveTo(p.trail[ti - 1].x, p.trail[ti - 1].y);
            ctx.lineTo(p.trail[ti].x, p.trail[ti].y);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Glow halo — brighter near cursor
        const distToCursorP = isMouseInside ? Math.hypot(px - mScreenX, py - mScreenY) : 9999;
        const cursorNear = Math.max(0, 1 - distToCursorP / REPEL_RADIUS);
        const haloRadius = p.size * (p.isRed ? 5 : 4) * (1 + cursorNear * 2.5);

        const glow = ctx.createRadialGradient(px, py, 0, px, py, haloRadius);
        glow.addColorStop(0, `rgba(${p.color}, ${p.opacity * (0.6 + cursorNear * 0.4)})`);
        glow.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, haloRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(px, py, p.size * (1 + cursorNear * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = cursorNear > 0.4 ? '#ffffff' : (p.isRed ? `rgba(${p.color}, 1)` : '#ffffff');
        if (p.isRed || cursorNear > 0.3) {
          ctx.shadowColor = cursorNear > 0.3 ? `rgba(${C.blueS}, 1)` : `rgba(${C.red}, 0.9)`;
          ctx.shadowBlur = 12 + cursorNear * 16;
        }
        ctx.fill();
        ctx.restore();
      });

      // ── 6. Click ripples ──────────────────────────────────────────────────
      for (let ri = ripples.length - 1; ri >= 0; ri--) {
        const rp = ripples[ri];
        rp.r += rp.speed;
        rp.alpha -= 0.018;
        if (rp.alpha <= 0 || rp.r >= rp.maxR) { ripples.splice(ri, 1); continue; }

        ctx.save();
        // Draw multiple concentric rings
        for (let ring = 0; ring < rp.rings; ring++) {
          const rOff = ring * 18;
          const ringR = rp.r - rOff;
          if (ringR <= 0) continue;
          const ringAlpha = rp.alpha * (1 - ring * 0.3);
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${rp.color}, ${ringAlpha})`;
          ctx.lineWidth = Math.max(0.5, 2.5 - ring * 0.6 - rp.r / rp.maxR * 2);
          ctx.shadowColor = `rgba(${rp.color}, ${ringAlpha})`;
          ctx.shadowBlur = 12;
          ctx.stroke();
        }
        // Inner flash
        if (rp.r < 30) {
          const flashAlpha = (1 - rp.r / 30) * rp.alpha * 0.7;
          const flash = ctx.createRadialGradient(rp.x, rp.y, 0, rp.x, rp.y, 30);
          flash.addColorStop(0, `rgba(255,255,255,${flashAlpha})`);
          flash.addColorStop(0.5, `rgba(${rp.color}, ${flashAlpha * 0.5})`);
          flash.addColorStop(1, `rgba(${rp.color}, 0)`);
          ctx.fillStyle = flash;
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, 30, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // ── 7. Vignette ───────────────────────────────────────────────────────
      ctx.save();
      const topVig = ctx.createLinearGradient(0, 0, 0, H * 0.3);
      topVig.addColorStop(0, 'rgba(6,7,26,0.72)');
      topVig.addColorStop(1, 'rgba(6,7,26,0)');
      ctx.fillStyle = topVig;
      ctx.fillRect(0, 0, W, H * 0.3);

      const botVig = ctx.createLinearGradient(0, H * 0.75, 0, H);
      botVig.addColorStop(0, 'rgba(6,7,26,0)');
      botVig.addColorStop(1, 'rgba(6,7,26,0.6)');
      ctx.fillStyle = botVig;
      ctx.fillRect(0, H * 0.75, W, H * 0.25);

      const lVig = ctx.createLinearGradient(0, 0, W * 0.08, 0);
      lVig.addColorStop(0, 'rgba(6,7,26,0.45)');
      lVig.addColorStop(1, 'rgba(6,7,26,0)');
      ctx.fillStyle = lVig;
      ctx.fillRect(0, 0, W * 0.08, H);

      const rVig = ctx.createLinearGradient(W * 0.92, 0, W, 0);
      rVig.addColorStop(0, 'rgba(6,7,26,0)');
      rVig.addColorStop(1, 'rgba(6,7,26,0.45)');
      ctx.fillStyle = rVig;
      ctx.fillRect(W * 0.92, 0, W * 0.08, H);
      ctx.restore();

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('click', onClick);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchstart', onTouch);
      cancelAnimationFrame(raf);
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
