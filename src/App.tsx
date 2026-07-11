import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MerchBanner from './components/MerchBanner';

// Lazy-load all non-homepage routes to reduce initial bundle size
const Research1 = lazy(() => import('./pages/Research1'));
const Research2 = lazy(() => import('./pages/Research2'));
const Research3 = lazy(() => import('./pages/Research3'));
const Research4 = lazy(() => import('./pages/Research4'));
const Research5 = lazy(() => import('./pages/Research5'));
const ResearchMain = lazy(() => import('./pages/ResearchMain'));
const ResearchTools = lazy(() => import('./pages/ResearchTools'));
const ReferenceChecker = lazy(() => import('./pages/ReferenceChecker'));
const BetaReader = lazy(() => import('./pages/BetaReader'));

function App() {
  return (
    <BrowserRouter>
      <MerchBanner />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fellowships" element={<Research1 />} />
          <Route path="/professor-database" element={<Research2 />} />
          <Route path="/cold-email-templates" element={<Research3 />} />
          <Route path="/internship-guide" element={<Research4 />} />
          <Route path="/project-ideas" element={<Research5 />} />
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
