"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { BecomeArtistModal } from './BecomeArtistModal';

export const Header = () => {
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const {
    globalSearchQuery,
    setGlobalSearchQuery,
    clearGlobalSearch,
  } = useSearch();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isBecomeArtistModalOpen, setIsBecomeArtistModalOpen] = useState(false);
  
  const isArtist = user?.role === 'artist';
  const isGlobalSearchDisabledRoute = pathname === '/about' || pathname === '/works/my' || pathname === '/products' || pathname.startsWith('/artists');
  const canUseGlobalSearch = !isGlobalSearchDisabledRoute;
  const userFirstName = user?.firstName || user?.first_name || 'مستخدم';
  const displayName = isArtist ? (user?.artistName || user?.artist_name || userFirstName) : userFirstName;
  const userInitial = displayName?.charAt(0).toUpperCase() || 'م';
  const userProfileImage = user?.profileImage || user?.profile_image || '';
  const [avatarImageError, setAvatarImageError] = useState(false);

  useEffect(() => {
    setAvatarImageError(false);
  }, [userProfileImage]);

  useEffect(() => {
    if (isGlobalSearchDisabledRoute) {
      setIsSearchVisible(false);
      clearGlobalSearch();
    }
  }, [clearGlobalSearch, isGlobalSearchDisabledRoute]);

  return (
    <>
      <header id="main-header" className="fixed top-0 z-50 w-full border-b bg-white dark:bg-black/95 backdrop-blur-md shadow-sm" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative w-12 h-12 transition-transform group-hover:scale-110 duration-300">
                <Image 
                  src="/images/logo.png" 
                  alt="Logo Athar" 
                  fill 
                  className="object-contain dark:hidden"
                />
                <Image 
                  src="/images/icon-dark.png" 
                  alt="Logo Athar" 
                  fill 
                  className="object-contain hidden dark:block"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-5xl font-bold font-ornamental text-[#1a0f0a] dark:text-[#e8dcc4]">أثر</span>
                <span className="text-gray-300 text-2xl font-light">|</span>
                <span className="text-xl font-bold tracking-widest text-[#2c1e15] dark:text-[#e8dcc4] font-kufi uppercase">Athar</span>
              </div>
            </Link>

            {/* Nav Pill / Search Bar Hub */}
            <div className="flex-1 max-w-xl mx-8 relative flex justify-center">
              <AnimatePresence mode="wait">
                {!isSearchVisible || !canUseGlobalSearch ? (
                  <motion.nav 
                    key="nav"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="hidden lg:flex items-center gap-10 bg-[#fafafa]/80 dark:bg-black/80 px-12 py-3 rounded-full border border-gray-100 dark:border-gray-800 dark:border-gray-800/50 shadow-inner" 
                    dir="rtl"
                  >
                    <Link href="/" className="text-[16px] font-bold text-gray-700 dark:text-[#e8dcc4] hover:text-[#5c4436] dark:text-[#e8dcc4] transition-all hover:scale-105 duration-300 font-art">الرئيسية</Link>
                    <Link href="/products" className="text-[16px] font-bold text-gray-700 dark:text-[#e8dcc4] hover:text-[#5c4436] dark:text-[#e8dcc4] transition-all hover:scale-105 duration-300 font-art">المنتجات</Link>
                    <Link href="/artists" className="text-[16px] font-bold text-gray-700 dark:text-[#e8dcc4] hover:text-[#5c4436] dark:text-[#e8dcc4] transition-all hover:scale-105 duration-300 font-art">الفنانون</Link>
                    <Link href="/about" className="text-[16px] font-bold text-gray-700 dark:text-[#e8dcc4] hover:text-[#5c4436] dark:text-[#e8dcc4] transition-all hover:scale-105 duration-300 font-art">عن أثر</Link>
                  </motion.nav>
                ) : (
                  <motion.div 
                    key="search"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="flex items-center w-full px-4"
                  >
                    <div className="relative w-full flex items-center bg-[#f2f0eb] dark:bg-black border border-[#d2cfc7] dark:border-gray-800 rounded-full px-5 shadow-inner gap-3">
                      <i className="fa-solid fa-magnifying-glass text-[#9c7b65] dark:text-[#e8dcc4] text-sm shrink-0"></i>
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="ابحث عن فنان، عمل ..."
                        value={globalSearchQuery}
                        onChange={(e) => setGlobalSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none py-2.5 text-sm md:text-base text-[#4a3728] dark:text-[#e8dcc4] focus:outline-none font-art placeholder:text-gray-400"
                        dir="rtl"
                      />
                      {globalSearchQuery && (
                        <button
                          onClick={() => setGlobalSearchQuery('')}
                          className="text-gray-400 hover:text-[#5c4436] dark:text-[#e8dcc4] transition-colors shrink-0"
                        >
                          <i className="fa-solid fa-xmark text-xs"></i>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 text-gray-400">
                {canUseGlobalSearch && (
                  <button 
                    onClick={() => setIsSearchVisible(!isSearchVisible)}
                    className={`hover:text-[#5c4436] dark:text-[#e8dcc4] transition-all p-2.5 rounded-full ${isSearchVisible ? 'bg-brown-gradient text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800'}`}
                  >
                    {isSearchVisible ? <i className="fa-solid fa-xmark text-lg"></i> : <i className="fa-solid fa-magnifying-glass text-lg"></i>}
                  </button>
                )}

                <Link href="/cart" className="relative hover:text-[#5c4436] dark:text-[#e8dcc4] transition-colors p-2.5">
                  <i className="fa-solid fa-bag-shopping text-lg"></i>
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-black animate-in fade-in zoom-in duration-300">
                      {totalItems}
                    </span>
                  )}
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
                    <Link href="/login" className="text-[14px] font-bold text-gray-500 hover:text-[#5c4436] dark:text-[#e8dcc4] transition-colors font-art">
                      تسجيل الدخول
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center gap-4">
                    {!isArtist && (
                      <button 
                        onClick={() => setIsBecomeArtistModalOpen(true)}
                        className="bg-[#f0ece6] dark:bg-black text-[#5c4436] dark:text-[#e8dcc4] hover:bg-[#5c4436] hover:text-white text-[13px] font-bold px-5 py-2.5 rounded-full transition-all duration-300 font-art flex items-center gap-2 border border-[#5c4436]/10"
                      >
                        <i className="fa-solid fa-palette text-xs"></i>
                        <span>انضم كفنان</span>
                      </button>
                    )}
                    
                    <div className="relative">
                      <button 
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-3 bg-white dark:bg-black px-3 py-1.5 rounded-full border-2 border-[#e8dcc4] dark:border-gray-800 shadow-sm hover:shadow-md hover:border-[#6b4c3b] transition-all duration-300 group"
                      >
                        <div className="w-8 h-8 bg-brown-gradient rounded-full flex items-center justify-center text-white font-bold shadow-sm border border-white/50 text-xs transition-transform group-hover:scale-110 overflow-hidden">
                          {userProfileImage && !avatarImageError ? (
                            <img
                              src={userProfileImage}
                              alt={displayName}
                              className="w-full h-full object-cover"
                              onError={() => setAvatarImageError(true)}
                            />
                          ) : (
                            userInitial
                          )}
                        </div>
                        <span className="text-[#3b2012] dark:text-[#e8dcc4] font-bold font-art text-sm whitespace-nowrap flex items-center gap-1.5">
                          {displayName}
                          {isArtist && (
                            <i className="fa-solid fa-circle-check text-[#1d9bf0] text-[10px]" title="فنان موثق"></i>
                          )}
                        </span>
                        <i className={`fa-solid fa-chevron-down text-[10px] text-[#9c7b65] dark:text-[#e8dcc4] transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`}></i>
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
                              className="absolute left-0 mt-3 w-48 bg-white dark:bg-black rounded-2xl shadow-xl border border-[#e8dcc4]/50 z-20 overflow-hidden py-2"
                            >
                              {isArtist && (
                                <Link 
                                  href={`/artists/${user?.id}`} 
                                  className="flex items-center gap-3 px-5 py-3 text-gray-700 dark:text-[#e8dcc4] hover:bg-[#fdfaf7] dark:bg-black hover:text-[#3b2012] dark:text-[#e8dcc4] transition-colors text-right font-art"
                                  onClick={() => setUserMenuOpen(false)}
                                >
                                  <i className="fa-solid fa-user-pen text-[#9c7b65] dark:text-[#e8dcc4]"></i>
                                  <span className="text-sm font-bold">صفحتي الفنية</span>
                                </Link>
                              )}

                              {isArtist && (
                                <Link 
                                  href="/works/my" 
                                  className="flex items-center gap-3 px-5 py-3 text-gray-700 dark:text-[#e8dcc4] hover:bg-[#fdfaf7] dark:bg-black hover:text-[#3b2012] dark:text-[#e8dcc4] transition-colors text-right font-art"
                                  onClick={() => setUserMenuOpen(false)}
                                >
                                  <i className="fa-solid fa-palette text-[#9c7b65] dark:text-[#e8dcc4]"></i>
                                  <span className="text-sm font-bold">أعمالي الفنية</span>
                                </Link>
                              )}
                              
                              <Link 
                                href="/settings" 
                                className="flex items-center gap-3 px-5 py-3 text-gray-700 dark:text-[#e8dcc4] hover:bg-[#fdfaf7] dark:bg-black hover:text-[#3b2012] dark:text-[#e8dcc4] transition-colors text-right font-art"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <i className="fa-solid fa-gear text-[#9c7b65] dark:text-[#e8dcc4]"></i>
                                <span className="text-sm font-bold">الإعدادات</span>
                              </Link>
                              
                              <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-4"></div>
                              
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
              className="lg:hidden bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 dark:border-gray-800 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-2">
                <Link href="/" className="py-5 px-4 text-xl font-bold text-gray-800 dark:text-[#e8dcc4] rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 dark:bg-gray-900 text-right font-art">الرئيسية</Link>
                <Link href="/products" className="py-5 px-4 text-xl font-bold text-gray-800 dark:text-[#e8dcc4] rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 dark:bg-gray-900 text-right font-art">المنتجات</Link>
                <Link href="/artists" className="py-5 px-4 text-xl font-bold text-gray-800 dark:text-[#e8dcc4] rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 dark:bg-gray-900 text-right font-art">الفنانون</Link>
                <Link href="/about" className="py-5 px-4 text-xl font-bold text-gray-800 dark:text-[#e8dcc4] rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 dark:bg-gray-900 text-right font-art">عن أثر</Link>
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 dark:border-gray-800 mt-2 flex flex-col gap-3">
                  {!isAuthenticated ? (
                    <>
                      <Link href="/signup" className="bg-brown-gradient text-white text-center py-5 rounded-xl text-lg font-bold font-art shadow-md">إنشاء حساب</Link>
                      <Link href="/login" className="border border-gray-200 dark:border-gray-700 dark:border-gray-700 text-center py-5 rounded-xl text-lg font-bold text-gray-700 dark:text-[#e8dcc4] font-art">تسجيل الدخول</Link>
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
                      
                      <div className="flex items-center justify-between bg-[#fdfaf7] dark:bg-black p-5 rounded-2xl border border-[#e8dcc4]/50 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-brown-gradient rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md border-2 border-white overflow-hidden">
                            {userProfileImage && !avatarImageError ? (
                              <img
                                src={userProfileImage}
                                alt={displayName}
                                className="w-full h-full object-cover"
                                onError={() => setAvatarImageError(true)}
                              />
                            ) : (
                              userInitial
                            )}
                          </div>
                          <span className="text-[#3b2012] dark:text-[#e8dcc4] font-bold font-art text-xl flex items-center gap-2">
                            {displayName}
                            {isArtist && (
                              <i className="fa-solid fa-circle-check text-[#1d9bf0] text-sm"></i>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          {isArtist && (
                            <Link href={`/artists/${user?.id}`} className="text-[#9c7b65] dark:text-[#e8dcc4] hover:text-[#3b2012] dark:text-[#e8dcc4] transition-colors" onClick={() => setMobileMenuOpen(false)}>
                              <i className="fa-solid fa-user-pen text-xl"></i>
                            </Link>
                          )}
                          {isArtist && (
                            <Link href="/works/my" className="text-[#9c7b65] dark:text-[#e8dcc4] hover:text-[#3b2012] dark:text-[#e8dcc4] transition-colors" onClick={() => setMobileMenuOpen(false)}>
                              <i className="fa-solid fa-palette text-xl"></i>
                            </Link>
                          )}
                          <Link href="/settings" className="text-[#9c7b65] dark:text-[#e8dcc4] hover:text-[#3b2012] dark:text-[#e8dcc4] transition-colors" onClick={() => setMobileMenuOpen(false)}>
                            <i className="fa-solid fa-gear text-xl"></i>
                          </Link>
                        </div>
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
