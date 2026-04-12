"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading, token, logout } = useAuth();
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('هل أنت متأكد من حذف الحساب نهائياً؟ لا يمكن التراجع عن هذه العملية.');
    if (!confirmed) return;

    setIsDeleting(true);
    setDeleteMessage('');

    try {
      const response = await fetch('/api/users/me', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        setDeleteMessage(result.message || 'حدث خطأ أثناء حذف الحساب');
        return;
      }

      logout();
      router.push('/signup');
    } catch (err) {
      console.error('Delete account failed:', err);
      setDeleteMessage('تعذر حذف الحساب حالياً. حاول مرة أخرى لاحقاً.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isLoading && !isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf7]">
        <div className="w-12 h-12 border-4 border-[#3b2012] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf7] py-20 px-4 md:px-8 font-amiri" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12 animate-fade-in">
          <div className="relative">
            <div className="w-32 h-32 bg-brown-gradient rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-xl">
              {user?.firstName?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-1 right-1 bg-green-500 w-8 h-8 rounded-full border-4 border-white shadow-lg"></div>
          </div>
          
          <div className="text-center md:text-right">
            <h1 className="text-4xl font-bold text-[#3b2012] mb-2 font-art">إعدادات الحساب</h1>
            <p className="text-[#9c7b65] text-lg">أهلاً بك، {user?.firstName} {user?.lastName}. يمكنك مراجعة وتعديل بياناتك هنا.</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar Nav */}
          <div className="lg:col-span-1 space-y-2">
            <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-brown-gradient text-white shadow-lg font-bold transition-all">
              <i className="fa-solid fa-user"></i>
              <span>الملف الشخصي</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-8 border border-[#e8dcc4] shadow-md border-b-8 border-b-brown-gradient"
            >
              <h3 className="text-xl font-bold text-[#3b2012] mb-8 pb-4 border-b border-gray-100 font-art flex items-center gap-3">
                <div className="w-2 h-8 bg-brown-gradient rounded-full"></div>
                البيانات الشخصية
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#3b2012] mb-2 pr-2">البريد الإلكتروني</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      readOnly
                      dir="ltr"
                      value={user?.email || ''}
                      className="w-full h-12 bg-[#faf7f2] border border-[#e8dcc4] rounded-xl px-4 text-left text-[#3b2012] outline-none opacity-80 cursor-not-allowed"
                    />
                    <i className="fa-solid fa-lock absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                  </div>
                  <p className="text-xs text-[#9c7b65] mt-2 pr-2 italic">* لا يمكن تعديل البريد الإلكتروني حالياً لدواعي الأمان.</p>
                </div>
              </div>
            </motion.div>

            {/* Danger Zone */}
            <div className="mt-12 p-8 bg-red-50 border border-red-100 rounded-3xl">
              <h3 className="text-xl font-bold text-red-700 mb-4 font-art flex items-center gap-3">
                <i className="fa-solid fa-triangle-exclamation"></i>
                منطقة الخطر
              </h3>
              <p className="text-red-600 mb-6 text-sm">بمجرد حذف حسابك، سيتم حذف جميع بياناتك وأعمالك الفنية المحفوظة بشكل نهائي ولا يمكن استعادتها.</p>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="text-red-700 font-bold border-1 border-red-300 bg-white px-6 py-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'جاري حذف الحساب...' : 'حذف الحساب نهائياً'}
              </button>
              {deleteMessage && (
                <p className="text-sm font-bold text-red-700 mt-4">{deleteMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
