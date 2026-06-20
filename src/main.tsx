import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { theme } from './shared/theme';

// Inject shared theme tokens via a <style> block so [data-theme="dark"] can still override them
const style = document.createElement('style');
style.innerHTML = `
  :root {
    --purple: ${theme.colors.purple};
    --purple-dark: ${theme.colors['purple-dark']};
    --purple-light: ${theme.colors['purple-light']};
    --orange: ${theme.colors.orange};
    --bg: ${theme.colors.bg};
    --bg2: ${theme.colors.bg2};
    --bg3: ${theme.colors.bg3};
    --text: ${theme.colors.text};
    --tm: ${theme.colors.tm};
    --tl: ${theme.colors.tl};
    --div: ${theme.colors.div};
    --nav-bg: ${theme.colors['nav-bg']};
    --radius: ${theme.radii.radius};
    --radius-lg: ${theme.radii['radius-lg']};
  }
`;
document.head.insertBefore(style, document.head.firstChild);

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
