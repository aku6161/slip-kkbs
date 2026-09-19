import React, { useEffect, useRef } from 'react';

// Color palette tailored for KKBS SLIP (Cosmic Navy, Electric Cyan, Sapphire Blue, Violet, Mint, Amber)
const PALETTE = [
  { color: '#38bdf8', rgb: '56, 189, 248', glow: 'rgba(56, 189, 248, 0.8)' },   // Cyan / Sky
  { color: '#3b82f6', rgb: '59, 130, 246', glow: 'rgba(59, 130, 246, 0.8)' },   // Royal Blue
  { color: '#6366f1', rgb: '99, 102, 241', glow: 'rgba(99, 102, 241, 0.8)' },   // Indigo
  { color: '#8b5cf6', rgb: '139, 92, 246', glow: 'rgba(139, 92, 246, 0.8)' },   // Purple / Violet
  { color: '#06b6d4', rgb: '6, 182, 212', glow: 'rgba(6, 182, 212, 0.8)' },     // Deep Cyan
  { color: '#10b981', rgb: '16, 185, 129', glow: 'rgba(16, 185, 129, 0.8)' },   // Emerald Mint
  { color: '#f59e0b', rgb: '245, 158, 11', glow: 'rgba(245, 158, 11, 0.8)' },   // Amber Gold
];

interface Point3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  colorIdx: number;
  radius: number;
  pulseSpeed: number;
  pulsePhase: number;
  // Screen projection caches
  projX: number;
  projY: number;
  projScale: number;
  projAlpha: number;
}

interface DataPulse {
  fromIdx: number;
  toIdx: number;
  progress: number;
  speed: number;
  colorIdx: number;
  length: number;
}

interface PolyhedronShape {
  centerX: number;
  centerY: number;
  centerZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  size: number;
  colorIdx: number;
  vertices: [number, number, number][];
  faces: number[][];
  edges: [number, number][];
}

export const DynamicWaveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Mouse parallax tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleResize = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Initialize 3D Space & Nodes
    const NODE_COUNT = Math.min(75, Math.max(45, Math.floor(window.innerWidth / 24)));
    const DEPTH_RANGE = 900;
    const FOV = 550;

    const nodes: Point3D[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * 1100,
        y: (Math.random() - 0.5) * 800,
        z: (Math.random() - 0.5) * DEPTH_RANGE,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        vz: (Math.random() - 0.5) * 0.35,
        colorIdx: Math.floor(Math.random() * PALETTE.length),
        radius: 1.8 + Math.random() * 2.2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2,
        projX: 0,
        projY: 0,
        projScale: 0,
        projAlpha: 0
      });
    }

    // Initialize floating Geometric Polyhedra (3D Shapes in space)
    const createOctahedron = (): { vertices: [number, number, number][]; faces: number[][]; edges: [number, number][] } => {
      const v: [number, number, number][] = [
        [0, 1, 0], [0, -1, 0],
        [1, 0, 0], [-1, 0, 0],
        [0, 0, 1], [0, 0, -1]
      ];
      const e: [number, number][] = [
        [0, 2], [0, 3], [0, 4], [0, 5],
        [1, 2], [1, 3], [1, 4], [1, 5],
        [2, 4], [4, 3], [3, 5], [5, 2]
      ];
      const f: number[][] = [
        [0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2],
        [1, 4, 2], [1, 3, 4], [1, 5, 3], [1, 2, 5]
      ];
      return { vertices: v, faces: f, edges: e };
    };

    const createIcosahedron = (): { vertices: [number, number, number][]; faces: number[][]; edges: [number, number][] } => {
      const t = (1.0 + Math.sqrt(5.0)) / 2.0;
      const v: [number, number, number][] = [
        [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
        [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
        [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
      ].map(([x, y, z]) => {
        const len = Math.sqrt(x * x + y * y + z * z);
        return [x / len, y / len, z / len];
      });

      const e: [number, number][] = [
        [0, 11], [0, 5], [0, 1], [0, 7], [0, 10],
        [1, 5], [5, 11], [11, 10], [10, 7], [7, 1],
        [3, 9], [3, 4], [3, 2], [3, 6], [3, 8],
        [4, 9], [2, 4], [6, 2], [8, 6], [9, 8],
        [4, 5], [5, 9], [9, 1], [1, 8], [8, 7], [7, 6], [6, 10], [10, 2], [2, 11], [11, 4]
      ];

      const f: number[][] = [
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
      ];
      return { vertices: v, faces: f, edges: e };
    };

    const polyhedra: PolyhedronShape[] = [
      {
        centerX: -320,
        centerY: -140,
        centerZ: 120,
        rotX: 0.2,
        rotY: 0.4,
        rotZ: 0.1,
        rotSpeedX: 0.007,
        rotSpeedY: 0.012,
        rotSpeedZ: 0.005,
        size: 58,
        colorIdx: 0, // Sky Cyan
        ...createIcosahedron()
      },
      {
        centerX: 350,
        centerY: 160,
        centerZ: -80,
        rotX: 0.8,
        rotY: 0.2,
        rotZ: 0.6,
        rotSpeedX: -0.009,
        rotSpeedY: 0.008,
        rotSpeedZ: -0.004,
        size: 64,
        colorIdx: 2, // Indigo
        ...createOctahedron()
      },
      {
        centerX: 120,
        centerY: -220,
        centerZ: -180,
        rotX: 0.3,
        rotY: 0.7,
        rotZ: 0.4,
        rotSpeedX: 0.006,
        rotSpeedY: -0.007,
        rotSpeedZ: 0.009,
        size: 44,
        colorIdx: 5, // Mint
        ...createOctahedron()
      },
      {
        centerX: -220,
        centerY: 240,
        centerZ: 200,
        rotX: 0.5,
        rotY: 0.9,
        rotZ: 0.2,
        rotSpeedX: -0.008,
        rotSpeedY: 0.011,
        rotSpeedZ: 0.006,
        size: 50,
        colorIdx: 3, // Violet
        ...createIcosahedron()
      }
    ];

    // Data Pulses flowing along connections
    const pulses: DataPulse[] = [];
    const MAX_PULSES = 16;

    let time = 0;
    let baseAngleY = 0;
    let baseAngleX = 0;

    const render = () => {
      time += 1;
      baseAngleY += 0.0016;
      baseAngleX = Math.sin(time * 0.001) * 0.12;

      // Smooth mouse easing
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      const totalAngleY = baseAngleY + mouseX * 0.35;
      const totalAngleX = baseAngleX + mouseY * 0.25;

      const sinY = Math.sin(totalAngleY);
      const cosY = Math.cos(totalAngleY);
      const sinX = Math.sin(totalAngleX);
      const cosX = Math.cos(totalAngleX);

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep, luminous digital space backdrop with ambient nebula glows
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#040712');
      bgGrad.addColorStop(0.35, '#071026');
      bgGrad.addColorStop(0.7, '#0b1633');
      bgGrad.addColorStop(1, '#050a17');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient radial glow 1 (Cyan/Blue top-right)
      const glow1 = ctx.createRadialGradient(
        width * 0.75 + mouseX * 40,
        height * 0.25 + mouseY * 40,
        20,
        width * 0.75,
        height * 0.25,
        width * 0.55
      );
      glow1.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
      glow1.addColorStop(0.4, 'rgba(37, 99, 235, 0.10)');
      glow1.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);

      // Ambient radial glow 2 (Violet/Indigo bottom-left)
      const glow2 = ctx.createRadialGradient(
        width * 0.25 - mouseX * 40,
        height * 0.8 - mouseY * 40,
        20,
        width * 0.25,
        height * 0.8,
        width * 0.5
      );
      glow2.addColorStop(0, 'rgba(139, 92, 246, 0.14)');
      glow2.addColorStop(0.5, 'rgba(99, 102, 241, 0.06)');
      glow2.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Update and project 3D Nodes
      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.pulsePhase += p.pulseSpeed;

        // Bounding box bounce/wrap
        const boxX = 580;
        const boxY = 440;
        const boxZ = DEPTH_RANGE / 2;

        if (p.x < -boxX) { p.x = -boxX; p.vx *= -1; }
        if (p.x > boxX) { p.x = boxX; p.vx *= -1; }
        if (p.y < -boxY) { p.y = -boxY; p.vy *= -1; }
        if (p.y > boxY) { p.y = boxY; p.vy *= -1; }
        if (p.z < -boxZ) { p.z = -boxZ; p.vz *= -1; }
        if (p.z > boxZ) { p.z = boxZ; p.vz *= -1; }

        // 3D Matrix Rotation (Around Y then X)
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;

        const y2 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        // Perspective projection
        const depthDist = FOV + z2 + 250;
        const scale = depthDist > 20 ? FOV / depthDist : 0;

        p.projX = centerX + x1 * scale;
        p.projY = centerY + y2 * scale;
        p.projScale = scale;
        // Depth-based opacity
        const depthAlpha = Math.max(0.1, Math.min(1, (z2 + boxZ) / (boxZ * 2)));
        p.projAlpha = depthAlpha;
      }

      // Collect connections and neighboring triangles
      const CONNECT_DIST_3D = 185;
      const connectedPairs: [number, number, number][] = [];
      const neighbors: number[][] = Array.from({ length: nodes.length }, () => []);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const p1 = nodes[i];
          const p2 = nodes[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dz = p1.z - p2.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < CONNECT_DIST_3D) {
            connectedPairs.push([i, j, dist]);
            neighbors[i].push(j);
            neighbors[j].push(i);
          }
        }
      }

      // 1. Draw glowing 3D Triangular Polygonal Facets (Big Data Connected Shapes)
      for (let i = 0; i < nodes.length; i++) {
        const nbrs = neighbors[i];
        for (let ni = 0; ni < nbrs.length; ni++) {
          const j = nbrs[ni];
          if (j <= i) continue;
          for (let nk = ni + 1; nk < nbrs.length; nk++) {
            const k = nbrs[nk];
            if (k <= j) continue;
            // Check if j and k are also connected
            if (neighbors[j].includes(k)) {
              const pA = nodes[i];
              const pB = nodes[j];
              const pC = nodes[k];

              // Skip if any point is offscreen or behind camera
              if (pA.projScale <= 0 || pB.projScale <= 0 || pC.projScale <= 0) continue;

              const avgAlpha = (pA.projAlpha + pB.projAlpha + pC.projAlpha) / 3;
              const facetAlpha = Math.min(0.12, avgAlpha * 0.09);

              ctx.beginPath();
              ctx.moveTo(pA.projX, pA.projY);
              ctx.lineTo(pB.projX, pB.projY);
              ctx.lineTo(pC.projX, pC.projY);
              ctx.closePath();

              const colorChoice = PALETTE[pA.colorIdx];
              ctx.fillStyle = `rgba(${colorChoice.rgb}, ${facetAlpha})`;
              ctx.fill();

              // Subtle shape border
              ctx.lineWidth = 0.5;
              ctx.strokeStyle = `rgba(${colorChoice.rgb}, ${facetAlpha * 1.5})`;
              ctx.stroke();
            }
          }
        }
      }

      // 2. Draw Connected Lines with smooth gradient and glow
      for (let k = 0; k < connectedPairs.length; k++) {
        const [i, j, dist] = connectedPairs[k];
        const p1 = nodes[i];
        const p2 = nodes[j];

        if (p1.projScale <= 0 || p2.projScale <= 0) continue;

        const proximity = 1 - dist / CONNECT_DIST_3D;
        const lineAlpha = proximity * Math.min(p1.projAlpha, p2.projAlpha) * 0.75;

        if (lineAlpha <= 0.02) continue;

        const grad = ctx.createLinearGradient(p1.projX, p1.projY, p2.projX, p2.projY);
        grad.addColorStop(0, `rgba(${PALETTE[p1.colorIdx].rgb}, ${lineAlpha})`);
        grad.addColorStop(1, `rgba(${PALETTE[p2.colorIdx].rgb}, ${lineAlpha})`);

        ctx.beginPath();
        ctx.moveTo(p1.projX, p1.projY);
        ctx.lineTo(p2.projX, p2.projY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(0.6, 1.4 * proximity * Math.min(p1.projScale, p2.projScale));
        ctx.stroke();
      }

      // 3. Manage and Render Active Data Pulses along lines
      if (connectedPairs.length > 0 && pulses.length < MAX_PULSES && Math.random() < 0.25) {
        const randomPair = connectedPairs[Math.floor(Math.random() * connectedPairs.length)];
        pulses.push({
          fromIdx: randomPair[0],
          toIdx: randomPair[1],
          progress: 0,
          speed: 0.012 + Math.random() * 0.018,
          colorIdx: nodes[randomPair[0]].colorIdx,
          length: 0.18 + Math.random() * 0.15
        });
      }

      for (let pIdx = pulses.length - 1; pIdx >= 0; pIdx--) {
        const pulse = pulses[pIdx];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1.0) {
          pulses.splice(pIdx, 1);
          continue;
        }

        const pA = nodes[pulse.fromIdx];
        const pB = nodes[pulse.toIdx];
        if (!pA || !pB || pA.projScale <= 0 || pB.projScale <= 0) continue;

        const tHead = Math.min(1, pulse.progress);
        const tTail = Math.max(0, pulse.progress - pulse.length);

        const headX = pA.projX + (pB.projX - pA.projX) * tHead;
        const headY = pA.projY + (pB.projY - pA.projY) * tHead;
        const tailX = pA.projX + (pB.projX - pA.projX) * tTail;
        const tailY = pA.projY + (pB.projY - pA.projY) * tTail;

        const pulseGrad = ctx.createLinearGradient(tailX, tailY, headX, headY);
        const color = PALETTE[pulse.colorIdx];
        pulseGrad.addColorStop(0, `rgba(${color.rgb}, 0)`);
        pulseGrad.addColorStop(0.7, `rgba(${color.rgb}, 0.8)`);
        pulseGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.strokeStyle = pulseGrad;
        ctx.lineWidth = 2.2 * Math.min(pA.projScale, pB.projScale);
        ctx.stroke();

        // Glowing head spark
        ctx.beginPath();
        ctx.arc(headX, headY, 2.2 * pA.projScale, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = color.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      // 4. Render Floating 3D Polyhedra (Wireframe & Translucent Polygonal Shapes)
      polyhedra.forEach((poly) => {
        poly.rotX += poly.rotSpeedX;
        poly.rotY += poly.rotSpeedY;
        poly.rotZ += poly.rotSpeedZ;

        // Center rotation in global scene
        const cX1 = poly.centerX * cosY - poly.centerZ * sinY;
        const cZ1 = poly.centerZ * cosY + poly.centerX * sinY;
        const cY2 = poly.centerY * cosX - cZ1 * sinX;
        const cZ2 = cZ1 * cosX + poly.centerY * sinX;

        // Local rotation matrices
        const sX = Math.sin(poly.rotX), cX = Math.cos(poly.rotX);
        const sY = Math.sin(poly.rotY), cY = Math.cos(poly.rotY);
        const sZ = Math.sin(poly.rotZ), cZ = Math.cos(poly.rotZ);

        // Project vertices
        const projVerts: { x: number; y: number; z: number; px: number; py: number; scale: number }[] = [];
        for (let vi = 0; vi < poly.vertices.length; vi++) {
          const [vx, vy, vz] = poly.vertices[vi];
          // Scale local vertex
          const lx = vx * poly.size;
          const ly = vy * poly.size;
          const lz = vz * poly.size;

          // Local rotation Z -> Y -> X
          const xz = lx * cZ - ly * sZ;
          const yz = ly * cZ + lx * sZ;
          const zz = lz;

          const xy = xz * cY + zz * sY;
          const yy = yz;
          const zy = zz * cY - xz * sY;

          const xx = xy;
          const yx = yy * cX - zy * sX;
          const zx = zy * cX + yy * sX;

          // Position in global 3D space
          const gx = poly.centerX + xx;
          const gy = poly.centerY + yx;
          const gz = poly.centerZ + zx;

          // Global camera rotation
          const gx1 = gx * cosY - gz * sinY;
          const gz1 = gz * cosY + gx * sinY;
          const gy2 = gy * cosX - gz1 * sinX;
          const gz2 = gz1 * cosX + gy * sinX;

          const depth = FOV + gz2 + 250;
          const scale = depth > 20 ? FOV / depth : 0;

          projVerts.push({
            x: gx1,
            y: gy2,
            z: gz2,
            px: centerX + gx1 * scale,
            py: centerY + gy2 * scale,
            scale
          });
        }

        const color = PALETTE[poly.colorIdx];
        const shapeAlpha = Math.max(0.15, Math.min(0.85, (cZ2 + DEPTH_RANGE / 2) / DEPTH_RANGE));

        // Draw translucent faces
        poly.faces.forEach((face) => {
          if (face.length < 3) return;
          const v0 = projVerts[face[0]];
          const v1 = projVerts[face[1]];
          const v2 = projVerts[face[2]];
          if (!v0 || !v1 || !v2 || v0.scale <= 0 || v1.scale <= 0 || v2.scale <= 0) return;

          // Simple 2D backface culling check
          const cross = (v1.px - v0.px) * (v2.py - v0.py) - (v1.py - v0.py) * (v2.px - v0.px);
          const faceOpacity = cross > 0 ? shapeAlpha * 0.12 : shapeAlpha * 0.04;

          ctx.beginPath();
          ctx.moveTo(v0.px, v0.py);
          for (let fi = 1; fi < face.length; fi++) {
            ctx.lineTo(projVerts[face[fi]].px, projVerts[face[fi]].py);
          }
          ctx.closePath();
          ctx.fillStyle = `rgba(${color.rgb}, ${faceOpacity})`;
          ctx.fill();
        });

        // Draw wireframe edges
        ctx.strokeStyle = `rgba(${color.rgb}, ${shapeAlpha * 0.65})`;
        ctx.lineWidth = 1.1;
        poly.edges.forEach(([e0, e1]) => {
          const vA = projVerts[e0];
          const vB = projVerts[e1];
          if (!vA || !vB || vA.scale <= 0 || vB.scale <= 0) return;

          ctx.beginPath();
          ctx.moveTo(vA.px, vA.py);
          ctx.lineTo(vB.px, vB.py);
          ctx.stroke();
        });

        // Glowing vertices
        projVerts.forEach((pv) => {
          if (pv.scale <= 0) return;
          ctx.beginPath();
          ctx.arc(pv.px, pv.py, 2.2 * pv.scale, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = color.color;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      });

      // 5. Draw Glowing Node Points and Pulsing Rings
      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i];
        if (p.projScale <= 0) continue;

        const color = PALETTE[p.colorIdx];
        const pulse = 0.75 + Math.sin(p.pulsePhase) * 0.25;
        const currentRadius = p.radius * p.projScale * pulse;
        const finalAlpha = Math.min(1, p.projAlpha * 0.95);

        // Soft outer halo glow
        const haloRadius = currentRadius * 3.8;
        const haloGrad = ctx.createRadialGradient(
          p.projX, p.projY, currentRadius * 0.5,
          p.projX, p.projY, haloRadius
        );
        haloGrad.addColorStop(0, `rgba(${color.rgb}, ${finalAlpha * 0.45})`);
        haloGrad.addColorStop(1, `rgba(${color.rgb}, 0)`);

        ctx.beginPath();
        ctx.arc(p.projX, p.projY, haloRadius, 0, Math.PI * 2);
        ctx.fillStyle = haloGrad;
        ctx.fill();

        // Node core
        ctx.beginPath();
        ctx.arc(p.projX, p.projY, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = color.color;
        ctx.fill();

        // Bright white center specular
        ctx.beginPath();
        ctx.arc(p.projX, p.projY, currentRadius * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
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
