import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TiltCard from '../components/TiltCard';
import usePageMeta from '../hooks/usePageMeta';

const RESOURCES = [
  {
    tag: "Resource 01",
    title: "Fellowships & Programs List",
    desc: "50+ programs worldwide. Deadlines, stipends, and what they actually look for.",
    link: "/fellowships",
    category: "Internships",
    featured: true,
  },
  {
    tag: "Resource 02",
    title: "Professor Outreach Database",
    desc: "A list of professors at prestigious labs like IITs and IISc who actively take interns.",
    link: "/professor-database",
    category: "Templates",
    featured: true,
  },
  {
    tag: "Resource 03",
    title: "Cold Email Templates That Get Replies",
    desc: "Based on 130+ real emails. Three templates that worked, plus a checklist before you hit send.",
    link: "/cold-email-templates",
    category: "Templates",
    featured: false,
  },
  {
    tag: "Resource 04",
    title: "Internship & Research Guide",
    desc: "Step-by-step notes on landing internships and learning how to research from year one.",
    link: "/internship-guide",
    category: "Guides",
    featured: false,
  },
  {
    tag: "Resource 05",
    title: "Project Ideas for Research Internships",
    desc: "Good starting ideas across core and non-core engineering. Ready to use.",
    link: "/project-ideas",
    category: "Internships",
    featured: false,
  },
  {
    tag: "Resource 06",
    title: "Career Roadmaps",
    desc: "Preparation steps for Core Engineering, Tech, and Research paths.",
    link: "/career-roadmaps",
    category: "Career",
    featured: false,
  },
  {
    tag: "Tool 01",
    title: "Reference Consistency Checker",
    desc: "Upload your research paper and identify missing citations, duplicate references, and bibliography inconsistencies.",
    link: "/reference-checker",
    category: "Tools",
    featured: true,
  }
];

const CATEGORIES = ["All", "Internships", "Templates", "Guides", "Career", "Tools"];

export default function ResearchTools() {
  usePageMeta({
    title: 'Research Tools & Resources - Krishna Mahawar',
    description: 'Find premium research tools, internship guides, email templates, and professor databases to accelerate your academic career.',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Fade-in on scroll effect
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('vis');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.07 });
    
    document.querySelectorAll('.fade').forEach((el) => io.observe(el));
    
    return () => io.disconnect();
  }, []);

  const filteredResources = useMemo(() => {
    return RESOURCES.filter(res => {
      const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            res.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || res.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const featuredResources = RESOURCES.filter(res => res.featured);

  return (
    <>
      <Navbar />
      
      {/* Header Section */}
      <section className="sec pt-32 pb-16 bg">
        <div className="wrap narrow text-center fade">
          <h1 className="section-title">Research Tools &amp; Resources</h1>
          <p className="section-sub mx-auto max-w-2xl">
            A curated collection of guides, databases, and templates designed to help students find research opportunities faster and build a strong career foundation.
          </p>
          
          {/* Search Bar */}
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search internships, emails, IIT, research..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      {searchQuery === '' && activeCategory === 'All' && (
        <section className="sec py-8 bg2">
          <div className="wrap fade">
            <h2 className="text-xl font-semibold mb-6">Featured Resources</h2>
            <div className="playbooks-grid featured-grid">
              {featuredResources.map((pb, i) => (
                <Link to={pb.link} key={i} style={{ textDecoration: 'none' }}>
                  <TiltCard className="playbook-card featured-card">
                    <div className="playbook-tag">{pb.tag}</div>
                    <div className="playbook-title text-2xl">{pb.title}</div>
                    <p className="playbook-desc text-lg">{pb.desc}</p>
                    <span className="playbook-link font-medium">Get the Guide &rarr;</span>
                  </TiltCard>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main List Section */}
      <section className="sec py-12 bg">
        <div className="wrap">
          
          {/* Category Filters */}
          <div className="category-filters fade mb-10 flex flex-wrap gap-3">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filtered Grid */}
          <div className="playbooks-grid fade">
            {filteredResources.length > 0 ? (
              filteredResources.map((pb, i) => (
                <Link to={pb.link} key={i} style={{ textDecoration: 'none' }}>
                  <TiltCard className="playbook-card">
                    <div className="playbook-tag">{pb.tag}</div>
                    <div className="playbook-title">{pb.title}</div>
                    <p className="playbook-desc">{pb.desc}</p>
                    <span className="playbook-link">Get the Guide &rarr;</span>
                  </TiltCard>
                </Link>
              ))
            ) : (
              <div className="no-results py-12 text-center col-span-full">
                <p className="text-lg opacity-60">No resources found matching your search criteria.</p>
                <button className="mt-4 filter-btn active" onClick={() => {setSearchQuery(''); setActiveCategory('All');}}>Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
