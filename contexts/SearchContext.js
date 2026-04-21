"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  // Global search shared across the app without forcing navigation.
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [marketplaceSearchQuery, setMarketplaceSearchQuery] = useState('');

  const handleGlobalSearch = useCallback((query) => {
    setGlobalSearchQuery(query);
  }, []);

  const handleMarketplaceSearch = useCallback((query) => {
    setMarketplaceSearchQuery(query);
  }, []);

  const clearGlobalSearch = useCallback(() => {
    setGlobalSearchQuery('');
  }, []);

  const clearMarketplaceSearch = useCallback(() => {
    setMarketplaceSearchQuery('');
  }, []);

  const clearAllSearch = useCallback(() => {
    setGlobalSearchQuery('');
    setMarketplaceSearchQuery('');
  }, []);

  const value = useMemo(() => ({
    globalSearchQuery, 
    setGlobalSearchQuery: handleGlobalSearch,
    marketplaceSearchQuery,
    setMarketplaceSearchQuery: handleMarketplaceSearch,
    clearGlobalSearch,
    clearMarketplaceSearch,
    clearAllSearch,
  }), [
    globalSearchQuery, 
    marketplaceSearchQuery, 
    handleGlobalSearch, 
    handleMarketplaceSearch, 
    clearGlobalSearch, 
    clearMarketplaceSearch, 
    clearAllSearch
  ]);

  return (
    <SearchContext.Provider value={value}>
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
