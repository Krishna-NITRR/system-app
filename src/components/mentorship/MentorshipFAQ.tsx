import { useState } from 'react';
import { mentorshipConfig } from '../../config/mentorship';

export default function MentorshipFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="sec" id="faq">
      <div className="wrap fade vis">
        <div className="eyebrow" style={{ textAlign: 'center', marginBottom: '16px' }}>FAQ</div>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Common Questions</h2>

        <div className="product-faq" style={{ maxWidth: '700px', margin: '0 auto' }}>
          {mentorshipConfig.faq.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className={`faq-item ${isOpen ? 'open' : ''}`} style={{ 
                borderBottom: '1px solid var(--div)',
                padding: '20px 0'
              }}>
                <button 
                  className="faq-q" 
                  onClick={() => toggle(i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text)',
                    fontSize: '1.05rem',
                    fontWeight: 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <span>{item.question}</span>
                  <span style={{ 
                    transform: isOpen ? 'rotate(45deg)' : 'none',
                    transition: 'transform 0.2s',
                    color: 'var(--tl)'
                  }}>+</span>
                </button>
                <div 
                  className="faq-a" 
                  style={{ 
                    maxHeight: isOpen ? '500px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease-in-out',
                  }}
                >
                  <p style={{ 
                    color: 'var(--tm)', 
                    fontSize: '0.95rem', 
                    margin: '16px 0 0 0',
                    lineHeight: 1.6
                  }}>
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
