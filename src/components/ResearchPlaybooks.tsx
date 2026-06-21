import { Link } from 'react-router-dom';
import TiltCard from './TiltCard';

export default function ResearchPlaybooks() {
  const playbooks = [
    {
      tag: "Resource 01",
      title: "Fellowships & Programs List",
      desc: "50+ programs worldwide. Deadlines, stipends, and what they actually look for.",
      link: "/fellowships"
    },
    {
      tag: "Resource 02",
      title: "Professor Outreach Database",
      desc: "A list of professors at prestigious labs like IITs and IISc who actively take interns.",
      link: "/professor-database"
    },
    {
      tag: "Resource 03",
      title: "Cold Email Templates That Get Replies",
      desc: "Based on 130+ real emails. Three templates that worked, plus a checklist before you hit send.",
      link: "/cold-email-templates"
    },
    {
      tag: "Resource 04",
      title: "Internship & Research Guide",
      desc: "Step-by-step notes on landing internships and learning how to research from year one.",
      link: "/internship-guide"
    },
    {
      tag: "Resource 05",
      title: "Project Ideas for Research Internships",
      desc: "Good starting ideas across core and non-core engineering. Ready to use.",
      link: "/project-ideas"
    },
    {
      tag: "Resource 06",
      title: "Career Roadmaps",
      desc: "Preparation steps for Core Engineering, Tech, and Research paths.",
      link: "/career-roadmaps"
    }
  ];

  return (
    <section className="sec bg2" id="playbooks" aria-labelledby="playbooks-heading">
      <div className="wrap">
        <h2 className="section-title" id="playbooks-heading">Research Guides &amp; Notes</h2>
        <p className="section-sub">Straightforward notes on how to get into research and find internships. Real examples from my own applications.</p>
        
        <div className="playbooks-grid fade">
          {playbooks.map((pb, i) => (
            <Link to={pb.link} key={i} style={{ textDecoration: 'none' }}>
              <TiltCard className="playbook-card">
                <div className="playbook-tag">{pb.tag}</div>
                <div className="playbook-title">{pb.title}</div>
                <p className="playbook-desc">{pb.desc}</p>
                <span className="playbook-link">Get the Guide &rarr;</span>
              </TiltCard>
            </Link>
          ))}
          
          <Link to="/research-tools-and-resources" style={{ textDecoration: 'none' }}>
            <TiltCard className="playbook-card explore-more-card">
              <div className="playbook-tag" style={{ color: 'var(--purple)' }}>More Resources</div>
              <div className="playbook-title">Explore All Tools &amp; Guides</div>
              <p className="playbook-desc">Browse our full library of research tools, email templates, and internship guides with advanced filtering.</p>
              <span className="playbook-link" style={{ fontWeight: 600 }}>Explore more &rarr;</span>
            </TiltCard>
          </Link>
        </div>
      </div>
    </section>
  );
}
