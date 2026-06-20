import { useState } from 'react';
import './ResearchMain.css';
import usePageMeta from '../hooks/usePageMeta';

export default function ResearchMain() {
  const [copied, setCopied] = useState(false);

  usePageMeta({
    title: 'Placement Prep System: Finance, IT, Core & Research Tracks',
    description: '4 career track roadmaps for NIT/IIT students. Finance, IT, Core, Research - each mapped with exact steps. ₹149 one-time. Built by an NIT Raipur student.',
    canonical: 'https://www.krishnamahawar.in/career-roadmaps',
  });

  const openUPI = () => {
    window.location.href = 'upi://pay?pa=krishnazindahai@okhdfcbank&pn=KrishnaMahawar&am=149&cu=INR';
    setTimeout(() => {
      const ok = window.confirm('UPI app not opening?\n\nCopy the UPI ID:\nkrishnazindahai@okhdfcbank\n\nClick OK to copy.');
      if (ok) { navigator.clipboard && navigator.clipboard.writeText('krishnazindahai@okhdfcbank'); }
    }, 1500);
  };

  const copyUPI = () => {
    const upi = 'krishnazindahai@okhdfcbank';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upi).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const scrollToPayment = () => {
    document.getElementById('payment')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="rm-page">
      


<nav>
  <div className="nav-brand">Krishna Mahawar<span>.</span></div>
  <div className="nav-badge">{"\u20B9"}149 one-time</div>
</nav>


<section id="hero">
  <div className="hero-inner">
    <div className="hero-eyebrow">Placement Prep System</div>
    <h1>One system.<br />Four tracks.<br /><em>Zero guesswork.</em></h1>
    <p className="hero-sub">Finance. IT. Core. Research. Each track mapped end to end. No scattered resources. No figuring out what comes next. Just a clear path from where you are to where you need to be.</p>
    <div className="price-block">
      <span className="price">{"\u20B9"}149</span>
      <span className="price-sub">one-time {"\u00B7"} instant access {"\u00B7"} all future updates included</span>
    </div>
    <button className="btn-cta" onClick={scrollToPayment}>
      Get Placement Map  {"\u2192"}
    </button>
    <div className="hero-note">9 students have already paid. Access delivered within 2 hours.</div>
  </div>
</section>


<div className="proof-bar">
  <div className="proof-bar-inner">
    <div className="proof-item gold">IIT Madras Summer Research Fellow</div>
    <div className="proof-item">IIT BHU Intern</div>
    <div className="proof-item">International Conference First Author</div>
    <div className="proof-item">9.06 CGPA, NIT Raipur</div>
  </div>
</div>


<section className="sec" id="get">
  <div className="wrap">
    <div className="sec-eyebrow">What's Inside</div>
    <h2 className="sec-title">Everything. Structured.</h2>
    <p className="sec-sub">Six resources in one place. Built for students who are serious about placements and have stopped tolerating vague advice.</p>
    <div className="get-list">
      <div className="get-item">
        <div className="get-num">01</div>
        <div>
          <div className="get-title">Finance + Consulting Roadmap</div>
          <div className="get-desc">What to study. In what order. What gets you shortlisted and what wastes your time. Built around what actually appears in Finance and Consulting interviews at top firms recruiting from NITs and IITs.</div>
        </div>
      </div>
      <div className="get-item">
        <div className="get-num">02</div>
        <div>
          <div className="get-title">IT / CS Roadmap</div>
          <div className="get-desc">DSA, system design, internship sequencing, and the preparation order that works. Not a list of topics. A sequence with reasoning behind each step.</div>
        </div>
      </div>
      <div className="get-item">
        <div className="get-num">03</div>
        <div>
          <div className="get-title">Core Engineering Roadmap</div>
          <div className="get-desc">Focused on what core companies actually test. Cuts out what has not appeared in placements in years. Updated based on recent placement cycles.</div>
        </div>
      </div>
      <div className="get-item">
        <div className="get-num">04</div>
        <div>
          <div className="get-title">Research Track Roadmap</div>
          <div className="get-desc">For students targeting research internships, fellowships, and academic careers. A system for building a credible research profile from year one.</div>
        </div>
      </div>
      <div className="get-item">
        <div className="get-num">05</div>
        <div>
          <div className="get-title">All Previously Shared Resources</div>
          <div className="get-desc">Fellowship lists. Cold email frameworks. Professor databases. Project ideas. Everything organised and placed in the right context, not just dumped in a folder.</div>
        </div>
      </div>
      <div className="get-item">
        <div className="get-num">06</div>
        <div>
          <div className="get-title">2 Exclusive Resources <span className="get-tag">Surprise</span></div>
          <div className="get-desc">Two additional resources not shared publicly anywhere. You will find out when you get access.</div>
        </div>
      </div>
    </div>
    <div className="tagline">Not another list. A structured system with a reason behind every step.</div>
  </div>
</section>

<div className="divider"></div>


<section id="trust">
  <div className="trust-grid">
    <div className="trust-item">
      <div className="trust-num">4</div>
      <div className="trust-label">Career tracks</div>
      <div className="trust-desc">Finance, IT, Core, Research. Each mapped separately.</div>
    </div>
    <div className="trust-item">
      <div className="trust-num">50+</div>
      <div className="trust-label">Fellowships listed</div>
      <div className="trust-desc">With deadlines, stipends, and direct apply links.</div>
    </div>
    <div className="trust-item">
      <div className="trust-num">{"\u20B9"}149</div>
      <div className="trust-label">One-time</div>
      <div className="trust-desc">All future updates included at no extra cost.</div>
    </div>
  </div>
</section>

<div className="divider"></div>


<section className="sec" id="payment">
  <div className="payment-card">
    <div className="payment-heading">Complete Your Payment</div>
    <div className="payment-sub">3 steps {"\u00B7"} under 2 minutes</div>
    <div className="steps">
      <div className="step">
        <div className="step-num">1</div>
        <div>
          <div className="step-title">Pay {"\u20B9"}149 via UPI</div>
          <div className="step-desc">Scan the QR below or copy the UPI ID. Use any UPI app.</div>
        </div>
      </div>
      <div className="step">
        <div className="step-num">2</div>
        <div>
          <div className="step-title">Take a screenshot</div>
          <div className="step-desc">Screenshot the payment success screen showing the transaction ID.</div>
        </div>
      </div>
      <div className="step">
        <div className="step-num">3</div>
        <div>
          <div className="step-title">Submit proof below</div>
          <div className="step-desc">Fill the short form and upload your screenshot. Access within 1 to 2 hours.</div>
        </div>
      </div>
    </div>
    <div className="pay-divider"></div>
    <div className="qr-block">
      <img className="qr-img" src="/qr.jpeg" alt="UPI QR - Krishna Mahawar"/>
      <div className="qr-right">
        <div className="upi-label">UPI ID</div>
        <div className="upi-row">
          <span className="upi-text" id="upiIdText">krishnazindahai@okhdfcbank</span>
          <button className={`btn-copy ${copied ? "copied" : ""}`} onClick={copyUPI}>{copied ? "Copied!" : "Copy"}</button>
        </div>
        <button className="btn-upi" onClick={openUPI}>
          Pay {"\u20B9"}149 via UPI App  {"\u2192"}
        </button>
        <div className="upi-note">Opens your UPI app directly {"\u00B7"} mobile</div>
      </div>
    </div>
    <div className="submit-block">
      <div className="submit-title">Done paying? Submit your proof.</div>
      <div className="submit-desc">Open the form below. Upload your payment screenshot and enter your email. Access will be shared on the same email.</div>
      <a href="https://docs.google.com/forms/d/e/1FAIpQLSd8AGqi9K2SrvQ5PyFf1YKd0QQdTWR9jyh1F-l8eZ2g3fxg7A/viewform" target="_blank" rel="noopener noreferrer" className="btn-submit">
        Submit Payment Proof  {"\u2192"}
      </a>
      <div className="submit-note">Access shared within 1 to 2 hours after verification</div>
    </div>
  </div>
</section>


<footer>
  <div className="footer-brand">Krishna Mahawar<span>.</span></div>
  <div className="footer-copy">&copy; 2026 {"\u00B7"} krishnamahawar.in {"\u00B7"} NIT Raipur</div>
</footer>


    </div>
  );
}
