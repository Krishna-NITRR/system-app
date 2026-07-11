import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function HeroBackground() {
  const shouldReduceMotion = useReducedMotion();
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldReduceMotion) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    
    let animationFrameId: number;

    const updateMouse = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const updateTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetX = e.touches[0].clientX;
        targetY = e.touches[0].clientY;
      }
    };

    const resetMouse = () => {
      targetX = window.innerWidth / 2;
      targetY = window.innerHeight / 2;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      
      if (divRef.current) {
        divRef.current.style.setProperty('--mouse-x', `${currentX}px`);
        divRef.current.style.setProperty('--mouse-y', `${currentY}px`);
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', updateMouse);
    window.addEventListener('touchmove', updateTouch);
    window.addEventListener('mouseleave', resetMouse);
    window.addEventListener('touchend', resetMouse);
    
    animate();

    return () => {
      window.removeEventListener('mousemove', updateMouse);
      window.removeEventListener('touchmove', updateTouch);
      window.removeEventListener('mouseleave', resetMouse);
      window.removeEventListener('touchend', resetMouse);
      cancelAnimationFrame(animationFrameId);
    };
  }, [shouldReduceMotion]);

  const baseStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: 'linear-gradient(to right, rgba(108,76,241,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(108,76,241,0.5) 1px, transparent 1px)',
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
    zIndex: 1 // Increased zIndex slightly just in case
  };

  if (shouldReduceMotion) {
    return <div style={baseStyles} />;
  }

  return (
    <div
      ref={divRef}
      style={{
        ...baseStyles,
        maskImage: 'radial-gradient(circle 400px at var(--mouse-x, 50vw) var(--mouse-y, 50vh), black 0%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(circle 400px at var(--mouse-x, 50vw) var(--mouse-y, 50vh), black 0%, transparent 100%)',
      }}
    />
  );
}
