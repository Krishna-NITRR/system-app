import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import usePageMeta from '../hooks/usePageMeta';
import { processPaper } from '../utils/paperReader';
import type { ReaderState, ReaderUIState, TermEntry } from '../types/paperReader';
import { getTermById } from '../data/terminology';
import './PaperReader.css';

export default function PaperReader() {
  usePageMeta('Research Paper Reader', 'Make academic papers easier to understand while preserving scientific meaning.');

  const [state, setState] = useState<ReaderState>({ phase: 'landing' });
  const [ui, setUI] = useState<ReaderUIState>({
    viewMode: 'readable',
    showAnnotations: true,
    activeSection: null,
    activeTerm: null,
  });
  
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle term click
  const handleTermClick = (termId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUI(prev => ({ ...prev, activeTerm: termId }));
  };

  // Close term panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ui.activeTerm) {
        // If they didn't click inside a term panel or on a term span, close it
        const target = e.target as HTMLElement;
        if (!target.closest('.rpr-term-panel') && !target.closest('.rpr-term')) {
          setUI(prev => ({ ...prev, activeTerm: null }));
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [ui.activeTerm]);

  // Handle section scroll highlighting
  useEffect(() => {
    if (state.phase !== 'ready' || !contentRef.current) return;
    
    const handleScroll = () => {
      const sections = contentRef.current?.querySelectorAll('.rpr-section');
      if (!sections) return;
      
      let currentSection = ui.activeSection;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          currentSection = section.id;
          break;
        }
      }
      
      if (currentSection !== ui.activeSection) {
        setUI(prev => ({ ...prev, activeSection: currentSection }));
      }
    };

    const container = contentRef.current;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [state.phase, ui.activeSection]);

  const scrollToSection = (id: string) => {
    setUI(prev => ({ ...prev, activeSection: id }));
    const element = document.getElementById(id);
    if (element && contentRef.current) {
      // Calculate position relative to container
      const containerRect = contentRef.current.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollTop = elementRect.top - containerRect.top + contentRef.current.scrollTop - 40;
      
      contentRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setState({ phase: 'error', message: 'File exceeds the 20MB limit.' });
      return;
    }
    
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx');
    
    if (!isPDF && !isDocx) {
      setState({ phase: 'error', message: 'Please upload a PDF or DOCX file.' });
      return;
    }

    setState({ phase: 'uploading', progress: 0 });

    try {
      const result = await processPaper(file, (step, progress) => {
        setState({ phase: 'processing', step, progress });
      });

      setState({ phase: 'ready', paper: result });
      if (result.sections.length > 0) {
        setUI(prev => ({ ...prev, activeSection: result.sections[0].id }));
      }
    } catch (error: any) {
      console.error("Processing error:", error);
      setState({ phase: 'error', message: error.message || 'An error occurred while processing the document.' });
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const renderActiveTerm = () => {
    if (!ui.activeTerm) return null;
    const term = getTermById(ui.activeTerm);
    if (!term) return null;

    return (
      <div className="rpr-panel-content">
        <div className="rpr-panel-header">
          <div>
            <h3 className="rpr-panel-title">{term.term}</h3>
            <span className="rpr-panel-domain">{term.domain} {term.subdomain ? `• ${term.subdomain}` : ''}</span>
          </div>
          <button className="rpr-panel-close" onClick={() => setUI(prev => ({...prev, activeTerm: null}))}>&times;</button>
        </div>
        
        <div className="rpr-panel-section">
          <h4>Clear Definition</h4>
          <p>{term.simple_definition}</p>
        </div>

        <div className="rpr-panel-section">
          <h4>Technical Definition</h4>
          <p>{term.technical_definition}</p>
        </div>

        {term.context_example && (
          <div className="rpr-panel-section">
            <h4>Example</h4>
            <p style={{ fontStyle: 'italic', color: 'var(--tm)' }}>"{term.context_example}"</p>
          </div>
        )}

        {term.related_terms && term.related_terms.length > 0 && (
          <div className="rpr-panel-section">
            <h4>Related Terms</h4>
            <div>
              {term.related_terms.map(rt => (
                <span key={rt} className="rpr-related-tag">{rt}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Rendering Landing ──
  if (state.phase === 'landing' || state.phase === 'error') {
    return (
      <div className="rpr-page">
        <Navbar />
        <main style={{ flex: 1 }}>
          <section className="rpr-hero">
            <h1>Research Paper Reader</h1>
            <p>Read academic papers with clear language and in-line terminology explanations. 100% private, processed locally on your device.</p>
          </section>

          <section className="rpr-upload-section">
            {state.phase === 'error' ? (
              <div className="rpr-error">
                <h3>Processing Failed</h3>
                <p>{state.message}</p>
                <button className="rpr-error-btn" onClick={() => setState({ phase: 'landing' })}>
                  Try Another File
                </button>
              </div>
            ) : (
              <>
                <div 
                  className={`rpr-upload-container ${isDragOver ? 'is-dragover' : ''}`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="rpr-upload-icon">📄</div>
                  <div className="rpr-upload-text">Drop your paper here or click to browse</div>
                  <div className="rpr-upload-subtext">Supports PDF and DOCX up to 20MB</div>
                  <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    Select File
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="rpr-file-input"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </div>
                <div className="rpr-trust-notice">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  Privacy first: processed entirely in your browser. Nothing is uploaded.
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    );
  }

  // ── Rendering Processing ──
  if (state.phase === 'uploading' || state.phase === 'processing') {
    const stepLabel = state.phase === 'uploading' 
      ? 'Loading file...' 
      : state.step === 'extracting' ? 'Extracting text...'
      : state.step === 'parsing' ? 'Analyzing structure...'
      : state.step === 'transforming' ? 'Applying readability rules...'
      : 'Matching terminology...';
      
    const progress = state.phase === 'processing' ? state.progress : 0;

    return (
      <div className="rpr-page">
        <Navbar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="rpr-processing">
            <div className="rpr-spinner"></div>
            <h3>{stepLabel}</h3>
            <div className="rpr-progress-bar">
              <div className="rpr-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--tl)' }}>{progress}% Complete</p>
          </div>
        </main>
      </div>
    );
  }

  // ── Rendering Ready (Reader) ──
  const paper = state.paper;
  
  return (
    <div className="rpr-reader-wrapper">
      {/* We keep the standard Navbar above the reader as requested */}
      <Navbar />
      
      {/* Reader specific topbar */}
      <header className="rpr-topbar">
        <div className="rpr-metadata">
          <h2 className="rpr-paper-title" title={paper.metadata.title}>{paper.metadata.title}</h2>
          <p className="rpr-paper-authors" title={paper.metadata.authors.join(', ')}>
            {paper.metadata.authors.slice(0, 3).join(', ')}{paper.metadata.authors.length > 3 ? ' et al.' : ''} 
            {paper.metadata.year ? ` (${paper.metadata.year})` : ''}
          </p>
        </div>
        
        <div className="rpr-controls">
          <div className="rpr-toggle-group">
            <button 
              className={`rpr-toggle-btn ${ui.viewMode === 'original' ? 'active' : ''}`}
              onClick={() => setUI(prev => ({ ...prev, viewMode: 'original' }))}
            >
              Original
            </button>
            <button 
              className={`rpr-toggle-btn ${ui.viewMode === 'readable' ? 'active' : ''}`}
              onClick={() => setUI(prev => ({ ...prev, viewMode: 'readable' }))}
            >
              Clear Reading
            </button>
          </div>
          
          <button 
            className="rpr-close-btn"
            onClick={() => {
              if (window.confirm("Close this paper? You will need to upload it again to read it.")) {
                setState({ phase: 'landing' });
              }
            }}
          >
            Close
          </button>
        </div>
      </header>

      <div className="rpr-main">
        {/* Sidebar Nav */}
        <aside className="rpr-sidebar">
          {paper.sections.map(sec => (
            <button
              key={sec.id}
              className={`rpr-nav-item rpr-nav-level-${sec.level > 3 ? 3 : sec.level} ${ui.activeSection === sec.id ? 'active' : ''}`}
              onClick={() => scrollToSection(sec.id)}
              title={sec.title}
            >
              {sec.title}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="rpr-content" ref={contentRef}>
          {paper.sections.map(section => (
            <section key={section.id} id={section.id} className="rpr-section">
              <h2 className="rpr-section-title">{section.title}</h2>
              
              {section.paragraphs.map(p => (
                <p key={p.id} className="rpr-paragraph">
                  {p.sentences.map(sentence => {
                    const textToShow = ui.viewMode === 'readable' ? sentence.transformed : sentence.original;
                    
                    // If no annotations or in original mode, just show text
                    if (!ui.showAnnotations || sentence.annotations.length === 0 || ui.viewMode === 'original') {
                      return (
                        <span 
                          key={sentence.id} 
                          className={`rpr-sentence ${ui.viewMode === 'readable' && sentence.wasTransformed ? 'is-transformed' : ''}`}
                          title={sentence.wasTransformed && ui.viewMode === 'readable' ? `Original: ${sentence.original}` : undefined}
                        >
                          {textToShow}{' '}
                        </span>
                      );
                    }

                    // Render text with inline annotations
                    const elements: React.ReactNode[] = [];
                    let lastIdx = 0;
                    
                    // Sort annotations by startOffset to render sequentially
                    const sortedAnns = [...sentence.annotations].sort((a, b) => a.startOffset - b.startOffset);
                    
                    sortedAnns.forEach((ann, idx) => {
                      if (ann.startOffset > lastIdx) {
                        elements.push(<span key={`text-${idx}`}>{textToShow.substring(lastIdx, ann.startOffset)}</span>);
                      }
                      
                      elements.push(
                        <span 
                          key={`term-${idx}`} 
                          className={`rpr-term ${ui.activeTerm === ann.termId ? 'active' : ''}`}
                          onClick={(e) => handleTermClick(ann.termId, e)}
                        >
                          {ann.surfaceForm}
                        </span>
                      );
                      lastIdx = ann.endOffset;
                    });
                    
                    if (lastIdx < textToShow.length) {
                      elements.push(<span key="text-last">{textToShow.substring(lastIdx)}</span>);
                    }

                    return (
                      <span 
                        key={sentence.id} 
                        className={`rpr-sentence ${sentence.wasTransformed ? 'is-transformed' : ''}`}
                        title={sentence.wasTransformed ? `Original: ${sentence.original}` : undefined}
                      >
                        {elements}{' '}
                      </span>
                    );
                  })}
                </p>
              ))}
            </section>
          ))}
        </div>

        {/* Terminology Panel */}
        <aside className={`rpr-term-panel ${ui.activeTerm ? 'visible' : 'hidden'}`}>
          {ui.activeTerm ? (
            renderActiveTerm()
          ) : (
            <div className="rpr-empty-panel">
              <p>Click on highlighted terms in the text to see their definitions.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
