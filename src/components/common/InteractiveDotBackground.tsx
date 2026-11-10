import React, { useEffect, useRef, useState } from 'react';

export const InteractiveDotBackground: React.FC = () => {
  const [smoothPos, setSmoothPos] = useState({ x: -1000, y: -1000 });
  const animFrameRef = useRef<number | null>(null);
  const targetPosRef = useRef({ x: -1000, y: -1000 });
  const currentPosRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    // Initialize to screen center on mount
    if (typeof window !== 'undefined') {
      const initialX = window.innerWidth / 2;
      const initialY = window.innerHeight / 2;
      targetPosRef.current = { x: initialX, y: initialY };
      currentPosRef.current = { x: initialX, y: initialY };
      setSmoothPos({ x: initialX, y: initialY });
    }

    const handlePointerMove = (e: PointerEvent) => {
      targetPosRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Smooth 60fps interpolation loop
    const animate = () => {
      const ease = 0.14;
      currentPosRef.current.x += (targetPosRef.current.x - currentPosRef.current.x) * ease;
      currentPosRef.current.y += (targetPosRef.current.y - currentPosRef.current.y) * ease;

      setSmoothPos({
        x: Math.round(currentPosRef.current.x * 10) / 10,
        y: Math.round(currentPosRef.current.y * 10) / 10
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Parallax displacement offset following the cursor
  const offsetX = (smoothPos.x * 0.05) % 28;
  const offsetY = (smoothPos.y * 0.05) % 28;

  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* 1. Base Ambient Dot Layer: Slightly bigger dots (2px radius / 4px diameter) */}
      <div
        className="absolute -inset-10 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, #94A3B8 2px, transparent 2px)',
          backgroundSize: '28px 28px',
          backgroundPosition: `${offsetX}px ${offsetY}px`
        }}
      />

      {/* 2. Interactive Cursor Spotlight Dot Layer: Highlights & activates dots around cursor */}
      <div
        className="absolute -inset-10 opacity-85"
        style={{
          backgroundImage: 'radial-gradient(circle, #475569 2.4px, transparent 2.4px)',
          backgroundSize: '28px 28px',
          backgroundPosition: `${offsetX}px ${offsetY}px`,
          WebkitMaskImage: `radial-gradient(420px circle at ${smoothPos.x}px ${smoothPos.y}px, black 15%, rgba(0,0,0,0.5) 60%, transparent 100%)`,
          maskImage: `radial-gradient(420px circle at ${smoothPos.x}px ${smoothPos.y}px, black 15%, rgba(0,0,0,0.5) 60%, transparent 100%)`
        }}
      />

      {/* 3. Soft Interactive Cursor Radial Aura */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(480px circle at ${smoothPos.x}px ${smoothPos.y}px, rgba(148, 163, 184, 0.08), transparent 70%)`
        }}
      />
    </div>
  );
};

