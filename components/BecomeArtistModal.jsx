"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export const BecomeArtistModal = ({ isOpen, onClose, user }) => {
  const { login, token } = useAuth();
  const DUPLICATE_ARTIST_NAME_MESSAGE = 'اسم الفنان مستخدم بالفعل. اختر اسماً فنياً آخر.';
  const FIELD_LABELS = {
    artistName: 'اسم الفنان',
    bio: 'النبذة الشخصية',
    location: 'الموقع / المدينة',
    phone: 'رقم الهاتف',
    socialMedia: 'روابط التواصل',
  };

  const mapServerErrorMessage = (message) => {
    if (!message) return 'حدث خطأ. حاول مرة أخرى.';
    const normalized = String(message).toLowerCase();
    if (normalized.includes('artist name is already in use')) {
      return DUPLICATE_ARTIST_NAME_MESSAGE;
    }
    return message;
  };

  const [formData, setFormData] = useState({
    artistName: user?.artistName || user?.firstName || '',
    bio: '',
    location: '',
    phone: '',
    socialMedia: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);
  const hasBlockingFieldErrors = Object.entries(errors).some(([key, value]) => key !== 'submit' && !!value);

  const toFieldErrorMessage = (fieldKey, message) => {
    if (!message) return '';
    const label = FIELD_LABELS[fieldKey] || 'الحقل';
    return `${label}: ${message}`;
  };

  const normalizeFieldKey = (fieldName) => {
    if (!fieldName) return 'submit';
    const raw = String(fieldName);
    if (raw.startsWith('socialMedia')) return 'socialMedia';
    if (raw === 'artist_name') return 'artistName';
    return raw;
  };

  const mapServerValidationErrors = (serverErrors) => {
    if (!Array.isArray(serverErrors)) return null;

    const mapped = {};
    for (const issue of serverErrors) {
      const key = normalizeFieldKey(issue?.field);
      const message = mapServerErrorMessage(issue?.message);
      if (!message) continue;
      mapped[key] = toFieldErrorMessage(key, message);
    }

    return Object.keys(mapped).length > 0 ? mapped : null;
  };

  // Close on Escape key
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const validate = (name, value) => {
    let error = '';
    if (name === 'artistName') {
      if (!value.trim()) error = 'الاسم الفني مطلوب';
      else if (value.trim().length < 3) error = 'الاسم الفني يجب أن يكون 3 أحرف على الأقل';
    }
    if (name === 'bio') {
      if (!value.trim()) error = 'النبذة الشخصية مطلوبة';
      else if (value.trim().length < 20) error = 'النبذة يجب أن تكون 20 حرفاً على الأقل';
      else if (value.length > 1000) error = 'النبذة لا يجب أن تتجاوز 1000 حرف';
    }
    if (name === 'location') {
      if (!value.trim()) error = 'الموقع / المدينة مطلوب';
      else if (value.trim().length < 3) error = 'الموقع / المدينة يجب أن يكون 3 أحرف على الأقل';
    }
    if (name === 'phone') {
      if (!value.trim()) error = 'رقم الهاتف مطلوب';
      else if (value.length !== 10) error = 'رقم الهاتف يجب أن يتكون من 10 أرقام بالضبط';
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Submit-level errors come from backend; allow retry as user edits any field.
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
    
    let finalValue = value;
    // Validation for phone: only numbers
    if (name === 'phone') {
      finalValue = value.replace(/\D/g, '');
    }

    if (name.startsWith('socialMedia_')) {
      const index = parseInt(name.split('_')[1]);
      const newSocial = [...formData.socialMedia];
      newSocial[index].url = value;
      setFormData(prev => ({ ...prev, socialMedia: newSocial }));

      if (errors.socialMedia) {
        setErrors(prev => ({ ...prev, socialMedia: '' }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));

    if (name === 'artistName') {
      setErrors(prev => {
        const next = { ...prev };
        if (prev.artistName === DUPLICATE_ARTIST_NAME_MESSAGE) {
          next.artistName = '';
        }
        if (prev.submit === DUPLICATE_ARTIST_NAME_MESSAGE) {
          next.submit = '';
        }
        return next;
      });
    }

    // Re-validate on every change after first submit attempt or if already touched
    if (touched[name]) {
      const error = validate(name, finalValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all as touched
    const newTouched = {};
    Object.keys(formData).forEach(key => newTouched[key] = true);
    setTouched(newTouched);

    // Validate all
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key === 'socialMedia') return;
      const err = validate(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    const socialMediaHasInvalidUrl = formData.socialMedia.some((social) => {
      const url = String(social?.url || '').trim();
      if (!url) return false;
      try {
        const parsed = new URL(url);
        return !/^https?:$/i.test(parsed.protocol);
      } catch {
        return true;
      }
    });

    if (socialMediaHasInvalidUrl) {
      newErrors.socialMedia = 'روابط التواصل: الرجاء إدخال رابط صحيح يبدأ بـ http:// أو https://';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    if (!token) {
      alert('يرجى تسجيل الدخول لإكمال هذه العملية.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users/become-artist', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          artistName: formData.artistName,
          bio: formData.bio,
          location: formData.location,
          phone: formData.phone,
          socialMedia: formData.socialMedia,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        const fieldErrors = mapServerValidationErrors(result?.errors);
        if (fieldErrors) {
          setErrors(prev => ({ ...prev, ...fieldErrors, submit: '' }));
          return;
        }

        const backendMessage = mapServerErrorMessage(result?.message);
        if (res.status === 409) {
          setErrors(prev => ({ ...prev, artistName: backendMessage, submit: '' }));
        } else {
          setErrors(prev => ({ ...prev, submit: backendMessage }));
        }
        return;
      }

      if (login && result?.data?.user) {
        login({ ...user, ...result.data.user }, token);
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({
          artistName: user?.artistName || user?.firstName || '',
          bio: '',
          location: '',
          phone: '',
          socialMedia: []
        });
      }, 2000);
    } catch (error) {
      console.error('Become artist error:', error);
      setErrors(prev => ({ ...prev, submit: 'تعذر الاتصال بالخادم. حاول مرة أخرى لاحقاً.' }));
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
          className="relative w-full max-w-xl bg-white dark:bg-black md:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl overflow-y-auto no-scrollbar border border-white/20 max-h-[90vh] md:h-auto h-[90vh] mt-auto md:mt-0"
          dir="rtl"
        >
          {/* Decorative Top Bar */}
          <div className="h-2 bg-brown-gradient w-full" />

          <button 
            onClick={onClose}
            className="absolute top-6 left-6 text-gray-400 hover:text-[#3b2012] dark:text-[#e8dcc4] transition-colors"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>

          <div className="p-8 md:p-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-brown-gradient rounded-full text-white text-3xl mb-4 shadow-lg ring-8 ring-[#fdfaf7]">
                <i className="fa-solid fa-palette"></i>
              </div>
              <h2 className="text-3xl font-bold text-[#3b2012] dark:text-[#e8dcc4] font-art mb-2">انضم كفنان</h2>
              <p className="text-[#9c7b65] dark:text-[#e8dcc4] font-amiri">شارك إبداعك مع العالم واترك أثراً فريداً</p>
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
                <h3 className="text-2xl font-bold text-[#3b2012] dark:text-[#e8dcc4] font-art mb-2 flex items-center gap-3">
                  أصبحت فناناً الآن!
                  <i className="fa-solid fa-palette text-amber-500"></i>
                </h3>
                <p className="text-[#9c7b65] dark:text-[#e8dcc4] font-amiri text-center">تم تحديث حسابك بنجاح، يمكنك الآن البدء بإضافة أعمالك.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-center text-sm text-[#9c7b65] dark:text-[#e8dcc4] font-amiri mb-4">قم بتعبئة بياناتك للبدء في رحلتك الفنية</p>
                

                {/* Artist Name */}
                <div className="relative">
                  <label className="block text-[#3b2012] dark:text-[#e8dcc4] font-bold mb-1 mr-2 text-sm">اسم الفنان</label>
                  <div className="relative group">
                    <i className="fa-solid fa-user absolute right-4 top-1/2 -translate-y-1/2 text-[#9c7b65] dark:text-[#e8dcc4] group-focus-within:text-[#5c4436] dark:text-[#e8dcc4]"></i>
                    <input 
                      type="text"
                      name="artistName"
                      value={formData.artistName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      placeholder="ماذا تحب أن نطلق عليك؟"
                      className={`w-full h-11 bg-[#fdfaf7] dark:bg-black border ${errors.artistName ? 'border-red-400' : 'border-[#e8dcc4] dark:border-gray-800'} rounded-2xl pr-12 pl-4 focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] outline-none transition-all placeholder:text-gray-400`}
                    />
                  </div>
                  {errors.artistName && <p className="text-red-500 text-xs mt-1 mr-2">{errors.artistName}</p>}
                </div>

                {/* Bio */}
                <div className="relative">
                  <div className="flex justify-between items-center mb-1 mr-2">
                    <label className="block text-[#3b2012] dark:text-[#e8dcc4] font-bold text-sm">النبذة الشخصية</label>
                    <span className={`text-[10px] ${formData.bio.length < 20 || formData.bio.length > 1000 ? 'text-red-500' : 'text-gray-400'}`}>
                      {formData.bio.length} / 1000
                    </span>
                  </div>
                  <div className="relative group">
                    <i className="fa-solid fa-feather-pointed absolute right-4 top-4 text-[#9c7b65] dark:text-[#e8dcc4] group-focus-within:text-[#5c4436] dark:text-[#e8dcc4]"></i>
                    <textarea 
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      rows="3"
                      placeholder="أخبرنا قليلاً عن شغفك وأسلوبك الفني..."
                      className={`w-full bg-[#fdfaf7] dark:bg-black border ${errors.bio ? 'border-red-400' : 'border-[#e8dcc4] dark:border-gray-800'} rounded-2xl pr-12 pl-4 py-3 focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] outline-none transition-all placeholder:text-gray-400 resize-none font-amiri`}
                    />
                  </div>
                  {errors.bio && <p className="text-red-500 text-xs mt-1 mr-2">{errors.bio}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Location */}
                  <div className="relative">
                    <label className="block text-[#3b2012] dark:text-[#e8dcc4] font-bold mb-1 mr-2 text-sm">الموقع / المدينة</label>
                    <div className="relative group">
                      <i className="fa-solid fa-location-dot absolute right-4 top-1/2 -translate-y-1/2 text-[#9c7b65] dark:text-[#e8dcc4] group-focus-within:text-[#5c4436] dark:text-[#e8dcc4]"></i>
                      <select 
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className={`w-full h-11 bg-[#fdfaf7] dark:bg-black border ${errors.location ? 'border-red-400' : 'border-[#e8dcc4] dark:border-gray-800'} rounded-2xl pr-12 pl-4 focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] outline-none transition-all text-sm font-art text-[#3b2012] dark:text-[#e8dcc4] appearance-none`}
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
                      <i className="fa-solid fa-chevron-down absolute left-4 top-1/2 -translate-y-1/2 text-[10px] text-[#9c7b65] dark:text-[#e8dcc4] pointer-events-none"></i>
                    </div>
                    {errors.location && <p className="text-red-500 text-xs mt-1 mr-2">{errors.location}</p>}
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <label className="block text-[#3b2012] dark:text-[#e8dcc4] font-bold mb-1 mr-2 text-sm">رقم الهاتف</label>
                    <div className="relative group" dir="ltr">
                      <i className="fa-solid fa-phone absolute right-4 top-1/2 -translate-y-1/2 text-[#9c7b65] dark:text-[#e8dcc4] group-focus-within:text-[#5c4436] dark:text-[#e8dcc4]"></i>
                      <input 
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="059XXXXXXX"
                        className={`w-full h-11 bg-[#fdfaf7] dark:bg-black border ${errors.phone ? 'border-red-400' : 'border-[#e8dcc4] dark:border-gray-800'} rounded-2xl pr-12 pl-4 focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] outline-none transition-all placeholder:text-gray-400 text-right`}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1 mr-2">{errors.phone}</p>}
                  </div>
                </div>

                {/* Social Media Selection via + Button */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between mr-2">
                      <label className="block text-[#3b2012] dark:text-[#e8dcc4] font-bold text-sm">روابط التواصل</label>
                      <button 
                        type="button"
                        onClick={() => setShowPlatformPicker(!showPlatformPicker)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${showPlatformPicker ? 'bg-[#5c4436] text-white' : 'bg-[#f0ece6] dark:bg-black text-[#5c4436] dark:text-[#e8dcc4] hover:bg-[#e8dcc4]'}`}
                      >
                        <i className={`fa-solid ${showPlatformPicker ? 'fa-xmark' : 'fa-plus'} transition-transform duration-300`}></i>
                        <span>إضافة رابط</span>
                      </button>
                    </div>

                    <AnimatePresence>
                      {showPlatformPicker && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="flex items-center justify-around bg-[#fdfaf7] dark:bg-black p-3 rounded-2xl border border-[#e8dcc4]/40 shadow-sm"
                        >
                          {[
                            { id: 'instagram', icon: 'fa-instagram', color: 'text-pink-600', name: 'إنستغرام' },
                            { id: 'facebook', icon: 'fa-facebook', color: 'text-blue-600', name: 'فيسبوك' },
                            { id: 'x', icon: 'fa-x-twitter', color: 'text-gray-900 dark:text-[#e8dcc4]', name: 'X' },
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
                                className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isAdded ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-110'}`}
                                title={p.name}
                              >
                                <div className="w-10 h-10 bg-white dark:bg-black rounded-xl shadow-sm flex items-center justify-center border border-[#e8dcc4]/20">
                                  <i className={`fa-brands ${p.icon} text-lg ${p.color}`}></i>
                                </div>
                                <span className="text-[10px] font-bold text-[#9c7b65] dark:text-[#e8dcc4]">{p.name}</span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {formData.socialMedia.map((social, index) => (
                      <motion.div 
                        key={social.platform}
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="relative group pt-1"
                      >
                        <div className="relative" dir="ltr">
                          <i className={`fa-brands fa-${social.platform === 'x' ? 'x-twitter' : social.platform} absolute right-4 top-1/2 -translate-y-1/2 text-[#9c7b65] dark:text-[#e8dcc4] group-focus-within:text-[#5c4436] dark:text-[#e8dcc4] text-lg`}></i>
                          <input 
                            type="text" 
                            name={`socialMedia_${index}_url`}
                            value={social.url}
                            onChange={handleChange}
                            placeholder={`${social.platform === 'linkedin' ? 'in/username' : '@username'}`}
                            className="w-full h-11 bg-[#fdfaf7] dark:bg-black border border-[#e8dcc4] dark:border-gray-800 rounded-2xl pr-11 pl-12 focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] outline-none transition-all placeholder:text-gray-400 text-right text-sm"
                          />
                          <button 
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, socialMedia: prev.socialMedia.filter((_, i) => i !== index) }))}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-red-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <i className="fa-solid fa-trash-can text-sm"></i>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || formData.bio.trim().length < 20 || hasBlockingFieldErrors}
                  className="w-full bg-brown-gradient text-white h-12 rounded-2xl font-bold font-art text-lg shadow-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center mt-2 disabled:opacity-50 disabled:grayscale"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>تقديم الطلب</span>
                      <i className="fa-solid fa-paper-plane mr-3 text-sm"></i>
                    </>
                  )}
                </button>
                {errors.submit && (
                  <p className="text-red-500 text-sm text-center mt-2">{errors.submit}</p>
                )}
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
