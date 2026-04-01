import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useUIStore } from '../../store';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, showSidebar = true }) => {
  return (
    <div className="h-screen flex flex-col bg-surface select-none">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {showSidebar && <Sidebar />}
        <main className="flex-1 flex overflow-hidden">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
