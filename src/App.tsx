import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MerchBanner from './components/MerchBanner';

const Home = lazy(() => import('./pages/Home'));

const ResearchMain = lazy(() => import('./pages/ResearchMain'));
const ResearchTools = lazy(() => import('./pages/ResearchTools'));
const ReferenceChecker = lazy(() => import('./pages/ReferenceChecker'));
const BetaReader = lazy(() => import('./pages/BetaReader'));

const ResourceLandingPage = lazy(() => import('./pages/ResourceLandingPage'));
const ResourceDeliveryPage = lazy(() => import('./pages/ResourceDeliveryPage'));
const BookPage = lazy(() => import('./pages/BookPage'));
const WaitlistSuccessPage = lazy(() => import('./pages/WaitlistSuccessPage'));

function App() {
  return (
    <BrowserRouter>
      <MerchBanner />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* New config-driven resource flow */}
          <Route path="/resources/:slug" element={<ResourceLandingPage />} />
          <Route path="/resources/:slug/get" element={<ResourceDeliveryPage />} />
          
          {/* Contextual product page */}
          <Route path="/book" element={<BookPage />} />
          <Route path="/waitlist-success" element={<WaitlistSuccessPage />} />

          {/* Backward compatibility: existing resource URLs redirect */}
          <Route path="/fellowships" element={<Navigate to="/resources/fellowships" replace />} />
          <Route path="/professor-database" element={<Navigate to="/resources/professor-database" replace />} />
          <Route path="/cold-email-templates" element={<Navigate to="/resources/cold-email-templates" replace />} />
          <Route path="/internship-guide" element={<Navigate to="/resources/internship-guide" replace />} />
          <Route path="/project-ideas" element={<Navigate to="/resources/project-ideas" replace />} />

          {/* Existing other pages */}
          <Route path="/career-roadmaps" element={<ResearchMain />} />
          <Route path="/research-tools-and-resources" element={<ResearchTools />} />
          <Route path="/reference-checker" element={<ReferenceChecker />} />
          <Route path="/beta-reader" element={<BetaReader />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
