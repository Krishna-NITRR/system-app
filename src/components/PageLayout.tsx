import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import useFadeObserver from '../hooks/useFadeObserver';

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  useFadeObserver();

  return (
    <>
      <Navbar />
      <main id="main-content">
        {children}
      </main>
      <Footer />
    </>
  );
}
