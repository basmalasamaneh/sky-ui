"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading, token, logout, login } = useAuth();
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    artistName: '',
    bio: '',
    location: '',
    phone: '',
    socialMedia: []
  });

  const [showPlatformPicker, setShowPlatformPicker] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (user) {
      setFormData({
        artistName: user.artistName || user.firstName || '',
        bio: user.bio || '',
        location: user.location || '',
        phone: user.phone || '',
        socialMedia: Array.isArray(user.socialMedia) ? user.socialMedia : []
      });
    }
  }, [isAuthenticated, isLoading, router, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validation for phone: only numbers
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    if (name.startsWith('socialMedia_')) {
      const index = parseInt(name.split('_')[1]);
      const newSocial = [...formData.socialMedia];
      newSocial[index].url = value;
      setFormData(prev => ({ ...prev, socialMedia: newSocial }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage({ type: '', text: '' });

    // Phone validation: min 10 digits
    if (formData.phone && formData.phone.length < 10) {
      setUpdateMessage({ type: 'error', text: 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل.' });
      setIsUpdating(false);
      return;
    }

    try {
      // Reverted to simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      login({ ...user, ...formData }, token);
      
      setUpdateMessage({ type: 'success', text: 'تم تحديث بياناتك بنجاح!' });
      setTimeout(() => setUpdateMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Update profile failed:', err);
      setUpdateMessage({ type: 'error', text: 'حدث خطأ أثناء تحديث البيانات.' });
    } finally {
      setIsUpdating(false);
    }
  };

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

  const isArtist = user?.role === 'artist';

  return (
    <div className="min-h-screen bg-[#fdfaf7] py-20 px-4 md:px-8 font-amiri" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12 animate-fade-in">
          <div className="relative">
            <div className="w-32 h-32 bg-brown-gradient rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-xl relative overflow-hidden">
              {user?.firstName?.charAt(0).toUpperCase()}
            </div>
            {isArtist ? (
              <div className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow-lg border border-gray-100">
                <i className="fa-solid fa-circle-check text-[#1d9bf0] text-2xl"></i>
              </div>
            ) : (
              <div className="absolute bottom-1 right-1 bg-green-500 w-8 h-8 rounded-full border-4 border-white shadow-lg"></div>
            )}
          </div>
          
          <div className="text-center md:text-right">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
              <h1 className="text-4xl font-bold text-[#3b2012] font-art">إعدادات الحساب</h1>
              {isArtist && (
                <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                  <i className="fa-solid fa-palette text-[10px]"></i>
                  حساب فنان موثق
                </span>
              )}
            </div>
            <p className="text-[#9c7b65] text-lg">أهلاً بك، {user?.firstName} {user?.lastName}. يمكنك مراجعة وتعديل بياناتك هنا.</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar Nav */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-[2rem] p-3 border border-[#e8dcc4] shadow-sm">
              <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-brown-gradient text-white shadow-lg font-bold transition-all">
                <i className="fa-solid fa-user"></i>
                <span>الملف الشخصي</span>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-[#e8dcc4] shadow-xl border-b-[10px] border-b-brown-gradient"
            >
              <div className="flex items-center justify-between mb-10 pb-4 border-b border-gray-100">
                <h3 className="text-2xl font-bold text-[#3b2012] font-art flex items-center gap-4">
                  <div className="w-2.5 h-10 bg-brown-gradient rounded-full"></div>
                  {isArtist ? 'الملف الشخصي للفنان' : 'البيانات الشخصية'}
                </h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-8">
                
                {/* Conditional Name Fields (Only for Artists) */}
                {isArtist && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#3b2012] mb-2 pr-2 flex items-center gap-2">
                        <i className="fa-solid fa-user text-[#9c7b65]"></i>
                        اسم الفنان
                      </label>
                      <div className="relative group">
                        <input 
                          type="text" 
                          name="artistName"
                          value={formData.artistName}
                          onChange={handleInputChange}
                          className="w-full h-14 bg-[#fdfaf7] border border-[#e8dcc4] rounded-2xl px-5 text-[#3b2012] outline-none focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] transition-all font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#fdfaf7]/50 p-6 rounded-[2rem] border border-[#e8dcc4]/20">
                      <div>
                        <label className="block text-xs font-bold text-[#9c7b65] mb-2 pr-2 uppercase tracking-wider">الاسم الأول (الأصلي)</label>
                        <div className="relative group">
                          <input 
                            type="text" 
                            readOnly
                            value={user?.firstName || ''}
                            className="w-full h-12 bg-white/50 border border-[#e8dcc4]/50 rounded-xl px-4 text-[#3b2012] outline-none cursor-not-allowed text-sm"
                          />
                          <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-200 text-xs"></i>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#9c7b65] mb-2 pr-2 uppercase tracking-wider">اسم العائلة (الأصلي)</label>
                        <div className="relative group">
                          <input 
                            type="text" 
                            readOnly
                            value={user?.lastName || ''}
                            className="w-full h-12 bg-white/50 border border-[#e8dcc4]/50 rounded-xl px-4 text-[#3b2012] outline-none cursor-not-allowed text-sm"
                          />
                          <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-200 text-xs"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-[#3b2012] mb-2 pr-2">البريد الإلكتروني</label>
                  <div className="relative group">
                    <input 
                      type="email" 
                      readOnly
                      dir="ltr"
                      value={user?.email || ''}
                      className="w-full h-14 bg-[#faf7f2] border border-[#e8dcc4] rounded-2xl pl-12 pr-5 text-left text-[#3b2012] outline-none opacity-80 cursor-not-allowed"
                    />
                    <i className="fa-solid fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"></i>
                  </div>
                </div>

                {/* Artist Only Fields */}
                {isArtist && (
                  <div className="pt-6 mt-6 border-t border-gray-100 flex flex-col gap-6 animate-fade-in">
                    <div>
                      <label className="block text-sm font-bold text-[#3b2012] mb-2 pr-2 flex items-center gap-2">
                        <i className="fa-solid fa-feather-pointed text-[#9c7b65]"></i>
                        النبذة الشخصية (Bio)
                      </label>
                      <textarea 
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full bg-[#fdfaf7] border border-[#e8dcc4] rounded-2xl px-5 py-4 text-[#3b2012] outline-none focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-[#3b2012] mb-2 pr-2 flex items-center gap-2">
                          <i className="fa-solid fa-location-dot text-[#9c7b65]"></i>
                          الموقع / المدينة
                        </label>
                        <div className="relative group">
                          <select 
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full h-14 bg-[#fdfaf7] border border-[#e8dcc4] rounded-2xl px-5 text-[#3b2012] outline-none focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] transition-all appearance-none"
                          >
                            <option value="">اختر المدينة</option>
                            <option value="القدس">القدس</option>
                            <option value="نابلس">نابلس</option>
                            <option value="الخليل">الخليل</option>
                            <option value="رام الله">رام الله</option>
                            <option value="بيت لحم">بيت لحم</option>
                            <option value="جنين">جنين</option>
                            <option value="طولكرم">طولكرم</option>
                            <option value="قلقيلية">قلقيلية</option>
                            <option value="سلفيت">سلفيت</option>
                            <option value="أريحا">أريحا</option>
                            <option value="طوباس">طوباس</option>
                            <option value="غزة">غزة</option>
                            <option value="خان يونس">خان يونس</option>
                            <option value="رفح">رفح</option>
                            <option value="دير البلح">دير البلح</option>
                          </select>
                          <i className="fa-solid fa-chevron-down absolute left-5 top-1/2 -translate-y-1/2 text-[10px] text-[#9c7b65] pointer-events-none"></i>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#3b2012] mb-2 pr-2 flex items-center gap-2">
                          <i className="fa-solid fa-phone text-[#9c7b65]"></i>
                          رقم الهاتف
                        </label>
                        <input 
                          type="tel" 
                          name="phone"
                          dir="ltr"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full h-14 bg-[#fdfaf7] border border-[#e8dcc4] rounded-2xl px-5 text-right text-[#3b2012] outline-none focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] transition-all"
                        />
                      </div>
                    </div>

                    {/* Social Media Selection via + Button */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between pr-2">
                          <label className="block text-sm font-bold text-[#3b2012] flex items-center gap-2">
                            <i className="fa-solid fa-share-nodes text-[#9c7b65]"></i>
                            روابط التواصل الاجتماعي
                          </label>
                          <button 
                            type="button"
                            onClick={() => setShowPlatformPicker(!showPlatformPicker)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${showPlatformPicker ? 'bg-[#5c4436] text-white' : 'bg-[#f0ece6] text-[#5c4436] hover:bg-[#e8dcc4]'}`}
                          >
                            <i className={`fa-solid ${showPlatformPicker ? 'fa-xmark' : 'fa-plus'} transition-transform duration-300`}></i>
                            <span>إضافة رابط جديد</span>
                          </button>
                        </div>

                        {showPlatformPicker && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="flex items-center justify-around bg-[#fcf9f5] p-4 rounded-3xl border border-[#e8dcc4]/40 shadow-inner"
                          >
                            {[
                              { id: 'instagram', icon: 'fa-instagram', color: 'text-pink-600', name: 'إنستغرام' },
                              { id: 'facebook', icon: 'fa-facebook', color: 'text-blue-600', name: 'فيسبوك' },
                              { id: 'x', icon: 'fa-x-twitter', color: 'text-gray-900', name: 'X' },
                              { id: 'linkedin', icon: 'fa-linkedin', color: 'text-blue-800', name: 'لينكد إن' },
                              { id: 'pinterest', icon: 'fa-pinterest', color: 'text-red-600', name: 'بينترست' },
                            ].map((p) => {
                              const isAdded = formData.socialMedia.some(s => s.platform === p.id);
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  disabled={isAdded}
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, socialMedia: [...prev.socialMedia, { platform: p.id, url: '' }] }));
                                    setShowPlatformPicker(false);
                                  }}
                                  className={`flex flex-col items-center gap-2 transition-all duration-300 ${isAdded ? 'opacity-20 grayscale' : 'hover:scale-110'}`}
                                >
                                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100">
                                    <i className={`fa-brands ${p.icon} text-xl ${p.color}`}></i>
                                  </div>
                                  <span className="text-[10px] font-bold text-[#9c7b65]">{p.name}</span>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {formData.socialMedia.map((social, index) => (
                          <motion.div 
                            key={social.platform}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative group"
                          >
                            <div className="relative" dir="ltr">
                              <i className={`fa-brands fa-${social.platform === 'x' ? 'x-twitter' : social.platform} absolute right-4 top-1/2 -translate-y-1/2 text-[#9c7b65] group-focus-within:text-[#5c4436] text-xl`}></i>
                              <input 
                                type="text" 
                                name={`socialMedia_${index}_url`}
                                value={social.url}
                                onChange={handleInputChange}
                                placeholder={`${social.platform === 'linkedin' ? 'in/username' : '@username'}`}
                                className="w-full h-14 bg-[#fdfaf7] border border-[#e8dcc4] rounded-2xl pr-12 pl-14 focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] outline-none transition-all placeholder:text-gray-400 text-right font-bold"
                              />
                              <button 
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, socialMedia: prev.socialMedia.filter((_, i) => i !== index) }))}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-red-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <i className="fa-solid fa-trash-can text-sm"></i>
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full md:w-auto min-w-[200px] h-14 bg-brown-gradient text-white rounded-2xl font-bold font-art text-lg shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <i className="fa-solid fa-floppy-disk"></i>
                        حفظ التغييرات
                      </>
                    )}
                  </button>
                  {updateMessage.text && (
                    <p className={`text-sm font-bold mt-4 transition-all animate-fade-in ${updateMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                       <i className={`fa-solid ${updateMessage.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} ml-2`}></i>
                      {updateMessage.text}
                    </p>
                  )}
                </div>
              </form>
            </motion.div>

            {/* Danger Zone */}
            <div className="mt-12 p-8 bg-red-50 border border-red-100 rounded-[2rem]">
              <h3 className="text-xl font-bold text-red-700 mb-4 font-art flex items-center gap-3">
                <i className="fa-solid fa-triangle-exclamation"></i>
                منطقة الخطر
              </h3>
              <p className="text-red-600 mb-6 text-sm">بمجرد حذف حسابك، سيتم حذف جميع بياناتك وأعمالك الفنية المحفوظة بشكل نهائي ولا يمكن استعادتها.</p>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="text-red-700 font-bold border-1 border-red-300 bg-white px-8 py-3 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
