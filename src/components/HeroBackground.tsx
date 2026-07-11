import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  id: number;
}

export default function HeroBackground() {
  const shouldReduceMotion = useReducedMotion();
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldReduceMotion) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    
    let isTouch = false;
    let ripples: Ripple[] = [];
    let rippleId = 0;
    let animationFrameId: number;

    const spawnRipple = (x: number, y: number) => {
      ripples.push({ x, y, radius: 10, opacity: 1.5, id: rippleId++ });
    };

    const updateMouse = (e: MouseEvent) => {
      isTouch = false;
      targetX = e.clientX;
      targetY = e.clientY;
    };

    let lastTouchTime = 0;
    const updateTouch = (e: TouchEvent) => {
      isTouch = true;
      if (e.touches.length > 0) {
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        
        // Throttle ripple spawning on drag
        const now = Date.now();
        if (now - lastTouchTime > 80) { // Spawns ripples faster when dragging
          spawnRipple(x, y);
          lastTouchTime = now;
        }
      }
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      isTouch = true;
      if (e.touches.length > 0) {
        spawnRipple(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const animate = () => {
      const maskParts = [];
      
      // 1. Desktop cursor flashlight (smooth lerp)
      if (!isTouch) {
        currentX += (targetX - currentX) * 0.15;
        currentY += (targetY - currentY) * 0.15;
        maskParts.push(`radial-gradient(circle 400px at ${currentX}px ${currentY}px, black 0%, transparent 100%)`);
      }

      // 2. Mobile ripples (expanding rings)
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 24; // Much faster expansion
        r.opacity -= 0.03; // Faster fade
        
        if (r.opacity <= 0) {
          ripples.splice(i, 1);
        } else {
          // Creates a high-contrast ring wave
          const centerOp = Math.min(1, r.opacity * 0.1).toFixed(2);
          const edgeOp = Math.min(1, r.opacity).toFixed(2);
          maskParts.push(`radial-gradient(circle ${r.radius}px at ${r.x}px ${r.y}px, rgba(0,0,0,${centerOp}) 0%, rgba(0,0,0,${edgeOp}) 70%, transparent 100%)`);
        }
      }
      
      const maskStr = maskParts.length > 0 ? maskParts.join(', ') : 'none';
      
      if (divRef.current) {
        divRef.current.style.maskImage = maskStr;
        divRef.current.style.webkitMaskImage = maskStr;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', updateMouse);
    window.addEventListener('touchmove', updateTouch, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    animate();

    return () => {
      window.removeEventListener('mousemove', updateMouse);
      window.removeEventListener('touchmove', updateTouch);
      window.removeEventListener('touchstart', handleTouchStart);
      cancelAnimationFrame(animationFrameId);
    };
  }, [shouldReduceMotion]);

  const baseStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: 'linear-gradient(to right, rgba(108,76,241,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(108,76,241,0.5) 1px, transparent 1px)',
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
    zIndex: 1 
  };

  if (shouldReduceMotion) {
    return <div style={baseStyles} />;
  }

  return (
    <div
      ref={divRef}
      style={{
        ...baseStyles,
        maskImage: 'radial-gradient(circle 400px at 50vw 50vh, black 0%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(circle 400px at 50vw 50vh, black 0%, transparent 100%)',
      }}
    />
  );
}
