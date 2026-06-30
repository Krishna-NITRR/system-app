import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer role="contentinfo">
      <div className="footer-inner wrap">
        <div>
          <div className="footer-logo">Krishna Mahawar<span>.</span></div>
          <div className="footer-tagline">Research systems for students who want to start earlier than most.</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--tm)', marginTop: '8px' }}>Built by an IIT Madras Summer Research Fellow from NIT Raipur</div>
          <a href="mailto:admin@krishnamahawar.in" className="footer-email">admin@krishnamahawar.in</a>
        </div>
        <div className="footer-col">
          <h5>Navigate</h5>
          <ul>
            <li><a href="/#book">The Book</a></li>
            <li><a href="/#playbooks">Research Systems</a></li>
            <li><a href="/#signup">Early Access</a></li>
            <li><a href="https://merch.krishnamahawar.in">Merch Store</a></li>
            <li><a href="/#author">About</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Resources</h5>
          <ul>
            <li><Link to="/career-roadmaps">Career Roadmaps</Link></li>
            <li><a href="https://www.krishnamahawar.in/research-tools-and-resources" target="_blank" rel="noopener noreferrer">Explore all free and premium resources</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Connect</h5>
          <ul>
            <li><a href="https://www.linkedin.com/in/krishna-mahawar/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
            <li><a href="mailto:admin@krishnamahawar.in">Email</a></li>
            <li><a href="#contact">Send a Message</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom wrap">
        <div className="footer-copy">&copy; 2026 Krishna Mahawar &middot; National Institute of Technology, Raipur</div>
        <div className="footer-copy">Research Systems for Students</div>
        <div className="footer-copy" style={{ opacity: 0.5 }}>By Krishna Mahawar</div>
      </div>
    </footer>
  );
}
