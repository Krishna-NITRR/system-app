import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Research1 from './pages/Research1';
import Research2 from './pages/Research2';
import Research3 from './pages/Research3';
import Research4 from './pages/Research4';
import Research5 from './pages/Research5';
import ResearchMain from './pages/ResearchMain';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fellowships" element={<Research1 />} />
        <Route path="/professor-database" element={<Research2 />} />
        <Route path="/cold-email-templates" element={<Research3 />} />
        <Route path="/internship-guide" element={<Research4 />} />
        <Route path="/project-ideas" element={<Research5 />} />
        <Route path="/career-roadmaps" element={<ResearchMain />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
