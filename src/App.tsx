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
        <Route path="/research-1" element={<Research1 />} />
        <Route path="/research-2" element={<Research2 />} />
        <Route path="/research-3" element={<Research3 />} />
        <Route path="/research-4" element={<Research4 />} />
        <Route path="/research-5" element={<Research5 />} />
        <Route path="/research-main" element={<ResearchMain />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
