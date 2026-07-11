import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion, useMotionTemplate } from 'framer-motion';

export default function HeroBackground() {
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);
  const shouldReduceMotion = useReducedMotion();

  // Smooth out the mouse movement to create the spring return effect
  const smoothX = useSpring(mouseX, { damping: 40, stiffness: 150, mass: 0.5 });
  const smoothY = useSpring(mouseY, { damping: 40, stiffness: 150, mass: 0.5 });

  const maskImage = useMotionTemplate`radial-gradient(circle 600px at ${smoothX}px ${smoothY}px, black 0%, transparent 100%)`;

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Adjust if Hero is not taking full viewport, though we'll use clientX/clientY relative to window for simplicity
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX.set(e.touches[0].clientX);
        mouseY.set(e.touches[0].clientY);
      }
    };

    const resetMouse = () => {
      mouseX.set(window.innerWidth / 2);
      mouseY.set(window.innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseleave', resetMouse);
    window.addEventListener('touchend', resetMouse);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', resetMouse);
      window.removeEventListener('touchend', resetMouse);
    };
  }, [mouseX, mouseY, shouldReduceMotion]);

  const baseStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: 'linear-gradient(to right, rgba(108,76,241,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(108,76,241,0.12) 1px, transparent 1px)',
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
    zIndex: 0
  };

  if (shouldReduceMotion) {
    return (
      <div 
        style={{
          ...baseStyles,
          maskImage: 'radial-gradient(circle at 50% 50%, black 0%, transparent 60%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 0%, transparent 60%)',
        }}
      />
    );
  }

  return (
    <motion.div
      style={{
        ...baseStyles,
        maskImage,
        WebkitMaskImage: maskImage,
      }}
    />
  );
}
