'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart, SHIPPING_AREAS } from '@/contexts/CartContext';

export default function CartPage() {
  const { cartItems, totalPrice, itemsPrice, shippingFee, shippingArea, setShippingArea, removeItem, updateQuantity, isLoading } = useCart();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf7] dark:bg-black" dir="rtl">
      <main className="container mx-auto px-4 pt-12 pb-20">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#3b2012] dark:text-[#e8dcc4] mb-4">سلة المقتنيات</h1>
          <p className="text-[#9c7b65] dark:text-[#e8dcc4] text-lg">لديك {cartItems.length} أعمال فنية في سلتك</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-20 text-center space-y-4"
                >
                  <div className="w-12 h-12 border-4 border-[#3b2012]/10 border-t-[#3b2012] rounded-full animate-spin mx-auto"></div>
                  <p className="text-[#9c7b65] font-bold">جاري تحميل السلة...</p>
                </motion.div>
              ) : cartItems.length > 0 ? (
                <motion.div 
                  key="items"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {cartItems.map((item) => (
                    <motion.div 
                      key={item.id}
                      variants={itemVariants}
                      layout
                      exit={{ opacity: 0, scale: 0.9, x: -20 }}
                      className="bg-white dark:bg-black p-6 rounded-[2rem] border border-[#e8dcc4]/40 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-all"
                    >
                      {/* Item Image */}
                      <div className="relative w-full md:w-32 h-48 md:h-32 rounded-2xl overflow-hidden shrink-0 bg-[#f0ece6]">
                        <Image 
                          src={item.image} 
                          alt={item.title} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 text-center md:text-right">
                        <h3 className="text-xl font-bold text-[#3b2012] dark:text-[#e8dcc4] mb-1">{item.title}</h3>
                        <p className="text-sm text-[#9c7b65] dark:text-[#e8dcc4] mb-3">بواسطة: {item.artistName}</p>
                        <div className="text-2xl font-black text-amber-600">{item.price} ₪</div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center bg-[#fdfaf7] dark:bg-black p-2 rounded-2xl border border-[#e8dcc4]/30 gap-4">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-black rounded-xl text-[#3b2012] dark:text-[#e8dcc4] shadow-sm hover:bg-[#e8dcc4] transition-all"
                        >
                          <i className="fa-solid fa-minus text-xs"></i>
                        </button>
                        <span className="text-lg font-bold w-6 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className={`w-10 h-10 flex items-center justify-center bg-white dark:bg-black rounded-xl text-[#3b2012] dark:text-[#e8dcc4] shadow-sm transition-all ${item.quantity >= item.stock ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#e8dcc4]'}`}
                          title={item.quantity >= item.stock ? 'وصلت للحد الأقصى المتوفر' : 'زيادة الكمية'}
                        >
                          <i className="fa-solid fa-plus text-xs"></i>
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="w-12 h-12 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <i className="fa-solid fa-trash-can text-lg"></i>
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-20 text-center space-y-6"
                >
                  <div className="w-32 h-32 bg-[#f0ece6] dark:bg-black rounded-full flex items-center justify-center mx-auto text-[#e8dcc4] text-5xl">
                    <i className="fa-solid fa-bag-shopping"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#3b2012] dark:text-[#e8dcc4]">السلة فارغة حالياً</h2>
                    <p className="text-[#9c7b65] dark:text-[#e8dcc4] mt-2">استكشف المعرض وأضف بعض التحف الفنية إلى سلتك</p>
                  </div>
                  <Link href="/" className="inline-block px-10 py-4 bg-brown-gradient text-white font-bold rounded-2xl shadow-lg hover:opacity-90 transition-all">
                    العودة للمتجر
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-black p-8 rounded-[2.5rem] border border-[#e8dcc4]/50 shadow-xl sticky top-32">
              <h2 className="text-2xl font-bold text-[#3b2012] dark:text-[#e8dcc4] mb-8 pb-4 border-b border-[#e8dcc4]/30">ملخص الطلب</h2>
              
              <div className="mb-8">
                <label className="block text-sm font-bold text-[#9c7b65] mb-3">منطقة التوصيل</label>
                <div className="relative">
                  <select 
                    value={shippingArea.id}
                    onChange={(e) => {
                      const area = SHIPPING_AREAS.find(a => a.id === e.target.value);
                      setShippingArea(area);
                    }}
                    className="w-full h-14 px-5 bg-[#fdfaf7] dark:bg-black border border-[#e8dcc4]/40 rounded-2xl text-[#3b2012] dark:text-[#e8dcc4] appearance-none cursor-pointer focus:ring-2 focus:ring-amber-500/20 transition-all font-bold"
                  >
                    {SHIPPING_AREAS.map(area => (
                      <option key={area.id} value={area.id}>{area.label} ({area.fee} ₪)</option>
                    ))}
                  </select>
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9c7b65]">
                    <i className="fa-solid fa-chevron-down text-xs"></i>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-lg">
                  <span className="text-[#9c7b65] dark:text-[#e8dcc4]">المجموع الفرعي</span>
                  <span className="font-bold text-[#3b2012] dark:text-[#e8dcc4]">{itemsPrice} ₪</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-[#9c7b65] dark:text-[#e8dcc4]">رسوم التوصيل ({shippingArea.label})</span>
                  <span className="text-amber-600 font-bold">{shippingFee} ₪</span>
                </div>
                <div className="pt-4 border-t border-[#e8dcc4]/30 flex justify-between items-end">
                  <span className="text-xl font-bold text-[#3b2012] dark:text-[#e8dcc4]">الإجمالي</span>
                  <div className="text-right">
                    <span className="block text-3xl font-black text-amber-600">{totalPrice} ₪</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">شامل الضريبة</span>
                  </div>
                </div>
              </div>

              <Link href="/checkout">
                <button 
                  disabled={cartItems.length === 0}
                  className="w-full h-16 bg-brown-gradient text-white text-xl font-bold rounded-2xl shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span>إتمام الدفع</span>
                  <i className="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-2"></i>
                </button>
              </Link>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-xs text-[#9c7b65] dark:text-[#e8dcc4]">
                  <i className="fa-solid fa-shield-halved text-amber-600/50"></i>
                  <span>دفع آمن ومحمي 100%</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#9c7b65] dark:text-[#e8dcc4]">
                  <i className="fa-solid fa-truck-fast text-amber-600/50"></i>
                  <span>توصيل سريع لباب المنزل</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
