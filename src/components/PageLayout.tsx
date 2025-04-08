'use client';

import React from 'react';
import Header from './Header';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Brainrot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 