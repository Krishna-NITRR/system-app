import { useState, useRef, useEffect, useMemo, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import usePageMeta from '../hooks/usePageMeta';
import { processPaper } from '../utils/paperReader';
import type { PaperSentence, ReaderState, ReaderUIState } from '../types/paperReader';
import { getTermById } from '../data/terminology';
import './PaperReader.css';

export default function PaperReader() {
  usePageMeta({ title: 'Research Paper Reader', description: 'Make academic papers easier to understand while preserving scientific meaning.' });

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
  const [flashRef, setFlashRef] = useState<string | null>(null);
  const [qualityDismissed, setQualityDismissed] = useState(false);
  // Popover explaining a rewritten sentence: shown on hover, pinned on tap
  const [rewriteTip, setRewriteTip] = useState<{
    sentence: PaperSentence;
    left: number;
    top: number;
    above: boolean;
    pinned: boolean;
  } | null>(null);
  const tipCloseTimer = useRef<number | undefined>(undefined);
  // Leave a moment to move the pointer from the sentence onto the popover
  const scheduleTipClose = () => {
    window.clearTimeout(tipCloseTimer.current);
    tipCloseTimer.current = window.setTimeout(
      () => setRewriteTip(tip => (tip && !tip.pinned ? null : tip)),
      200
    );
  };
  const cancelTipClose = () => window.clearTimeout(tipCloseTimer.current);

  // Reference entries that in-text citations like [5] can jump to
  const refIds = useMemo(
    () =>
      new Set(
        state.phase === 'ready'
          ? state.paper.sections.flatMap(s => s.references?.map(r => r.id) ?? [])
          : []
      ),
    [state]
  );

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

  // Close a pinned rewrite popover on outside click; hide it on scroll
  useEffect(() => {
    if (!rewriteTip) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.rpr-rewrite-tip') && !target.closest('.rpr-sentence.is-transformed')) {
        setRewriteTip(null);
      }
    };
    const onScroll = () => setRewriteTip(null);
    const container = contentRef.current;
    document.addEventListener('click', onClick);
    container?.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('click', onClick);
      container?.removeEventListener('scroll', onScroll);
    };
  }, [rewriteTip]);

  const showRewrite = (sentence: PaperSentence, el: HTMLElement, pinned: boolean) => {
    // Anchor to the sentence's first line, above it unless near the top
    const rect = el.getClientRects()[0] ?? el.getBoundingClientRect();
    const width = Math.min(360, window.innerWidth - 24);
    const above = rect.top > 240;
    setRewriteTip({
      sentence,
      left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
      top: above ? rect.top - 8 : rect.bottom + 8,
      above,
      pinned,
    });
  };

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
    scrollToElement(id);
  };

  // Jump from an in-text citation to its reference entry and flash it
  const handleCite = (refId: string) => {
    scrollToElement(refId);
    setFlashRef(refId);
    window.setTimeout(() => setFlashRef(current => (current === refId ? null : current)), 1600);
  };

  const scrollToElement = (id: string) => {
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
      setQualityDismissed(false);
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
        <Footer />
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
        <Footer />
      </div>
    );
  }

  // ── Rendering Ready (Reader) ──
  const paper = state.paper;
  const readable = ui.viewMode === 'readable';
  const rewrittenCount = paper.stats.transformedSentences;

  const renderSentence = (sentence: PaperSentence) => {
    const textToShow = readable ? sentence.transformed : sentence.original;

    // Glossary terms (Clear Reading only), with citations linked in the text between them
    const elements: ReactNode[] = [];
    let lastIdx = 0;
    const anns = readable && ui.showAnnotations
      ? [...sentence.annotations].sort((a, b) => a.startOffset - b.startOffset)
      : [];
    anns.forEach((ann, idx) => {
      if (ann.startOffset > lastIdx) {
        elements.push(...withCitations(textToShow.substring(lastIdx, ann.startOffset), refIds, handleCite, `${sentence.id}-${idx}`));
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
      elements.push(...withCitations(textToShow.substring(lastIdx), refIds, handleCite, `${sentence.id}-last`));
    }

    if (!(readable && sentence.wasTransformed)) {
      return (
        <span key={sentence.id} className="rpr-sentence">
          {elements}{' '}
        </span>
      );
    }

    // Rewritten sentence: marked, and explained on hover / tap / focus
    const open = rewriteTip?.sentence.id === sentence.id;
    return (
      <span key={sentence.id}>
        <span
          className={`rpr-sentence is-transformed ${open ? 'is-open' : ''}`}
          role="button"
          tabIndex={0}
          aria-expanded={open}
          aria-label="Rewritten sentence. Show the original."
          onMouseEnter={e => {
            cancelTipClose();
            if (!rewriteTip?.pinned) showRewrite(sentence, e.currentTarget, false);
          }}
          onMouseLeave={scheduleTipClose}
          onFocus={e => showRewrite(sentence, e.currentTarget, false)}
          onBlur={() => setRewriteTip(tip => (tip && !tip.pinned ? null : tip))}
          onClick={e => {
            if ((e.target as HTMLElement).closest('.rpr-term, .rpr-cite')) return;
            if (rewriteTip?.pinned && open) setRewriteTip(null);
            else showRewrite(sentence, e.currentTarget, true);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              showRewrite(sentence, e.currentTarget, true);
            } else if (e.key === 'Escape') {
              setRewriteTip(null);
            }
          }}
        >
          {elements}
        </span>{' '}
      </span>
    );
  };
  
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
          {!paper.quality.ok && !qualityDismissed && (
            <div className="rpr-quality-banner" role="status" title={paper.quality.issues.join('; ')}>
              <p>
                This PDF's layout was hard to read. Some text may be out of order. Switch to Original view or try a different version of the paper.
              </p>
              <div className="rpr-quality-actions">
                {ui.viewMode === 'readable' && (
                  <button type="button" onClick={() => setUI(prev => ({ ...prev, viewMode: 'original' }))}>
                    Switch to Original
                  </button>
                )}
                <button type="button" aria-label="Dismiss" className="rpr-quality-dismiss" onClick={() => setQualityDismissed(true)}>
                  &times;
                </button>
              </div>
            </div>
          )}
          {readable && rewrittenCount > 0 && (
            <p className="rpr-rewrite-hint">
              <span className="rpr-rewrite-swatch" aria-hidden="true" />
              {rewrittenCount} {rewrittenCount === 1 ? 'sentence was' : 'sentences were'} rewritten for clarity. Hover or tap one to see the original.
            </p>
          )}
          {paper.sections.map(section => (
            <section key={section.id} id={section.id} className="rpr-section">
              <h2 className="rpr-section-title">{section.title}</h2>
              
              {section.paragraphs.map(p => (
                <p key={p.id} className={p.kind === 'caption' ? 'rpr-caption' : 'rpr-paragraph'}>
                  {p.sentences.map(renderSentence)}
                </p>
              ))}

              {section.references && (
                <ol className="rpr-references">
                  {section.references.map(ref => (
                    <li
                      key={ref.id}
                      id={ref.id}
                      className={`rpr-reference ${flashRef === ref.id ? 'is-target' : ''}`}
                    >
                      {ref.label && <span className="rpr-reference-label">{ref.label}</span>}
                      <span>{ref.text}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          ))}
        </div>

        {/* Portal: a transformed ancestor would offset position: fixed */}
        {rewriteTip && createPortal(
          <div
            className={`rpr-rewrite-tip ${rewriteTip.above ? 'is-above' : ''}`}
            role="tooltip"
            style={{ left: rewriteTip.left, top: rewriteTip.top }}
            onMouseEnter={cancelTipClose}
            onMouseLeave={scheduleTipClose}
          >
            <div className="rpr-rewrite-tip-head">
              <span>Rewritten{rewriteTip.sentence.transformationRule ? ` · ${rewriteTip.sentence.transformationRule.name}` : ''}</span>
              <button type="button" aria-label="Close" onClick={() => setRewriteTip(null)}>&times;</button>
            </div>
            {rewriteTip.sentence.transformationRule && (
              <p className="rpr-rewrite-tip-rule">{rewriteTip.sentence.transformationRule.description}</p>
            )}
            <div className="rpr-rewrite-tip-label">Original</div>
            <p className="rpr-rewrite-tip-original">{rewriteTip.sentence.original}</p>
          </div>,
          document.body
        )}

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

// In-text numeric citations: [5], [5, 6], [3]–[7], [12-14]
const CITATION = /\[(\d{1,4}(?:\s*[–—-]\s*\d{1,4})?(?:\s*,\s*\d{1,4}(?:\s*[–—-]\s*\d{1,4})?)*)\]/g;

/** Render text with each cited number linked to its reference entry */
function withCitations(
  text: string,
  refIds: Set<string>,
  onCite: (refId: string) => void,
  keyPrefix: string
): ReactNode[] {
  if (refIds.size === 0 || !text.includes('[')) return [text];

  const out: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(CITATION)) {
    const start = match.index ?? 0;
    if (start > last) out.push(text.slice(last, start));

    // Link every number inside the brackets that has a reference entry
    const inner = match[1];
    const parts: ReactNode[] = ['['];
    let pos = 0;
    for (const num of inner.matchAll(/\d+/g)) {
      const i = num.index ?? 0;
      if (i > pos) parts.push(inner.slice(pos, i));
      const refId = `ref-${num[0]}`;
      parts.push(
        refIds.has(refId) ? (
          <a
            key={`${keyPrefix}-c${start}-${i}`}
            href={`#${refId}`}
            className="rpr-cite"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onCite(refId);
            }}
          >
            {num[0]}
          </a>
        ) : (
          num[0]
        )
      );
      pos = i + num[0].length;
    }
    parts.push(inner.slice(pos), ']');
    out.push(...parts);
    last = start + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
