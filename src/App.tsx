import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Research1 from './pages/Research1';
import Research2 from './pages/Research2';
import Research3 from './pages/Research3';
import Research4 from './pages/Research4';
import Research5 from './pages/Research5';
import ResearchMain from './pages/ResearchMain';
import ResearchTools from './pages/ResearchTools';
import ReferenceChecker from './pages/ReferenceChecker';
import MerchBanner from './components/MerchBanner';

function App() {
  return (
    <BrowserRouter>
      <MerchBanner />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
