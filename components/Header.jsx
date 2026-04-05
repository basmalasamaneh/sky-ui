"use client";

import React, { useState } from 'react';
import Link from 'next/link';
// Lucide icons removed in favor of Font Awesome via CDN
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = () => {
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  return (
    <header id="main-header" className="fixed top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm" dir="ltr">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-brown-gradient flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300">
              <i className="fa-solid fa-palette text-white text-xl"></i>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-5xl font-bold font-ornamental text-[#1a0f0a]">أثر</span>
              <span className="text-gray-300 text-2xl font-light">|</span>
              <span className="text-xl font-bold tracking-widest text-[#2c1e15] font-kufi">ATHAR</span>
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

            <div className="hidden md:flex items-center gap-6" dir="rtl">
              <Link href="/signup">
                <Button className="bg-brown-gradient hover:opacity-90 text-[14px] font-bold px-10 py-3.5 h-auto rounded-full shadow-lg transition-transform hover:scale-105 font-art text-white">
                  إنشاء حساب
                </Button>
              </Link>
              <Link href="/login" className="text-[14px] font-bold text-gray-500 hover:text-[#5c4436] transition-colors font-art">
                تسجيل الدخول
              </Link>
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
                <Link href="/signup" className="bg-brown-gradient text-white text-center py-5 rounded-xl text-lg font-bold font-art shadow-md">إنشاء حساب</Link>
                <Link href="/login" className="border border-gray-200 text-center py-5 rounded-xl text-lg font-bold text-gray-700 font-art">تسجيل الدخول</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
