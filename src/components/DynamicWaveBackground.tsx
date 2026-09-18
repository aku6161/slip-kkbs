import React, { useEffect, useRef } from 'react';

interface WaveLayer {
  amplitude: number;
  frequency: number;
  speed: number;
  offset: number;
  colorStops: [number, string][];
  opacity: number;
  baseHeightRatio: number;
}

export const DynamicWaveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Multi-layered soft silky wave configurations inspired by 4k soft wave loop
    const waveLayers: WaveLayer[] = [
      {
        amplitude: 55,
        frequency: 0.0012,
        speed: 0.008,
        offset: 0,
        baseHeightRatio: 0.45,
        opacity: 0.85,
        colorStops: [
          [0, '#0f172a'],
          [0.35, '#1e3a8a'],
          [0.7, '#2563eb'],
          [1, '#38bdf8']
        ]
      },
      {
        amplitude: 70,
        frequency: 0.0018,
        speed: -0.006,
        offset: 1.8,
        baseHeightRatio: 0.52,
        opacity: 0.65,
        colorStops: [
          [0, '#1e293b'],
          [0.4, '#1d4ed8'],
          [0.8, '#0284c7'],
          [1, '#60a5fa']
        ]
      },
      {
        amplitude: 85,
        frequency: 0.001,
        speed: 0.005,
        offset: 3.5,
        baseHeightRatio: 0.6,
        opacity: 0.75,
        colorStops: [
          [0, '#0b1329'],
          [0.3, '#1e40af'],
          [0.65, '#3b82f6'],
          [1, '#93c5fd']
        ]
      },
      {
        amplitude: 110,
        frequency: 0.0008,
        speed: -0.004,
        offset: 5.2,
        baseHeightRatio: 0.68,
        opacity: 0.9,
        colorStops: [
          [0, '#030712'],
          [0.35, '#172554'],
          [0.7, '#1e3a8a'],
          [1, '#2563eb']
        ]
      },
      {
        amplitude: 40,
        frequency: 0.0022,
        speed: 0.012,
        offset: 2.4,
        baseHeightRatio: 0.38,
        opacity: 0.35,
        colorStops: [
          [0, 'rgba(56, 189, 248, 0.4)'],
          [0.5, 'rgba(147, 197, 253, 0.6)'],
          [1, 'rgba(255, 255, 255, 0.8)']
        ]
      }
    ];

    let time = 0;

    const render = () => {
      time += 1;

      // Deep, luminous ambient gradient backdrop
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#070c18');
      bgGradient.addColorStop(0.4, '#0f1d3b');
      bgGradient.addColorStop(0.75, '#132852');
      bgGradient.addColorStop(1, '#091326');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Render each silky wave layer
      for (let i = 0; i < waveLayers.length; i++) {
        const wave = waveLayers[i];
        const currentOffset = wave.offset + time * wave.speed;
        const baseY = height * wave.baseHeightRatio;

        ctx.save();
        ctx.globalAlpha = wave.opacity;
        ctx.beginPath();
        ctx.moveTo(0, height);

        // Draw smooth sinusoidal curve across the width
        const step = Math.max(10, Math.floor(width / 120));
        for (let x = 0; x <= width + step; x += step) {
          const y1 = Math.sin(x * wave.frequency + currentOffset) * wave.amplitude;
          const y2 = Math.cos(x * wave.frequency * 0.65 - currentOffset * 0.7) * (wave.amplitude * 0.4);
          const y3 = Math.sin(x * wave.frequency * 1.5 + currentOffset * 1.2) * (wave.amplitude * 0.25);
          const y = baseY + y1 + y2 + y3;

          if (x === 0) {
            ctx.lineTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Shimmering wave gradient fill
        const waveGrad = ctx.createLinearGradient(0, baseY - wave.amplitude * 1.5, width, height);
        wave.colorStops.forEach(([stop, color]) => {
          waveGrad.addColorStop(stop, color);
        });

        ctx.fillStyle = waveGrad;
        ctx.fill();

        // Subtle glowing crest highlight along the wave edge
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.stroke();

        ctx.restore();
      }

      // Soft ambient light orb at the top right to give silky 3D sheen
      const lightOrb = ctx.createRadialGradient(
        width * 0.8,
        height * 0.25,
        10,
        width * 0.8,
        height * 0.25,
        width * 0.6
      );
      lightOrb.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
      lightOrb.addColorStop(0.5, 'rgba(37, 99, 235, 0.08)');
      lightOrb.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = lightOrb;
      ctx.fillRect(0, 0, width, height);

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
