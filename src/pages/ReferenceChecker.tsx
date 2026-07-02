import { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import usePageMeta from '../hooks/usePageMeta';
import { extractTextFromFile } from '../utils/documentParser';
import { analyzeManuscript } from '../utils/citationAnalyzer';
import type { AnalysisResult } from '../utils/citationAnalyzer';
import './ReferenceChecker.css';

export default function ReferenceChecker() {
    usePageMeta({
        title: 'Free Citation Checker | Reference Consistency Checker',
        description: 'Free research paper citation checker. Instantly find missing citations, duplicate references, and bibliography errors in IEEE and APA formats.',
    });

    const [uploadState, setUploadState] = useState<'default' | 'uploading' | 'analyzing' | 'success' | 'error'>('default');
    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const [showSample, setShowSample] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sampleRef = useRef<HTMLElement>(null);

    const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = (files: FileList) => {
        const file = files[0];
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
            setErrorMessage('Invalid file type. Please upload a PDF or DOCX file.');
            setUploadState('error');
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            setErrorMessage('File exceeds 20MB limit.');
            setUploadState('error');
            return;
        }

        simulateUploadAndAnalysis(file);
    };

    const simulateUploadAndAnalysis = async (file: File) => {
        setUploadState('uploading');
        setProgress(0);
        
        let currProgress = 0;
        const uploadInterval = setInterval(() => {
            currProgress += 10;
            if (currProgress <= 90) setProgress(currProgress);
        }, 100);

        try {
            const text = await extractTextFromFile(file);
            const result = analyzeManuscript(text);
            
            clearInterval(uploadInterval);
            setProgress(100);
            setAnalysisResult(result);
            
            setTimeout(() => {
                if (result.error) {
                    setErrorMessage(result.error);
                    setUploadState('error');
                } else {
                    setUploadState('success');
                    handleViewSample();
                }
            }, 500);

        } catch (error: any) {
            clearInterval(uploadInterval);
            setErrorMessage(error.message || "Failed to process the document.");
            setUploadState('error');
        }
    };

    const handleViewSample = () => {
        setShowSample(true);
        setTimeout(() => {
            sampleRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <div className="rc-page">
            <Navbar />
            
            <main role="main" className="pt-24 pb-12">
                <section className="rc-hero-section rc-container">
                    <div className="rc-hero">
                        <div className="rc-hero-content">
                            <h1 className="rc-hero-title">Free Citation Checker</h1>
                            <p className="rc-hero-desc">
                                Find missing citations and duplicate references before reviewers do. Upload your research paper to our Reference Consistency Checker to instantly verify your bibliography against your text citations.
                            </p>
                            <div className="rc-hero-actions">
                                <button className="rc-btn rc-btn-primary rc-btn-large" onClick={() => fileInputRef.current?.click()}>
                                    Check My Paper
                                </button>
                                <button className="rc-btn rc-btn-secondary rc-btn-large" onClick={handleViewSample}>
                                    See Sample Report
                                </button>
                            </div>
                        </div>
                        <div className="rc-hero-image" aria-hidden="true">
                            <div className="rc-dashboard-mockup">
                                <div className="rc-dashboard-header">
                                    <span className="rc-dashboard-title">Citation Checker Report</span>
                                    <span className="rc-status-dot"></span>
                                </div>
                                <div className="rc-dashboard-body">
                                    <div className="rc-mockup-item rc-error">
                                        <span className="rc-icon">×</span>
                                        <div className="rc-mockup-text">
                                            <strong>Missing Citations Detected</strong>
                                            <span>Reference [14] in bibliography is not cited in text</span>
                                        </div>
                                    </div>
                                    <div className="rc-mockup-item rc-warning">
                                        <span className="rc-icon">!</span>
                                        <div className="rc-mockup-text">
                                            <strong>Duplicate References Found</strong>
                                            <span>Smith et al. (2020) appears twice in bibliography</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Upload Section */}
                <section id="upload" className="rc-upload-section rc-bg-light">
                    <div className="rc-container">
                        <h2 className="rc-sr-only">Upload Manuscript</h2>
                        <div 
                            className={`rc-upload-container ${isDragOver ? 'dragover' : ''}`}
                            onDragEnter={handleDragEnter}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            role="region" 
                            aria-live="polite"
                        >
                            {uploadState === 'default' && (
                                <div className="rc-upload-state">
                                    <div className="rc-upload-icon" aria-hidden="true">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="17 8 12 3 7 8"></polyline>
                                            <line x1="12" y1="3" x2="12" y2="15"></line>
                                        </svg>
                                    </div>
                                    <h3>Drop your manuscript here or browse your files.</h3>
                                    <p>Maximum file size: 20 MB<br/>Supported formats: DOCX, PDF</p>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                        accept=".pdf,.docx" 
                                        aria-label="Choose manuscript file" 
                                        style={{ display: 'none' }} 
                                    />
                                    <button className="rc-btn rc-btn-secondary mt-4" onClick={() => fileInputRef.current?.click()}>Browse Files</button>
                                </div>
                            )}

                            {uploadState === 'uploading' && (
                                <div className="rc-upload-state">
                                    <div className="rc-spinner" aria-hidden="true"></div>
                                    <h3>Uploading document...</h3>
                                    <div className="rc-progress-bar-container" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                                        <div className="rc-progress-bar" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            )}

                            {uploadState === 'analyzing' && (
                                <div className="rc-upload-state">
                                    <div className="rc-spinner" aria-hidden="true"></div>
                                    <h3>Analyzing citations and bibliography...</h3>
                                    <p>This usually takes a few seconds.</p>
                                </div>
                            )}

                            {uploadState === 'success' && (
                                <div className="rc-upload-state">
                                    <div className="rc-success-icon" aria-hidden="true">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                    </div>
                                    <h3>Analysis complete.</h3>
                                    <p>We found inconsistencies in your manuscript.</p>
                                    <button className="rc-btn rc-btn-primary mt-4" onClick={handleViewSample}>View Full Report</button>
                                </div>
                            )}

                            {uploadState === 'error' && (
                                <div className="rc-upload-state">
                                    <div className="rc-error-icon" aria-hidden="true">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="15" y1="9" x2="9" y2="15"></line>
                                            <line x1="9" y1="9" x2="15" y2="15"></line>
                                        </svg>
                                    </div>
                                    <h3>Analysis failed.</h3>
                                    <p>{errorMessage}</p>
                                    <button className="rc-btn rc-btn-secondary mt-4" onClick={() => setUploadState('default')}>Try Again</button>
                                </div>
                            )}
                        </div>
                        
                        <div className="rc-trust-signals">
                            <p className="rc-trust-text">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> 
                                <strong>Privacy first:</strong> Uploaded files are processed securely in memory and deleted immediately after analysis. We do not permanently store your intellectual property.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Sample Report Section */}
                {(showSample || uploadState === 'success') && (
                    <section id="sample-report" ref={sampleRef} className="rc-sample-report-section rc-container">
                        <h2 className="rc-section-title">{analysisResult ? 'Analysis Dashboard' : 'Sample Analysis Dashboard'}</h2>
                        <div className="rc-dashboard-mockup rc-full-dashboard">
                            <div className="rc-dashboard-header">
                                <div className="rc-dashboard-title">Document Quality Overview</div>
                                <div className="rc-dashboard-actions">
                                    {analysisResult && (
                                        <span className={`rc-confidence rc-${analysisResult.confidence.toLowerCase()}`} style={{ marginRight: '16px', fontSize: '0.875rem', fontWeight: 600 }}>
                                            Confidence: {analysisResult.confidence}
                                        </span>
                                    )}
                                    <button className="rc-btn rc-btn-secondary rc-btn-sm" onClick={() => window.print()}>Export PDF</button>
                                </div>
                            </div>
                            <div className="rc-dashboard-body rc-grid">
                                <div className="rc-score-card">
                                    <div className="rc-score-label">Integrity Score</div>
                                    <div className="rc-score-value">{analysisResult ? analysisResult.score : 92} <span className="rc-score-total">/ 100</span></div>
                                    <div className="rc-score-status">{
                                        analysisResult 
                                        ? (analysisResult.score > 90 ? 'Excellent' : analysisResult.score > 70 ? 'Good, but needs fixes' : 'Needs major revision') 
                                        : 'Good, but needs minor fixes.'
                                    }</div>
                                </div>
                                <div className="rc-issues-list">
                                    <h4>Issues Found</h4>
                                    <ul className="rc-clean-list">
                                        {!analysisResult && (
                                            <>
                                                <li><span className="rc-icon rc-warning">!</span> 2 duplicate references detected</li>
                                                <li><span className="rc-icon rc-warning">!</span> 1 missing citation in text</li>
                                                <li><span className="rc-icon rc-error">×</span> 3 references in bibliography not cited</li>
                                                <li><span className="rc-icon rc-error">×</span> Citation numbering mismatch at Reference 18</li>
                                            </>
                                        )}
                                        {analysisResult && analysisResult.score === 100 && (
                                            <li><span className="rc-icon rc-success">✓</span> No citation issues found!</li>
                                        )}
                                        {analysisResult && analysisResult.duplicates.map((dup, i) => (
                                            <li key={`dup-${i}`}><span className="rc-icon rc-warning">!</span> Duplicate reference: {dup}</li>
                                        ))}
                                        {analysisResult && analysisResult.missingInText.map((msg, i) => (
                                            <li key={`mit-${i}`}><span className="rc-icon rc-warning">!</span> {msg}</li>
                                        ))}
                                        {analysisResult && analysisResult.missingInBibliography.map((msg, i) => (
                                            <li key={`mib-${i}`}><span className="rc-icon rc-error">×</span> {msg}</li>
                                        ))}
                                        {analysisResult && analysisResult.numberingErrors.map((msg, i) => (
                                            <li key={`num-${i}`}><span className="rc-icon rc-error">×</span> {msg}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p className="rc-disclaimer" style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.875rem', color: 'var(--text-muted, #6b7280)' }}>
                            Supports IEEE, APA and common author-year citation formats. Other styles may be partially recognized.
                        </p>
                    </section>
                )}

                {/* What the tool checks */}
                <section className="rc-features-section rc-bg-light">
                    <div className="rc-container rc-text-center">
                        <h2 className="rc-section-title">What the Bibliography Checker Analyzes</h2>
                        <div className="rc-grid rc-checks-grid">
                            <div className="rc-card">
                                <div className="rc-card-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                </div>
                                <h4>Missing Citations</h4>
                                <p>Detects references listed in your bibliography that were never actually cited in your manuscript text.</p>
                            </div>
                            <div className="rc-card">
                                <div className="rc-card-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                </div>
                                <h4>Duplicate References</h4>
                                <p>Identifies identical or highly similar reference entries that have been accidentally repeated in the bibliography.</p>
                            </div>
                            <div className="rc-card">
                                <div className="rc-card-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                </div>
                                <h4>Formatting Formats</h4>
                                <p>Acts as an IEEE Citation Checker and APA Citation Checker by cross-referencing inline tags with the bibliography list.</p>
                            </div>
                            <div className="rc-card">
                                <div className="rc-card-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg></div>
                                <h4>Numbering errors</h4>
                                <p>Checks citation numbering sequence specifically for IEEE style.</p>
                            </div>
                            <div className="rc-card">
                                <div className="rc-card-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg></div>
                                <h4>Ordering issues</h4>
                                <p>Verifies alphabetical order for APA and Harvard formatting styles.</p>
                            </div>
                            <div className="rc-card">
                                <div className="rc-card-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></div>
                                <h4>Basic formatting</h4>
                                <p>Identifies inconsistent citation styling and structural mistakes.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="rc-how-it-works-section rc-bg-light">
                    <div className="rc-container">
                        <h2 className="rc-section-title">How It Works</h2>
                        <div className="rc-steps-container">
                            <div className="rc-step">
                                <div className="rc-step-number" aria-hidden="true">1</div>
                                <p>Upload your manuscript.</p>
                            </div>
                            <div className="rc-step-arrow" aria-hidden="true">→</div>
                            <div className="rc-step">
                                <div className="rc-step-number" aria-hidden="true">2</div>
                                <p>The system scans citations and bibliography.</p>
                            </div>
                            <div className="rc-step-arrow" aria-hidden="true">→</div>
                            <div className="rc-step">
                                <div className="rc-step-number" aria-hidden="true">3</div>
                                <p>Formatting and consistency checks run.</p>
                            </div>
                            <div className="rc-step-arrow" aria-hidden="true">→</div>
                            <div className="rc-step">
                                <div className="rc-step-number" aria-hidden="true">4</div>
                                <p>Review and download your report.</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* FAQ */}
                <section id="faq" className="rc-faq-section rc-container">
                    <h2 className="rc-section-title">Frequently Asked Questions</h2>
                    <div className="rc-faq-container">
                        <div className="rc-faq-item">
                            <h3 className="rc-faq-question">What formats does this Research Paper Citation Checker support?</h3>
                            <div className="rc-faq-answer">
                                <p>Our Reference Checker currently accepts standard DOCX files and text-searchable PDFs. Scanned image-based PDFs are not supported.</p>
                            </div>
                        </div>
                        <div className="rc-faq-item">
                            <h3 className="rc-faq-question">Is it safe to upload my unpublished manuscript?</h3>
                            <div className="rc-faq-answer">
                                <p>Yes. The Reference Consistency Checker processes files entirely securely in memory. We do not permanently store your intellectual property.</p>
                            </div>
                        </div>
                        <div className="rc-faq-item">
                            <h3 className="rc-faq-question">Does it work as an IEEE Citation Checker or APA Citation Checker?</h3>
                            <div className="rc-faq-answer">
                                <p>Yes! It uses a hybrid parsing approach to cross-reference common numeric (IEEE) and author-year (APA) formats.</p>
                            </div>
                        </div>
                        <div className="rc-faq-item">
                            <h4 className="rc-faq-question">Why do citation mistakes cause journal revisions?</h4>
                            <div className="rc-faq-answer">
                                <p>Journal editors and peer reviewers rely on accurate bibliographies to verify your claims and assess your research depth. Citation mistakes signal a lack of attention to detail and disrupt the reading experience. Many prestigious journals use automated screening tools during the initial desk review phase. If these tools detect significant missing citations or formatting errors, editors will return the manuscript for revision before even sending it to peer reviewers, significantly delaying your publication timeline.</p>
                            </div>
                        </div>
                        <div className="rc-faq-item">
                            <h4 className="rc-faq-question">How can I check references before submission?</h4>
                            <div className="rc-faq-answer">
                                <p>To check references before submission, upload your complete manuscript (in DOCX or PDF format) to our automated tool. The system will scan both your text and bibliography simultaneously. It highlights discrepancies such as missing citations, duplicate entries, and numbering errors in a clear report. You can review these issues and make the necessary corrections in your original document. This ensures your final submission meets strict journal formatting guidelines without hours of manual checking.</p>
                            </div>
                        </div>
                        <div className="rc-faq-item">
                            <h4 className="rc-faq-question">Can this detect duplicate references?</h4>
                            <div className="rc-faq-answer">
                                <p>Yes. The tool actively scans your entire bibliography to identify identical or highly similar reference entries. It analyzes author names, publication years, titles, and journal details to spot duplicates, even if they are formatted slightly differently. When duplicates are found, the system flags them in your final report so you can consolidate your bibliography and fix any corresponding in-text citations.</p>
                            </div>
                        </div>
                        <div className="rc-faq-item">
                            <h4 className="rc-faq-question">Can this detect missing citations?</h4>
                            <div className="rc-faq-answer">
                                <p>Yes. The consistency checker performs a two-way analysis between your text and your bibliography. It flags instances where a source is cited in the body of your paper but missing from the reference list. Similarly, it identifies references that are listed in your bibliography but never actually cited in the text. Resolving these missing citations ensures your paper maintains academic integrity and complies with strict journal requirements.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="rc-cta-section rc-bg-light">
                    <div className="rc-container rc-text-center">
                        <h2 className="rc-section-title">Before You Submit Your Paper</h2>
                        <div className="rc-checklist-container">
                            <ul className="rc-checklist">
                                <li><span className="rc-icon rc-success">✓</span> Citation numbering verified</li>
                                <li><span className="rc-icon rc-success">✓</span> Missing references checked</li>
                                <li><span className="rc-icon rc-success">✓</span> Duplicate references removed</li>
                                <li><span className="rc-icon rc-success">✓</span> Bibliography reviewed</li>
                                <li><span className="rc-icon rc-success">✓</span> Journal formatting verified</li>
                            </ul>
                        </div>
                        <div>
                            <a href="#upload" className="rc-btn rc-btn-primary rc-btn-large">Upload Manuscript Now</a>
                        </div>
                    </div>
                </section>
            </main>
            
            <Footer />
        </div>
    );
}
