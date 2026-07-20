import { useEffect } from 'react';

export default function useFadeObserver() {
  useEffect(() => {
    let staggerIndex = 0;
    let staggerTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const io = new IntersectionObserver((entries) => {
      let isAnyIntersecting = false;
      
      entries.forEach((e) => {
        if (e.isIntersecting) {
          isAnyIntersecting = true;
          (e.target as HTMLElement).style.transitionDelay = `${staggerIndex * 100}ms`;
          e.target.classList.add('vis');
          
          staggerIndex++;
          io.unobserve(e.target);
        }
      });
      
      if (isAnyIntersecting) {
        if (staggerTimeout) clearTimeout(staggerTimeout);
        staggerTimeout = setTimeout(() => {
          staggerIndex = 0;
        }, 100);
      }
    }, { threshold: 0.07 });
    
    // Delay slightly to allow DOM to render new elements
    const timer = setTimeout(() => {
      document.querySelectorAll('.fade').forEach((el) => io.observe(el));
    }, 50);
    
    return () => {
      clearTimeout(timer);
      io.disconnect();
      if (staggerTimeout) clearTimeout(staggerTimeout);
    };
  }, []);
}
