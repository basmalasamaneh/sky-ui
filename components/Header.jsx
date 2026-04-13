"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { BecomeArtistModal } from './BecomeArtistModal';

export const Header = () => {
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isBecomeArtistModalOpen, setIsBecomeArtistModalOpen] = useState(false);
  
  const isArtist = user?.role === 'artist';
  const userFirstName = user?.firstName || user?.first_name || 'مستخدم';
  const displayName = isArtist ? (user?.artistName || user?.artist_name || userFirstName) : userFirstName;
  const userInitial = displayName?.charAt(0).toUpperCase() || 'م';

  return (
    <>
      <header id="main-header" className="fixed top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm" dir="ltr">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative w-12 h-12 transition-transform group-hover:scale-110 duration-300">
                <Image 
                  src="/images/logo.png" 
                  alt="Logo Athar" 
                  fill 
                  className="object-contain"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-5xl font-bold font-ornamental text-[#1a0f0a]">أثر</span>
                <span className="text-gray-300 text-2xl font-light">|</span>
                <span className="text-xl font-bold tracking-widest text-[#2c1e15] font-kufi uppercase">Athar</span>
              </div>
            </Link>

            {/* Nav Pill / Search Bar Hub */}
            <div className="flex-1 max-w-xl mx-8 relative flex justify-center">
              <AnimatePresence mode="wait">
                {!isSearchVisible ? (
                  <motion.nav 
                    key="nav"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="hidden lg:flex items-center gap-10 bg-[#fafafa]/80 px-12 py-3 rounded-full border border-gray-100/50 shadow-inner" 
                    dir="rtl"
                  >
                    <Link href="/" className="text-[16px] font-bold text-gray-700 hover:text-[#5c4436] transition-all hover:scale-105 duration-300 font-art">الرئيسية</Link>
                    <Link href="/products" className="text-[16px] font-bold text-gray-700 hover:text-[#5c4436] transition-all hover:scale-105 duration-300 font-art">المنتجات</Link>
                    <Link href="/about" className="text-[16px] font-bold text-gray-700 hover:text-[#5c4436] transition-all hover:scale-105 duration-300 font-art">عن أثر</Link>
                  </motion.nav>
                ) : (
                  <motion.div 
                    key="search"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="flex items-center w-full px-4"
                  >
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="ابحث عن أثر فني..." 
                      className="w-full bg-[#f2f0eb] border border-[#d2cfc7] rounded-full py-2.5 px-8 text-sm md:text-base text-[#4a3728] focus:outline-none focus:ring-4 focus:ring-[#5c4436]/10 font-art shadow-inner transition-all placeholder:text-gray-400"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 text-gray-400">
                <button 
                  onClick={() => setIsSearchVisible(!isSearchVisible)}
                  className={`hover:text-[#5c4436] transition-all p-2.5 rounded-full ${isSearchVisible ? 'bg-brown-gradient text-white' : 'hover:bg-gray-100'}`}
                >
                  {isSearchVisible ? <i className="fa-solid fa-xmark text-lg"></i> : <i className="fa-solid fa-magnifying-glass text-lg"></i>}
                </button>

                <Link href="/cart" className="relative hover:text-[#5c4436] transition-colors p-2.5">
                  <i className="fa-solid fa-bag-shopping text-lg"></i>
                </Link>
              </div>

              <div className="hidden md:flex items-center gap-4" dir="rtl">
                {!isAuthenticated ? (
                  <>
                    <Link href="/signup">
                      <Button className="bg-brown-gradient hover:opacity-90 text-[14px] font-bold px-10 py-3.5 h-auto rounded-full shadow-lg transition-transform hover:scale-105 font-art text-white">
                        إنشاء حساب
                      </Button>
                    </Link>
                    <Link href="/login" className="text-[14px] font-bold text-gray-500 hover:text-[#5c4436] transition-colors font-art">
                      تسجيل الدخول
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center gap-4">
                    {!isArtist && (
                      <button 
                        onClick={() => setIsBecomeArtistModalOpen(true)}
                        className="bg-[#f0ece6] text-[#5c4436] hover:bg-[#5c4436] hover:text-white text-[13px] font-bold px-5 py-2.5 rounded-full transition-all duration-300 font-art flex items-center gap-2 border border-[#5c4436]/10"
                      >
                        <i className="fa-solid fa-palette text-xs"></i>
                        <span>انضم كفنان</span>
                      </button>
                    )}
                    
                    <div className="relative">
                      <button 
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border-2 border-[#e8dcc4] shadow-sm hover:shadow-md hover:border-[#6b4c3b] transition-all duration-300 group"
                      >
                        <div className="w-8 h-8 bg-brown-gradient rounded-full flex items-center justify-center text-white font-bold shadow-sm border border-white/50 text-xs transition-transform group-hover:scale-110">
                          {userInitial}
                        </div>
                        <span className="text-[#3b2012] font-bold font-art text-sm whitespace-nowrap flex items-center gap-1.5">
                          {displayName}
                          {isArtist && (
                            <i className="fa-solid fa-circle-check text-[#1d9bf0] text-[10px]" title="فنان موثق"></i>
                          )}
                        </span>
                        <i className={`fa-solid fa-chevron-down text-[10px] text-[#9c7b65] transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`}></i>
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {userMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)}></div>
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute left-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-[#e8dcc4]/50 z-20 overflow-hidden py-2"
                            >
                              <Link 
                                href="/settings" 
                                className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-[#fdfaf7] hover:text-[#3b2012] transition-colors text-right font-art"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <i className="fa-solid fa-gear text-[#9c7b65]"></i>
                                <span className="text-sm font-bold">الإعدادات</span>
                              </Link>
                              
                              <div className="h-px bg-gray-100 my-1 mx-4"></div>
                              
                              <button 
                                onClick={() => {
                                  logout();
                                  setUserMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-5 py-3 text-red-600 hover:bg-red-50 transition-colors text-right font-art"
                              >
                                <i className="fa-solid fa-arrow-right-from-bracket rotate-180"></i>
                                <span className="text-sm font-bold">تسجيل الخروج</span>
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>

              <button 
                className="lg:hidden text-gray-600 p-2" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <i className="fa-solid fa-xmark text-2xl"></i> : <i className="fa-solid fa-bars-staggered text-2xl"></i>}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-2">
                <Link href="/" className="py-5 px-4 text-xl font-bold text-gray-800 rounded-xl hover:bg-gray-50 text-right font-art">الرئيسية</Link>
                <Link href="/products" className="py-5 px-4 text-xl font-bold text-gray-800 rounded-xl hover:bg-gray-50 text-right font-art">المنتجات</Link>
                <Link href="/about" className="py-5 px-4 text-xl font-bold text-gray-800 rounded-xl hover:bg-gray-50 text-right font-art">عن أثر</Link>
                <div className="pt-6 border-t border-gray-100 mt-2 flex flex-col gap-3">
                  {!isAuthenticated ? (
                    <>
                      <Link href="/signup" className="bg-brown-gradient text-white text-center py-5 rounded-xl text-lg font-bold font-art shadow-md">إنشاء حساب</Link>
                      <Link href="/login" className="border border-gray-200 text-center py-5 rounded-xl text-lg font-bold text-gray-700 font-art">تسجيل الدخول</Link>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3" dir="rtl">
                      {!isArtist && (
                        <button 
                          onClick={() => {
                            setIsBecomeArtistModalOpen(true);
                            setMobileMenuOpen(false);
                          }}
                          className="bg-brown-gradient text-white text-center py-5 rounded-xl text-lg font-bold font-art shadow-md flex items-center justify-center gap-3"
                        >
                          <i className="fa-solid fa-palette"></i>
                          <span>انضم كفنان</span>
                        </button>
                      )}
                      
                      <div className="flex items-center justify-between bg-[#fdfaf7] p-5 rounded-2xl border border-[#e8dcc4]/50 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-brown-gradient rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md border-2 border-white">
                            {userInitial}
                          </div>
                          <span className="text-[#3b2012] font-bold font-art text-xl flex items-center gap-2">
                            {displayName}
                            {isArtist && (
                              <i className="fa-solid fa-circle-check text-[#1d9bf0] text-sm"></i>
                            )}
                          </span>
                        </div>
                        <Link href="/settings" className="text-[#9c7b65] hover:text-[#3b2012] transition-colors">
                          <i className="fa-solid fa-gear text-xl"></i>
                        </Link>
                      </div>
                      <button 
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-3 py-4 border border-red-100 text-red-600 rounded-xl font-bold font-art hover:bg-red-50 transition-colors"
                      >
                        <i className="fa-solid fa-arrow-right-from-bracket rotate-180"></i>
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <BecomeArtistModal 
        isOpen={isBecomeArtistModalOpen} 
        onClose={() => setIsBecomeArtistModalOpen(false)} 
        user={user}
      />
    </>
  );
};
