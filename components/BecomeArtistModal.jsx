"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export const BecomeArtistModal = ({ isOpen, onClose, user }) => {
  const { login, token } = useAuth();
  const [formData, setFormData] = useState({
    artistName: user?.firstName || '',
    bio: '',
    location: '',
    phone: '',
    socialMedia: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSubmitError('');
      setIsSuccess(false);
      setFormData({
        artistName: user?.artistName || user?.firstName || '',
        bio: user?.bio || '',
        location: user?.location || '',
        phone: user?.phone || '',
        socialMedia: user?.socialMedia || ''
      });
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const response = await fetch('/api/users/become-artist', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
          setSubmitError(result.errors[0]?.message || 'تحقق من البيانات المدخلة ثم حاول مرة أخرى.');
        } else {
          setSubmitError(result.message || 'تعذر إرسال الطلب حالياً. حاول مرة أخرى لاحقاً.');
        }
        return;
      }
      
      if (user && login) {
        login({ ...user, ...(result.data?.user || {}) }, token);
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Become artist request failed:', error);
      setSubmitError('تعذر إرسال الطلب حالياً. حاول مرة أخرى لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
          dir="rtl"
        >
          {/* Decorative Top Bar */}
          <div className="h-2 bg-brown-gradient w-full" />

          <button 
            onClick={onClose}
            className="absolute top-6 left-6 text-gray-400 hover:text-[#3b2012] transition-colors"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>

          <div className="p-8 md:p-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-brown-gradient rounded-full text-white text-3xl mb-4 shadow-lg ring-8 ring-[#fdfaf7]">
                <i className="fa-solid fa-palette"></i>
              </div>
              <h2 className="text-3xl font-bold text-[#3b2012] font-art mb-2">انضم كفنان</h2>
              <p className="text-[#9c7b65] font-amiri">شارك إبداعك مع العالم واترك أثراً فريداً</p>
            </div>

            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10"
              >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6">
                  <i className="fa-solid fa-check"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#3b2012] font-art mb-2">تم إرسال طلبك بنجاح!</h3>
                <p className="text-[#9c7b65] font-amiri text-center">سنقوم بمراجعة بياناتك والرد عليك في أقرب وقت.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Artist Name */}
                <div className="relative">
                  <label className="block text-[#3b2012] font-bold mb-2 mr-2 text-sm">اسم الفنان</label>
                  <div className="relative group">
                    <i className="fa-solid fa-user absolute right-4 top-1/2 -translate-y-1/2 text-[#9c7b65] group-focus-within:text-[#5c4436]"></i>
                    <input 
                      type="text"
                      name="artistName"
                      value={formData.artistName}
                      onChange={handleChange}
                      required
                      placeholder="ماذا تحب أن نطلق عليك؟"
                      className="w-full h-12 bg-[#fdfaf7] border border-[#e8dcc4] rounded-2xl pr-12 pl-4 focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="relative">
                  <label className="block text-[#3b2012] font-bold mb-2 mr-2 text-sm">النبذة الشخصية</label>
                  <div className="relative group">
                    <i className="fa-solid fa-feather-pointed absolute right-4 top-4 text-[#9c7b65] group-focus-within:text-[#5c4436]"></i>
                    <textarea 
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      required
                      rows="3"
                      placeholder="أخبرنا قليلاً عن شغفك وأسلوبك الفني..."
                      className="w-full bg-[#fdfaf7] border border-[#e8dcc4] rounded-2xl pr-12 pl-4 py-3 focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] outline-none transition-all placeholder:text-gray-400 resize-none font-amiri"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Location */}
                  <div className="relative">
                    <label className="block text-[#3b2012] font-bold mb-2 mr-2 text-sm">الموقع / المدينة</label>
                    <div className="relative group">
                      <i className="fa-solid fa-location-dot absolute right-4 top-1/2 -translate-y-1/2 text-[#9c7b65] group-focus-within:text-[#5c4436]"></i>
                      <input 
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        placeholder="مثل: نابلس، فلسطين"
                        className="w-full h-12 bg-[#fdfaf7] border border-[#e8dcc4] rounded-2xl pr-12 pl-4 focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <label className="block text-[#3b2012] font-bold mb-2 mr-2 text-sm">رقم الهاتف</label>
                    <div className="relative group" dir="ltr">
                      <i className="fa-solid fa-phone absolute right-4 top-1/2 -translate-y-1/2 text-[#9c7b65] group-focus-within:text-[#5c4436]"></i>
                      <input 
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="059XXXXXXX"
                        className="w-full h-12 bg-[#fdfaf7] border border-[#e8dcc4] rounded-2xl pr-12 pl-4 focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] outline-none transition-all placeholder:text-gray-400 text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="relative">
                  <label className="block text-[#3b2012] font-bold mb-2 mr-2 text-sm">رابط موقع التواصل</label>
                  <div className="relative group" dir="ltr">
                    <i className="fa-solid fa-share-nodes absolute right-4 top-1/2 -translate-y-1/2 text-[#9c7b65] group-focus-within:text-[#5c4436] text-lg"></i>
                    <input 
                      type="url"
                      name="socialMedia"
                      value={formData.socialMedia}
                      onChange={handleChange}
                      placeholder="https://instagram.com/yourhandle"
                      className="w-full h-12 bg-[#fdfaf7] border border-[#e8dcc4] rounded-2xl pr-12 pl-4 focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] outline-none transition-all placeholder:text-gray-400 text-right"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brown-gradient text-white h-14 rounded-2xl font-bold font-art text-lg shadow-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center mt-4 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>إرسال الطلب</span>
                      <i className="fa-solid fa-paper-plane mr-3 text-sm"></i>
                    </>
                  )}
                </button>

                {submitError && (
                  <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <i className="fa-solid fa-circle-exclamation ml-2"></i>
                    {submitError}
                  </p>
                )}
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
