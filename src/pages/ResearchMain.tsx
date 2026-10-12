import { useState } from 'react';
import './ResearchMain.css';
import usePageMeta from '../hooks/usePageMeta';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function ResearchMain() {
  const [copied, setCopied] = useState(false);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{ orderId: string; paymentId: string } | null>(null);
  const [showManualUpi, setShowManualUpi] = useState(false);

  usePageMeta({
    title: 'Placement Prep System: Finance, IT, Core & Research Tracks',
    description: '4 career track roadmaps for NIT/IIT students. Finance, IT, Core, Research - each mapped with exact steps. ₹149 one-time. Built by an NIT Raipur student.',
    canonical: 'https://www.krishnamahawar.in/career-roadmaps',
  });

  const priceLabel = currency === 'INR' ? '₹149' : '$2';

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Could not load payment gateway. Please check your internet connection.');
      }

      // 1. Create order
      const orderRes = await fetch('/api/roadmaps/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          currency
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to initialize order');
      }

      // 2. Open Razorpay modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Krishna Mahawar',
        description: 'Placement Prep System (4 Tracks + Bonuses)',
        order_id: orderData.orderId,
        prefill: {
          name,
          email,
          contact: phone
        },
        theme: {
          color: '#6C4CF1'
        },
        handler: async function (response: any) {
          try {
            setLoading(true);
            const verifyRes = await fetch('/api/roadmaps/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customerName: name,
                customerEmail: email
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setPaid(true);
              setPaymentDetails({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id
              });
              // Smooth scroll to access box
              document.getElementById('payment')?.scrollIntoView({ behavior: 'smooth' });
            } else {
              setError(verifyData.error || 'Payment verification failed. Please contact admin@krishnamahawar.in');
            }
          } catch (vErr: any) {
            setError(vErr.message || 'Payment verification failed. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setError(resp.error?.description || 'Payment was unsuccessful');
        setLoading(false);
      });
      rzp.open();

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong while initiating payment');
      setLoading(false);
    }
  };

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
        <div className="nav-badge">{"\u20B9"}149 (≈ $2)</div>
      </nav>

      <section id="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">Placement Prep System</div>
          <h1>One system.<br />Four tracks.<br /><em>Zero guesswork.</em></h1>
          <p className="hero-sub">Finance. IT. Core. Research. Each track mapped end to end. No scattered resources. No figuring out what comes next. Just a clear path from where you are to where you need to be.</p>
          <div className="price-block">
            <span className="price">{"\u20B9"}149 (≈ $2)</span>
            <span className="price-sub">one-time {"\u00B7"} instant access {"\u00B7"} all future updates included</span>
          </div>
          <button className="btn-cta" onClick={scrollToPayment}>
            Get Instant Access {"\u2192"}
          </button>
          <div className="hero-note">Instant online activation via UPI, Cards, Netbanking. Access unlocked immediately.</div>
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
            <div className="trust-num">{"\u20B9"}149 (≈ $2)</div>
            <div className="trust-label">One-time</div>
            <div className="trust-desc">All future updates included at no extra cost.</div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      <section className="sec" id="payment">
        <div className="payment-card">
          
          {/* PAID SUCCESS UNLOCK STATE */}
          {paid ? (
            <div className="rm-success-box">
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉</div>
              <h3 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '8px' }}>Payment Confirmed!</h3>
              <p style={{ color: 'var(--tm)', fontSize: '0.95rem', marginBottom: '16px' }}>
                Your Placement Prep System &amp; Roadmaps are unlocked. Access has been registered for <strong>{email}</strong>.
              </p>
              
              {paymentDetails && (
                <div style={{ fontSize: '0.8rem', color: 'var(--tl)', marginBottom: '20px', fontFamily: 'monospace' }}>
                  Payment ID: {paymentDetails.paymentId}
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--div)', paddingTop: '20px', marginTop: '16px' }}>
                <h4 style={{ fontSize: '1.1rem', color: '#a085ff', marginBottom: '12px' }}>Your Immediate Download &amp; Resource Hub:</h4>
                <div className="rm-resource-grid">
                  <a href="https://drive.google.com/drive/folders/1JSCq_yyxIbg-_QiptAuyXZUG7gWgOorU" target="_blank" rel="noopener noreferrer" className="rm-resource-link">
                    <span>📁 Complete Placement &amp; Fellowships Drive</span>
                    <span>&rarr;</span>
                  </a>
                  <a href="https://drive.google.com/file/d/1pSv0XyF52i9JKEld64MpdUmUQWoyGAKI/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="rm-resource-link">
                    <span>📄 Cold Email Framework &amp; Templates</span>
                    <span>&rarr;</span>
                  </a>
                  <a href="/resources/fellowships" className="rm-resource-link">
                    <span>🌟 50+ Global Fellowships Interactive List</span>
                    <span>&rarr;</span>
                  </a>
                  <a href="/resources/professor-database" className="rm-resource-link">
                    <span>🔍 Curated Professors Outreach Database</span>
                    <span>&rarr;</span>
                  </a>
                </div>
              </div>

              <div style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--tm)' }}>
                Need help or have questions? Contact Krishna directly at <a href="mailto:admin@krishnamahawar.in" style={{ color: '#a085ff', textDecoration: 'underline' }}>admin@krishnamahawar.in</a>.
              </div>
            </div>
          ) : (
            <>
              <div className="payment-heading">Get Instant Access</div>
              <div className="payment-sub">
                Pay online securely via Razorpay (UPI, Google Pay, PhonePe, Paytm, Cards, Netbanking). Instant access unlocked immediately.
              </div>

              {/* RAZORPAY FORM */}
              <div className="rm-checkout-box">
                <div className="rm-curr-row">
                  <button 
                    type="button" 
                    className={`rm-curr-btn ${currency === 'INR' ? 'active' : ''}`}
                    onClick={() => setCurrency('INR')}
                  >
                    ₹149 INR
                  </button>
                  <button 
                    type="button" 
                    className={`rm-curr-btn ${currency === 'USD' ? 'active' : ''}`}
                    onClick={() => setCurrency('USD')}
                  >
                    $2 USD (International)
                  </button>
                </div>

                {error && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleRazorpayPayment}>
                  <div className="rm-form-field">
                    <label className="rm-label">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      className="rm-input" 
                      placeholder="e.g. Krishna Mahawar" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="rm-form-field">
                    <label className="rm-label">Email Address (where your access is delivered) *</label>
                    <input 
                      type="email" 
                      required 
                      className="rm-input" 
                      placeholder="e.g. student@college.edu" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="rm-form-field">
                    <label className="rm-label">Phone / WhatsApp (optional, for instant SMS link)</label>
                    <input 
                      type="tel" 
                      className="rm-input" 
                      placeholder="e.g. 9876543210" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="rm-pay-btn"
                    disabled={loading}
                  >
                    {loading ? 'Opening Razorpay Gateway...' : `Pay ${priceLabel} & Get Instant Access →`}
                  </button>

                  <div className="rm-trust-badge">
                    <span>🔒 256-Bit SSL Encrypted Razorpay Checkout · UPI, Cards, Netbanking</span>
                  </div>
                </form>
              </div>

              {/* ALTERNATIVE MANUAL UPI ACCORDION */}
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button 
                  type="button" 
                  className="rm-toggle-manual"
                  onClick={() => setShowManualUpi(!showManualUpi)}
                >
                  {showManualUpi ? '▲ Hide Direct UPI QR Option' : '▼ Prefer Direct UPI QR / Manual Google Form? Click here'}
                </button>
              </div>

              {showManualUpi && (
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--div)', paddingTop: '20px' }}>
                  <div className="steps">
                    <div className="step">
                      <div className="step-num">1</div>
                      <div>
                        <div className="step-title">Pay {"\u20B9"}149 (≈ $2) via QR</div>
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
                    <img className="qr-img" src="/qr.jpeg" alt="UPI QR - Krishna Mahawar" />
                    <div className="qr-right">
                      <div className="upi-label">UPI ID</div>
                      <div className="upi-row">
                        <span className="upi-text" id="upiIdText">krishnazindahai@okhdfcbank</span>
                        <button className={`btn-copy ${copied ? "copied" : ""}`} onClick={copyUPI}>{copied ? "Copied!" : "Copy"}</button>
                      </div>
                      <button className="btn-upi" onClick={openUPI}>
                        Pay {"\u20B9"}149 (≈ $2) {"\u2192"}
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
              )}
            </>
          )}

        </div>
      </section>

      <footer>
        <div className="footer-brand">Krishna Mahawar<span>.</span></div>
        <div className="footer-copy">
          <a href="/paper-reader" style={{ color: 'inherit', textDecoration: 'underline', marginRight: '15px' }}>Try the Research Paper Reader</a>
          &copy; 2026 {"\u00B7"} krishnamahawar.in {"\u00B7"} NIT Raipur
        </div>
      </footer>

    </div>
  );
}
