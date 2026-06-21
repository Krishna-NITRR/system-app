import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Check initial theme from localStorage or document
    const currentTheme = localStorage.getItem('km-theme') || 'light';
    setTheme(currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);

    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('km-theme', nextTheme);
  };

  const closeMobile = () => setIsOpen(false);

  return (
    <>
      <nav id="nav" role="navigation" aria-label="Main navigation" className={scrolled ? 'scrolled' : ''}>
        <a href="/" className="nav-logo">Krishna Mahawar<span>.</span></a>
        <ul className="nav-links" role="list">
          <li><a href="/#book">The Book</a></li>
          <li><a href="/#playbooks">Research Systems</a></li>
          <li><a href="/research-tools-and-resources">Tools</a></li>
          <li><a href="/#author">About</a></li>
          <li><a href="/#contact">Contact</a></li>
        </ul>
        <div className="nav-right">
          <button className="toggle" id="themeToggle" aria-label="Toggle dark mode" onClick={toggleTheme}>
            <div className="toggle-icons"><span>&#9728;</span><span>&#9790;</span></div>
          </button>
          <a href="#signup" className="btn btn-primary nav-cta">Join Waitlist</a>
          <button 
            className="burger" 
            id="burger" 
            aria-label="Open menu" 
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <nav className={`mobile-menu ${isOpen ? 'open' : ''}`} id="mobileMenu" aria-label="Mobile navigation">
        <a href="/#book" onClick={closeMobile}>The Book</a>
        <a href="/#playbooks" onClick={closeMobile}>Research Systems</a>
        <a href="/research-tools-and-resources" onClick={closeMobile}>Tools</a>
        <a href="/#author" onClick={closeMobile}>About</a>
        <a href="/#contact" onClick={closeMobile}>Contact</a>
        <a href="/#signup" onClick={closeMobile} style={{ color: '#6C4CF1', fontWeight: 700 }}>Join Waitlist</a>
      </nav>

      <div className="ann-bar">
        <div className="ann-bar-inner">
          <p>The book will launch soon. Fill the waitlist form below.</p>
          <a href="#signup">Join Waitlist &rarr;</a>
        </div>
      </div>
    </>
  );
}
