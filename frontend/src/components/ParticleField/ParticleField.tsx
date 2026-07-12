import React, { useEffect, useRef } from 'react';
import styles from './ParticleField.module.css';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number; // base alpha
};

type ParticleFieldProps = {
  /** Approx. particles per 100k px². Lower = sparser. */
  density?: number;
  /** Max particles regardless of viewport size (perf ceiling). */
  maxParticles?: number;
  /** Draw faint lines between nearby particles. */
  connect?: boolean;
  className?: string;
};

// Signature accent, split into two hues so the field subtly shimmers
// between indigo and violet.
const COLORS = [
  { r: 99, g: 102, b: 241 }, // indigo
  { r: 139, g: 92, b: 246 }, // violet
  { r: 168, g: 85, b: 247 }, // purple
];

/**
 * A lightweight, ambient canvas particle field meant to sit behind page
 * content. Drifts slowly, pauses when the tab is hidden, and renders nothing
 * animated when the user prefers reduced motion.
 */
export const ParticleField: React.FC<ParticleFieldProps> = ({
  density = 5,
  maxParticles = 70,
  connect = true,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rafId = 0;
    let running = true;

    const colorOf = (p: Particle) =>
      COLORS[Math.floor((p.x + p.y) % COLORS.length)] ?? COLORS[0];

    const seed = () => {
      const target = Math.min(
        maxParticles,
        Math.round(((width * height) / 100000) * density)
      );
      particles = Array.from({ length: Math.max(target, 8) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.6 + 0.8,
        a: Math.random() * 0.4 + 0.25,
      }));
    };

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent?.clientWidth ?? window.innerWidth;
      height = parent?.clientHeight ?? window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around the edges so the field never empties out.
        if (p.x < -5) p.x = width + 5;
        else if (p.x > width + 5) p.x = -5;
        if (p.y < -5) p.y = height + 5;
        else if (p.y > height + 5) p.y = -5;

        const c = colorOf(p);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${p.a})`;
        ctx.fill();
      }

      // Faint connecting lines between nearby particles
      if (connect) {
        const maxDist = 120;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.hypot(dx, dy);
            if (dist < maxDist) {
              const alpha = (1 - dist / maxDist) * 0.12;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(129, 118, 246, ${alpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      }

      if (running && !reducedMotion) {
        rafId = requestAnimationFrame(draw);
      }
    };

    resize();
    draw(); // one frame even under reduced motion, then it stays static

    const onVisibility = () => {
      running = document.visibilityState === 'visible';
      if (running && !reducedMotion) {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(draw);
      }
    };

    const ro = new ResizeObserver(() => resize());
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [density, maxParticles, connect]);

  return (
    <canvas
      ref={canvasRef}
      className={`${styles.canvas}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    />
  );
};
