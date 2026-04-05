"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#faf9f6]" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl text-center"
      >
        <p className="text-[#8a7264] text-xl font-ornamental mb-4 tracking-widest">خطأ 404</p>
        <h1 className="text-6xl md:text-8xl font-bold font-ornamental text-[#1a0f0a] mb-8 leading-tight">
          لم نجد أثراً لهذه الصفحة
        </h1>
        <p className="text-gray-500 text-lg mb-12 font-light leading-relaxed max-w-md mx-auto">
          عذراً، يبدو أن هذه الصفحة قد توارت خلف غبار الزمن أو تم نقلها لمكان آخر. دعنا نعد للطريق الصحيح.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-3 px-10 py-4 border border-[#4a3728] rounded-full text-lg font-bold text-[#4a3728] hover:bg-[#4a3728] hover:text-white transition-all duration-300 font-art group"
          >
            <i className="fa-solid fa-arrow-right transition-transform group-hover:translate-x-2"></i>
            رجوع
          </button>
          
          <Link href="/" className="w-full md:w-auto">
            <button className="flex items-center justify-center gap-3 px-10 py-4 bg-brown-gradient text-white rounded-full text-lg font-bold shadow-xl hover:scale-105 transition-all duration-300 font-art w-full">
              <i className="fa-solid fa-house"></i>
              الصفحة الرئيسية
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
