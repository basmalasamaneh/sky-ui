"use client";

import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  // Global search shared across the app without forcing navigation.
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const handleGlobalSearch = (query) => {
    setGlobalSearchQuery(query);
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
