import './AeoSection.css';

export default function AeoSection() {
  return (
    <section className="sec" id="aeo-faq">
      <div className="wrap">
        <span className="eyebrow">Core Concepts</span>
        <h2 className="section-title">Undergraduate Research Explained</h2>
        
        <div className="aeo-direct-answer" style={{ background: 'var(--surface-2)', padding: '24px', borderRadius: '12px', marginBottom: '32px', border: '1px solid var(--border)' }}>
          <strong>Quick Answer:</strong> Getting an undergraduate research internship requires finding your area of interest, reading relevant papers, and sending structured cold emails to professors. A strong research profile helps students secure prestigious fellowships, publish academic papers, and build a foundation for advanced degrees or specialized careers across different countries and universities.
        </div>

        <div className="comparisons-grid">
          <div className="comp-card">
            <h3>Projects vs Published Work</h3>
            <p>Class projects demonstrate you can follow instructions to build a known solution. Published work proves you can identify a novel problem, execute original research, and have your findings peer-reviewed and accepted by the global academic community.</p>
          </div>
          <div className="comp-card">
            <h3>Guided vs Independent Research</h3>
            <p>Guided research involves working under a professor who provides the problem statement and resources. Independent research requires you to formulate the hypothesis, find open-source datasets, and drive the methodology yourself before seeking mentor feedback.</p>
          </div>
          <div className="comp-card">
            <h3>Research vs Corporate Internships</h3>
            <p>Corporate internships focus on software development, business operations, and learning industry tools. Research internships focus on reading academic literature, running experiments, and creating new knowledge that pushes the boundaries of a specific scientific field.</p>
          </div>
        </div>

        <div className="faq-section" style={{ marginTop: '48px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', color: 'var(--text)' }}>Frequently Asked Questions</h3>
          
          <div className="faq-item">
            <h4>What is the best time to start undergraduate research?</h4>
            <p>The best time to start is during your first or second year of undergraduate studies. Starting early gives you enough time to learn how to read papers, fail at initial experiments, and eventually publish before your senior year applications.</p>
          </div>

          <div className="faq-item">
            <h4>How do I find professors for research internships?</h4>
            <p>You find professors by reading recent papers in your field of interest, looking at the authors' affiliations, and checking their university faculty pages to see if they actively run a lab and accept undergraduate students.</p>
          </div>

          <div className="faq-item">
            <h4>Why do professors ignore cold emails?</h4>
            <p>Professors ignore cold emails when they are generic, show no understanding of the professor's specific work, or ask for a position without demonstrating any prior reading or relevant skills. A customized, brief email focused on their recent publications gets replies.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
