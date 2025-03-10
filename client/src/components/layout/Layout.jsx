// src/components/layout/Layout.jsx
import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check for user preference
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar mobile overlay */}
      <div 
        className={`fixed inset-0 z-20 transition-opacity bg-black/50 backdrop-blur-sm lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} isDarkMode={isDarkMode} />
      
      {/* Content area */}
      <div className="flex flex-col min-h-screen lg:pl-64 transition-all duration-300">
        <Navbar 
          toggleSidebar={toggleSidebar} 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme} 
        />
        
        <main className="flex-1 p-4 md:p-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        
        <footer className="py-4 px-6 text-center text-sm bg-gray-800 dark:bg-gray-900 text-gray-400 border-t border-gray-700 dark:border-gray-800">
          <p>© {new Date().getFullYear()} Studio Assistant Pro - Tutti i diritti riservati</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;