"use client";

import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  // Global search shared across the app without forcing navigation.
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [marketplaceSearchQuery, setMarketplaceSearchQuery] = useState('');

  const handleGlobalSearch = (query) => {
    setGlobalSearchQuery(query);
  };

  const handleMarketplaceSearch = (query) => {
    setMarketplaceSearchQuery(query);
  };

  const clearGlobalSearch = () => {
    setGlobalSearchQuery('');
  };

  const clearMarketplaceSearch = () => {
    setMarketplaceSearchQuery('');
  };

  const clearAllSearch = () => {
    setGlobalSearchQuery('');
    setMarketplaceSearchQuery('');
  };

  return (
    <SearchContext.Provider value={{ 
      globalSearchQuery, 
      setGlobalSearchQuery: handleGlobalSearch,
      marketplaceSearchQuery,
      setMarketplaceSearchQuery: handleMarketplaceSearch,
      clearGlobalSearch,
      clearMarketplaceSearch,
      clearAllSearch,
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
