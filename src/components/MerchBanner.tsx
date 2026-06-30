import { useState, useEffect } from 'react';
import './MerchBanner.css';

export default function MerchBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the banner in a previous session
    const dismissed = localStorage.getItem('km-merch-dismissed');
    if (!dismissed) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('km-merch-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="merch-banner" role="alert" aria-live="polite">
      <button className="merch-close" onClick={handleClose} aria-label="Close banner">
        &times;
      </button>
      <div className="merch-content">
        <span className="merch-tag">New</span>
        <strong>Official Merch Store is Live!</strong>
        <p>Support the project and get exclusive, high-quality gear designed for researchers and engineers.</p>
        <a 
          href="https://merch.krishnamahawar.in" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-primary merch-btn"
          onClick={handleClose} // Optional: close it if they click to go to the store
        >
          Shop Now &rarr;
        </a>
      </div>
    </div>
  );
}
