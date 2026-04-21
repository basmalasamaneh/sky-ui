'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const [isOrdered, setIsOrdered] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    address: '',
    paymentMethod: 'cash'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsOrdered(true);
      clearCart();
    }, 1500);
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-[#fdfaf7] dark:bg-black font-art flex items-center justify-center p-4" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-black p-12 rounded-[3rem] border border-[#e8dcc4]/50 shadow-2xl max-w-lg w-full text-center space-y-8"
        >
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 text-5xl">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[#3b2012] dark:text-[#e8dcc4]">تهانينا! تم استلام طلبك</h1>
            <p className="text-[#9c7b65] dark:text-[#e8dcc4]">شكراً لثقتك بـ أثر. سنقوم بالتواصل معك قريباً لتأكيد تفاصيل التوصيل.</p>
          </div>
          <div className="bg-[#fdfaf7] dark:bg-black p-6 rounded-2xl border border-[#e8dcc4]/30 text-right">
            <p className="text-sm font-bold text-[#3b2012] dark:text-[#e8dcc4] mb-2 uppercase tracking-widest text-[10px]">رقم الطلب</p>
            <p className="text-xl font-mono text-amber-600">ATH-{Math.floor(Math.random() * 900000) + 100000}</p>
          </div>
          <Link href="/" className="block w-full py-4 bg-brown-gradient text-white font-bold rounded-2xl shadow-lg hover:opacity-90 transition-all">
            العودة للرئيسية
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf7] dark:bg-black font-art" dir="rtl">
      <main className="container mx-auto px-4 pt-12 pb-20">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 text-center md:text-right">
            <h1 className="text-4xl font-bold text-[#3b2012] dark:text-[#e8dcc4] mb-2">إتمام الشراء</h1>
            <p className="text-[#9c7b65] dark:text-[#e8dcc4]">أدخل تفاصيل التوصيل لإتمام طلبك</p>
          </header>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Shipping Details */}
            <div className="space-y-8">
              <section className="bg-white dark:bg-black p-8 rounded-[2.5rem] border border-[#e8dcc4]/40 shadow-sm space-y-6">
                <h2 className="text-2xl font-bold text-[#3b2012] dark:text-[#e8dcc4] flex items-center gap-3">
                  <i className="fa-solid fa-location-dot text-amber-600"></i>
                  معلومات التوصيل
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#6b4c3b] dark:text-[#e8dcc4]">الاسم الكامل</label>
                    <input 
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="أدخل اسمك الكامل"
                      className="w-full p-4 bg-[#fdfaf7] dark:bg-black/50 border border-[#e8dcc4]/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#6b4c3b] dark:text-[#e8dcc4]">رقم الهاتف</label>
                    <input 
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="059-XXXXXXX"
                      className="w-full p-4 bg-[#fdfaf7] dark:bg-black/50 border border-[#e8dcc4]/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#6b4c3b] dark:text-[#e8dcc4]">المدينة</label>
                  <select 
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-[#fdfaf7] dark:bg-black/50 border border-[#e8dcc4]/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none"
                  >
                    <option value="">اختر المدينة</option>
                    <option value="nablus">نابلس</option>
                    <option value="ramallah">رام الله</option>
                    <option value="hebron">الخليل</option>
                    <option value="jenin">جنين</option>
                    <option value="jerusalem">القدس</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#6b4c3b] dark:text-[#e8dcc4]">العنوان بالتفصيل</label>
                  <textarea 
                    required
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="اسم الشارع، رقم البناية، الطابق..."
                    rows="3"
                    className="w-full p-4 bg-[#fdfaf7] dark:bg-black/50 border border-[#e8dcc4]/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                  ></textarea>
                </div>
              </section>

              <section className="bg-white dark:bg-black p-8 rounded-[2.5rem] border border-[#e8dcc4]/40 shadow-sm space-y-6">
                <h2 className="text-2xl font-bold text-[#3b2012] dark:text-[#e8dcc4] flex items-center gap-3">
                  <i className="fa-solid fa-credit-card text-amber-600"></i>
                  طريقة الدفع
                </h2>
                
                <div className="space-y-4">
                  <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${formData.paymentMethod === 'cash' ? 'border-amber-500 bg-amber-50/50' : 'border-[#e8dcc4]/30 hover:border-[#e8dcc4]'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cash" 
                      checked={formData.paymentMethod === 'cash'} 
                      onChange={handleInputChange}
                      className="w-5 h-5 accent-amber-600"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-[#3b2012] dark:text-[#e8dcc4]">الدفع عند الاستلام</p>
                      <p className="text-xs text-[#9c7b65] dark:text-[#e8dcc4]">ادفع نقداً عند وصول طلبك لباب منزلك</p>
                    </div>
                    <i className="fa-solid fa-money-bill-wave text-2xl text-green-600/50"></i>
                  </label>
                  
                  <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-not-allowed opacity-60`}>
                    <input type="radio" disabled className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-bold text-[#3b2012] dark:text-[#e8dcc4]">البطاقة الائتمانية (قريباً)</p>
                      <p className="text-xs text-[#9c7b65] dark:text-[#e8dcc4]">Visa, Mastercard, American Express</p>
                    </div>
                    <i className="fa-solid fa-credit-card text-2xl text-amber-600/50"></i>
                  </label>
                </div>
              </section>
            </div>

            {/* Order Summary */}
            <div className="space-y-8">
              <section className="bg-white dark:bg-black p-8 rounded-[2.5rem] border border-[#e8dcc4]/40 shadow-xl sticky top-32">
                <h2 className="text-2xl font-bold text-[#3b2012] dark:text-[#e8dcc4] mb-8">ملخص الطلب</h2>
                
                <div className="max-h-[30vh] overflow-y-auto mb-8 pr-2 space-y-4 no-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 py-3 border-b border-[#e8dcc4]/20 last:border-0">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#f0ece6] shrink-0">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#3b2012] dark:text-[#e8dcc4] text-sm">{item.title}</h4>
                        <p className="text-[10px] text-[#9c7b65] dark:text-[#e8dcc4]">الكمية: {item.quantity}</p>
                      </div>
                      <div className="font-bold text-amber-600 text-sm">{item.price * item.quantity} ₪</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between">
                    <span className="text-[#9c7b65] dark:text-[#e8dcc4]">المجموع الفرعي</span>
                    <span className="font-bold text-[#3b2012] dark:text-[#e8dcc4]">{totalPrice} ₪</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9c7b65] dark:text-[#e8dcc4]">التوصيل</span>
                    <span className="text-green-600 font-bold">مجاني</span>
                  </div>
                  <div className="pt-4 border-t border-[#e8dcc4]/30 flex justify-between items-end">
                    <span className="text-xl font-bold text-[#3b2012] dark:text-[#e8dcc4]">الإجمالي النهائي</span>
                    <span className="text-3xl font-black text-amber-600">{totalPrice} ₪</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full h-16 bg-brown-gradient text-white text-xl font-bold rounded-2xl shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-3 group"
                >
                  <span>تأكيد طلب الشراء</span>
                  <i className="fa-solid fa-check transition-transform group-hover:scale-125"></i>
                </button>

                <p className="text-center text-[10px] text-gray-400 mt-6 leading-relaxed">
                  بإتمامك للطلب، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بـ أثر.
                </p>
              </section>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
