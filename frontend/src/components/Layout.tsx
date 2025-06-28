import React from 'react';
import { useDarkMode } from '../contexts/AuthContext';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function Layout({ title, children }: LayoutProps) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <section className={`flex flex-col min-h-screen transition-colors duration-300 relative overflow-hidden ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-900'
    }`}>
      {/* Modern Background Pattern for Light Mode */}
      {!isDarkMode && (
        <>
          {/* Subtle geometric pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl"></div>
          </div>
          <div className="absolute top-1/4 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-300 to-cyan-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-tr from-purple-300 to-pink-300 rounded-full blur-3xl"></div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </>
      )}

      {/* Header */}
      <header className={`h-16 flex items-center justify-between px-4 sm:px-6 md:px-8 transition-colors duration-300 relative z-10 ${
        isDarkMode 
          ? 'bg-gray-800/35 backdrop-blur-md border-b border-gray-700/20' 
          : 'bg-white/60 backdrop-blur-md border-b border-white/40 shadow-sm'
      }`}>
        <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold px-4 text-center ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>{title}</h1>
        
        {/* Dark Mode Toggle Button */}
        <Button
          onClick={toggleDarkMode}
          variant="ghost"
          size="sm"
          className={`rounded-full p-2 transition-colors duration-300 ${
            isDarkMode 
              ? 'text-yellow-400 hover:bg-gray-700/50' 
              : 'text-gray-600 hover:bg-white/50'
          }`}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center w-full relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className={`h-12 flex items-center justify-center transition-colors duration-300 px-4 text-center text-sm relative z-10 ${
        isDarkMode 
          ? 'bg-gray-800/35 backdrop-blur-md border-t border-gray-700/20 text-gray-300' 
          : 'bg-white/60 backdrop-blur-md border-t border-white/40 text-gray-700'
      }`}>
        &copy; {new Date().getFullYear()} AyuSahayak. All rights reserved.
      </footer>
    </section>
  );
} 