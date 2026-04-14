"use client";

import React, { createContext, useContext, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  // Global search from the header (navigates to products page)
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  const handleGlobalSearch = (query) => {
    setGlobalSearchQuery(query);
    // Redirect to products page if not already there
    if (pathname !== '/products' && query.trim() !== '') {
      router.push('/products');
    }
  };

  return (
    <SearchContext.Provider value={{ 
      globalSearchQuery, 
      setGlobalSearchQuery: handleGlobalSearch,
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
