"use client";

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeWork } from '@/lib/artwork-utils';
import ArtworkDetailModal from '@/components/ArtworkDetailModal';

export default function ArtistPage({ params }) {
  const resolvedParams = use(params);
  const artistId = resolvedParams.id;
  const { token, isAuthenticated, user, login } = useAuth();
  const router = useRouter();

  const [artistData, setArtistData] = useState(null);
  const [works, setWorks] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeSliderWork, setActiveSliderWork] = useState(null);
  const [isLoadingArtworkDetails, setIsLoadingArtworkDetails] = useState(false);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileEditMessage, setProfileEditMessage] = useState({ type: '', text: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    artistName: '',
    bio: '',
    location: '',
    phone: '',
    socialMedia: [],
  });
  const DUPLICATE_ARTIST_NAME_MESSAGE = 'اسم الفنان مستخدم بالفعل. اختر اسماً فنياً آخر.';
  const FIELD_LABELS = {
    artistName: 'اسم الشهرة',
    bio: 'النبذة الشخصية',
    location: 'الموقع / المدينة',
    phone: 'رقم الهاتف',
    socialMedia: 'روابط التواصل الاجتماعي',
  };

  const parseSocialMedia = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try { return JSON.parse(raw); } catch { return []; }
    }
    return [];
  };

  const formatArtistSince = (isoDate) => {
    if (!isoDate) return null;
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return null;
    const arabicMonths = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
    ];
    const month = arabicMonths[date.getMonth()];
    const year = date.getFullYear().toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
    return `في عالم الفن منذ ${month} ${year}`;
  };

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
      const message = issue?.message;
      if (!message) continue;
      mapped[key] = toFieldErrorMessage(key, message);
    }

    return Object.keys(mapped).length > 0 ? mapped : null;
  };

  const validateArtistField = (name, value) => {
    if (name === 'artistName') {
      if (!String(value || '').trim()) return 'اسم الشهرة مطلوب';
      if (String(value).trim().length < 3) return 'اسم الشهرة يجب أن يكون 3 أحرف على الأقل';
      return '';
    }

    if (name === 'bio') {
      const trimmed = String(value || '').trim();
      if (!trimmed) return 'النبذة الشخصية مطلوبة';
      if (trimmed.length < 20) return 'النبذة يجب أن تكون 20 حرفاً على الأقل';
      if (trimmed.length > 1000) return 'النبذة لا يجب أن تتجاوز 1000 حرف';
      return '';
    }

    if (name === 'location') {
      const trimmed = String(value || '').trim();
      if (!trimmed) return 'الموقع / المدينة مطلوب';
      if (trimmed.length < 3) return 'الموقع / المدينة يجب أن يكون 3 أحرف على الأقل';
      return '';
    }

    if (name === 'phone') {
      const trimmed = String(value || '').trim();
      if (!trimmed) return 'رقم الهاتف مطلوب';
      if (trimmed.length !== 10) return 'رقم الهاتف يجب أن يتكون من 10 أرقام بالضبط';
      return '';
    }

    return '';
  };

  const validateSocialMedia = (socialMedia) => {
    const invalidLink = (socialMedia || []).some((social) => {
      const url = String(social?.url || '').trim();
      if (!url) return false;
      try {
        const parsed = new URL(url);
        return !/^https?:$/i.test(parsed.protocol);
      } catch {
        return true;
      }
    });

    return invalidLink
      ? 'روابط التواصل الاجتماعي: الرجاء إدخال رابط صحيح يبدأ بـ http:// أو https://'
      : '';
  };

  const canEditProfileImage = !!(
    isAuthenticated &&
    user?.role === 'artist' &&
    user?.id &&
    artistData?.id &&
    user.id === artistData.id
  );

  const canEditOwnProfile = !!(
    isAuthenticated &&
    user?.role === 'artist' &&
    user?.id &&
    artistData?.id &&
    user.id === artistData.id
  );

  useEffect(() => {
    if (!artistData || !canEditOwnProfile) return;

    const socialMedia = Array.isArray(artistData.socialMedia) ? artistData.socialMedia : [];
    setEditProfileData({
      artistName: artistData.name || '',
      bio: artistData.bio || '',
      location: artistData.location || '',
      phone: artistData.phone || '',
      socialMedia,
    });
  }, [artistData, canEditOwnProfile]);

  const handleEditFieldChange = (name, value) => {
    if (profileEditMessage.type === 'error') {
      setProfileEditMessage({ type: '', text: '' });
    }

    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      setEditProfileData((prev) => ({ ...prev, [name]: numericValue }));
      setFieldErrors((prev) => ({ ...prev, phone: '' }));
      return;
    }

    setEditProfileData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSocialMediaChange = (index, field, value) => {
    setEditProfileData((prev) => {
      const social = [...prev.socialMedia];
      if (!social[index]) return prev;
      social[index] = { ...social[index], [field]: value };
      return { ...prev, socialMedia: social };
    });
    setFieldErrors((prev) => ({ ...prev, socialMedia: '' }));
  };

  const addSocialMediaRow = () => {
    setEditProfileData((prev) => ({
      ...prev,
      socialMedia: [...prev.socialMedia, { platform: 'instagram', url: '' }],
    }));
  };

  const removeSocialMediaRow = (index) => {
    setEditProfileData((prev) => ({
      ...prev,
      socialMedia: prev.socialMedia.filter((_, i) => i !== index),
    }));
  };

  const saveProfileEdits = async () => {
    if (!token || !canEditOwnProfile) return;

    setIsSavingProfile(true);
    setProfileEditMessage({ type: '', text: '' });
    setFieldErrors({});

    const localErrors = {};
    const artistNameError = validateArtistField('artistName', editProfileData.artistName);
    const bioError = validateArtistField('bio', editProfileData.bio);
    const locationError = validateArtistField('location', editProfileData.location);
    const phoneError = validateArtistField('phone', editProfileData.phone);
    const socialMediaError = validateSocialMedia(editProfileData.socialMedia);

    if (artistNameError) localErrors.artistName = artistNameError;
    if (bioError) localErrors.bio = bioError;
    if (locationError) localErrors.location = locationError;
    if (phoneError) localErrors.phone = phoneError;
    if (socialMediaError) localErrors.socialMedia = socialMediaError;

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setProfileEditMessage({ type: 'error', text: 'يرجى تصحيح الحقول المحددة ثم إعادة المحاولة.' });
      setIsSavingProfile(false);
      return;
    }

    try {
      const payload = {
        artistName: String(editProfileData.artistName || '').trim(),
        bio: String(editProfileData.bio || '').trim(),
        location: String(editProfileData.location || '').trim(),
        phone: String(editProfileData.phone || '').trim(),
        socialMedia: (editProfileData.socialMedia || [])
          .filter((item) => item?.platform && String(item?.url || '').trim())
          .map((item) => ({ platform: item.platform, url: String(item.url).trim() })),
      };

      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const serverFieldErrors = mapServerValidationErrors(result?.errors);
        if (serverFieldErrors) {
          setFieldErrors(serverFieldErrors);
          setProfileEditMessage({ type: 'error', text: 'يرجى تصحيح الحقول المحددة ثم إعادة المحاولة.' });
          return;
        }

        if (response.status === 409) {
          setFieldErrors({ artistName: DUPLICATE_ARTIST_NAME_MESSAGE });
          setProfileEditMessage({ type: 'error', text: DUPLICATE_ARTIST_NAME_MESSAGE });
          return;
        }

        throw new Error(result?.message || 'تعذر تحديث الملف الشخصي');
      }

      const updatedUser = result?.data?.user;
      if (updatedUser) {
        const displayName =
          updatedUser.artistName ||
          [updatedUser.firstName, updatedUser.lastName].filter(Boolean).join(' ') ||
          artistData?.name ||
          'غير متوفر';

        setArtistData((prev) => prev ? ({
          ...prev,
          name: displayName,
          bio: updatedUser.bio || null,
          location: updatedUser.location || null,
          phone: updatedUser.phone || null,
          socialMedia: Array.isArray(updatedUser.socialMedia) ? updatedUser.socialMedia : [],
        }) : prev);

        if (user) {
          login({ ...user, ...updatedUser }, token);
        }
      }

      setProfileEditMessage({ type: 'success', text: 'تم تحديث ملف الفنان بنجاح.' });
      setIsEditingProfile(false);
      setShowPlatformPicker(false);
      setFieldErrors({});
    } catch (error) {
      console.error('Failed to update artist profile:', error);
      setProfileEditMessage({ type: 'error', text: error?.message || 'فشل تحديث الملف الشخصي.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !token || !canEditProfileImage) return;

    setIsUploadingProfileImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/users/profile/image', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result?.message || 'فشل تحديث الصورة الشخصية');
      }

      const updatedUser = result?.data?.user;
      if (updatedUser?.profileImage) {
        setArtistData((prev) => prev ? { ...prev, avatar: updatedUser.profileImage } : prev);
      }

      if (updatedUser && user) {
        login({ ...user, ...updatedUser }, token);
      }
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      alert(error?.message || 'فشل تحديث الصورة الشخصية');
    } finally {
      setIsUploadingProfileImage(false);
      event.target.value = '';
    }
  };

  useEffect(() => {
    if (!token) {
      setIsFetching(false);
      return;
    }

    const fetchArtistDataAndWorks = async () => {
      setIsFetching(true);
      setNotFound(false);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch artist profile and artworks in parallel
        const [profileRes, worksRes] = await Promise.all([
          fetch(`/api/artists/${artistId}`, { headers }),
          fetch(`/api/artists/${artistId}/artworks`, { headers }),
        ]);

        // Handle artist not found
        if (profileRes.status === 404) {
          setNotFound(true);
          return;
        }

        const profileResult = profileRes.ok
          ? await profileRes.json().catch(() => ({}))
          : {};
        const worksResult = worksRes.ok
          ? await worksRes.json().catch(() => ({}))
          : {};

        const artist = profileResult?.data;
        if (artist) {
          const displayName =
            artist.artist_name ||
            [artist.first_name, artist.last_name].filter(Boolean).join(' ') ||
            'غير متوفر';
          setArtistData({
            id: artist.id,
            name: displayName,
            location: artist.location || null,
            phone: artist.phone || null,
            bio: artist.bio || null,
            socialMedia: parseSocialMedia(artist.social_media),
            artistSince: artist.artist_since || null,
            avatar: artist.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=5c4436&color=fff&size=200&font-size=0.4&bold=true`,
          });
        }

        const rawWorks = worksResult?.data?.artworks ?? [];
        setWorks(rawWorks.map(normalizeWork));
      } catch (e) {
        console.error('Failed to fetch artist details:', e);
      } finally {
        setIsFetching(false);
      }
    };

    fetchArtistDataAndWorks();
  }, [artistId, token]);

  const openSlider = async (work) => {
    setActiveSliderWork(work);
    setIsLoadingArtworkDetails(true);

    try {
      const res = await fetch(`/api/artworks/${work.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const contentType = res.headers.get('content-type') || '';
      const result = contentType.includes('application/json') ? await res.json().catch(() => ({})) : {};

      if (res.ok && result?.data?.artwork) {
        setActiveSliderWork(normalizeWork(result.data.artwork));
      }
    } catch (error) {
      console.error('Failed to fetch artwork details:', error);
    } finally {
      setIsLoadingArtworkDetails(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#faf8f5] py-12 px-4 sm:px-6 lg:px-8 font-art" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-[#9c7b65] hover:text-[#5c4436] font-bold mb-8 transition-colors group border-none bg-transparent cursor-pointer">
          <i className="fa-solid fa-arrow-right group-hover:-translate-x-1 transition-transform"></i>
          الرجوع
        </button>

        {!isAuthenticated && !isFetching ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-[#e8dcc4] shadow-sm">
            <i className="fa-solid fa-lock text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-2xl font-bold text-[#3b2012] mb-2">يجب تسجيل الدخول أولاً</h2>
            <p className="text-[#9c7b65] mb-6">عرض ملف الفنان متاح للأعضاء المسجلين فقط.</p>
            <Link href="/login" className="inline-block bg-[#5c4436] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#3b2012] transition-colors">
              تسجيل الدخول
            </Link>
          </div>
        ) : notFound ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-[#e8dcc4] shadow-sm">
            <i className="fa-solid fa-user-slash text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-2xl font-bold text-[#3b2012]">لم يتم العثور على الفنان</h2>
            <p className="text-[#9c7b65] mt-2">قد يكون هذا الفنان غير موجود أو لا ينتمي لقائمة الفنانين.</p>
          </div>
        ) : isFetching ? (
          <div className="space-y-10">
            {/* Skeleton Profile */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8 animate-pulse border border-[#e8dcc4]">
              <div className="w-32 h-32 bg-gray-200 rounded-full shrink-0"></div>
              <div className="flex-1 space-y-4 w-full">
                <div className="h-8 bg-gray-200 rounded-md w-1/3 mx-auto md:mx-0"></div>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                  <div className="h-4 bg-gray-200 rounded-md w-24"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-24"></div>
                </div>
              </div>
            </div>
          </div>
        ) : !artistData ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-[#e8dcc4] shadow-sm">
            <i className="fa-solid fa-user-slash text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-2xl font-bold text-[#3b2012]">لم يتم العثور على الفنان</h2>
            <p className="text-[#9c7b65] mt-2">قد يكون هذا الفنان غير موجود أو لا ينتمي لقائمة الفنانين.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Artist Profile Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#e8dcc4] flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden"
            >
              <div className="w-32 h-32 relative rounded-full overflow-hidden shrink-0 border-4 border-white shadow-xl bg-[#fdfaf7] flex items-center justify-center -mt-16 md:mt-0 group/profilepic">
                <img src={artistData.avatar} alt={artistData.name} className="w-full h-full object-cover transition-transform group-hover/profilepic:scale-105" />
                {canEditProfileImage && (
                  <>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/profilepic:opacity-100 transition-opacity cursor-pointer">
                      {isUploadingProfileImage ? (
                        <i className="fa-solid fa-spinner fa-spin text-white text-2xl"></i>
                      ) : (
                        <i className="fa-solid fa-camera text-white text-2xl"></i>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={handleProfileImageUpload}
                      title="تغيير الصورة الشخصية"
                      disabled={isUploadingProfileImage}
                    />
                  </>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-right space-y-4 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                      <h1 className="text-3xl md:text-4xl font-bold text-[#3b2012]">{artistData.name}</h1>
                      <div className="text-[#fdfaf7] bg-blue-500 rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-sm shadow-md mt-1" title="فنان موثق">
                        <i className="fa-solid fa-check"></i>
                      </div>
                      {canEditOwnProfile && (
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile((prev) => !prev)}
                          className="bg-[#f0ece6] text-[#5c4436] hover:bg-[#5c4436] hover:text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                        >
                          <i className="fa-solid fa-pen-to-square ml-1"></i>
                          {isEditingProfile ? 'إلغاء التعديل' : 'تعديل الصفحة'}
                        </button>
                      )}
                    </div>
                    <p className="text-[#9c7b65] font-medium text-lg">فنان مبدع</p>
                    {formatArtistSince(artistData.artistSince) && (
                      <p className="inline-flex items-center gap-2 mt-1 text-sm text-[#ae8c73] font-semibold">
                        <i className="fa-regular fa-calendar-check text-[#c9a882]"></i>
                        {formatArtistSince(artistData.artistSince)}
                      </p>
                    )}
                    {artistData.bio && (
                      <p className="text-[#5c4436] text-sm leading-relaxed mt-4 p-4 bg-[#fcfbf9] rounded-xl border border-[#e8dcc4]/50 max-w-2xl mx-auto md:mx-0">
                        {artistData.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-6 border-t border-gray-100">
                  {canEditOwnProfile && isEditingProfile && (
                    <div className="w-full bg-white rounded-[2rem] p-6 border border-[#e8dcc4] shadow-sm space-y-6">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-[#3b2012] flex items-center gap-2">
                          <i className="fa-solid fa-user-pen text-[#9c7b65]"></i>
                          تعديل ملف الفنان
                        </h3>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-[#3b2012] mb-2 pr-2 flex items-center gap-2">
                          <i className="fa-solid fa-user text-[#9c7b65]"></i>
                          اسم الشهرة
                        </label>
                        <input
                          type="text"
                          value={editProfileData.artistName}
                          onChange={(e) => handleEditFieldChange('artistName', e.target.value)}
                          className={`w-full h-14 bg-[#fdfaf7] border ${fieldErrors.artistName ? 'border-red-400' : 'border-[#e8dcc4]'} rounded-2xl px-5 text-[#3b2012] outline-none focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] transition-all font-bold`}
                        />
                        {fieldErrors.artistName && (
                          <p className="text-red-500 text-xs mt-2 mr-1">{fieldErrors.artistName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-[#3b2012] mb-2 pr-2 flex items-center gap-2">
                          <i className="fa-solid fa-feather-pointed text-[#9c7b65]"></i>
                          النبذة الشخصية (Bio)
                        </label>
                        <textarea
                          value={editProfileData.bio}
                          onChange={(e) => handleEditFieldChange('bio', e.target.value)}
                          rows="4"
                          className={`w-full bg-[#fdfaf7] border ${fieldErrors.bio ? 'border-red-400' : 'border-[#e8dcc4]'} rounded-2xl px-5 py-4 text-[#3b2012] outline-none focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] transition-all resize-none`}
                        />
                        {fieldErrors.bio && (
                          <p className="text-red-500 text-xs mt-2 mr-1">{fieldErrors.bio}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-[#3b2012] mb-2 pr-2 flex items-center gap-2">
                            <i className="fa-solid fa-location-dot text-[#9c7b65]"></i>
                            الموقع / المدينة
                          </label>
                          <div className="relative group">
                            <select
                              value={editProfileData.location}
                              onChange={(e) => handleEditFieldChange('location', e.target.value)}
                              className={`w-full h-14 bg-[#fdfaf7] border ${fieldErrors.location ? 'border-red-400' : 'border-[#e8dcc4]'} rounded-2xl px-5 text-[#3b2012] outline-none focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] transition-all appearance-none`}
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
                          {fieldErrors.location && (
                            <p className="text-red-500 text-xs mt-2 mr-1">{fieldErrors.location}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-[#3b2012] mb-2 pr-2 flex items-center gap-2">
                            <i className="fa-solid fa-phone text-[#9c7b65]"></i>
                            رقم الهاتف
                          </label>
                          <input
                            type="tel"
                            dir="ltr"
                            value={editProfileData.phone}
                            onChange={(e) => handleEditFieldChange('phone', e.target.value)}
                            className={`w-full h-14 bg-[#fdfaf7] border ${fieldErrors.phone ? 'border-red-400' : 'border-[#e8dcc4]'} rounded-2xl px-5 text-right text-[#3b2012] outline-none focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] transition-all`}
                          />
                          {fieldErrors.phone && (
                            <p className="text-red-500 text-xs mt-2 mr-1">{fieldErrors.phone}</p>
                          )}
                        </div>
                      </div>

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
                                const isAdded = editProfileData.socialMedia.some((s) => s.platform === p.id);
                                return (
                                  <button
                                    key={p.id}
                                    type="button"
                                    disabled={isAdded}
                                    onClick={() => {
                                      setEditProfileData((prev) => ({ ...prev, socialMedia: [...prev.socialMedia, { platform: p.id, url: '' }] }));
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
                          {editProfileData.socialMedia.map((social, index) => (
                            <motion.div
                              key={`${social.platform}-${index}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="relative group"
                            >
                              <div className="relative" dir="ltr">
                                <i className={`fa-brands fa-${social.platform === 'x' ? 'x-twitter' : social.platform} absolute right-4 top-1/2 -translate-y-1/2 text-[#9c7b65] group-focus-within:text-[#5c4436] text-xl`}></i>
                                <input
                                  type="text"
                                  value={social.url || ''}
                                  onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                                  placeholder={`${social.platform === 'linkedin' ? 'in/username' : '@username'}`}
                                  className="w-full h-14 bg-[#fdfaf7] border border-[#e8dcc4] rounded-2xl pr-12 pl-14 focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] outline-none transition-all placeholder:text-gray-400 text-right font-bold"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeSocialMediaRow(index)}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-red-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                  <i className="fa-solid fa-trash-can text-sm"></i>
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {fieldErrors.socialMedia && (
                          <p className="text-red-500 text-xs mt-1 mr-1">{fieldErrors.socialMedia}</p>
                        )}
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={saveProfileEdits}
                          disabled={isSavingProfile}
                          className="w-full md:w-auto min-w-[200px] h-12 bg-brown-gradient text-white rounded-2xl font-bold text-base shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                          {isSavingProfile ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <i className="fa-solid fa-floppy-disk"></i>
                              حفظ التغييرات
                            </>
                          )}
                        </button>
                        {profileEditMessage.text && (
                          <p className={`text-sm font-bold mt-3 ${profileEditMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            <i className={`fa-solid ${profileEditMessage.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} ml-2`}></i>
                            {profileEditMessage.text}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-[#fcfbf9] border border-[#e8dcc4] rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold mb-0.5">الموقع</span>
                      {artistData.location ? (
                        <span className="text-sm font-bold text-[#3b2012]">{artistData.location}</span>
                      ) : !isAuthenticated ? (
                        <span className="text-xs font-bold text-[#9c7b65]"><i className="fa-solid fa-lock text-[10px] ml-1"></i> معلومات مخفية للزوار</span>
                      ) : (
                        <span className="text-xs text-gray-400">غير محدد</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#fcfbf9] border border-[#e8dcc4] rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-phone"></i>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold mb-0.5">رقم التواصل</span>
                      {artistData.phone ? (
                        <span className="text-sm font-bold text-[#3b2012]" dir="ltr">{artistData.phone}</span>
                      ) : !isAuthenticated ? (
                        <span className="text-xs font-bold text-[#9c7b65]"><i className="fa-solid fa-lock text-[10px] ml-1"></i> معلومات مخفية للزوار</span>
                      ) : (
                        <span className="text-xs text-gray-400">غير محدد</span>
                      )}
                    </div>
                  </div>
                  
                  {artistData.socialMedia && artistData.socialMedia.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      {artistData.socialMedia.map((social, index) => {
                        let icon = 'fa-link';
                        let colorClass = 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-[#e8dcc4]';
                        const p = social.platform?.toLowerCase();
                        
                        if (p === 'instagram') { icon = 'fa-instagram'; colorClass = 'bg-pink-50 text-pink-600 hover:bg-pink-100 hover:text-pink-700 border-pink-100'; }
                        else if (p === 'facebook') { icon = 'fa-facebook-f'; colorClass = 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-100'; }
                        else if (p === 'x') { icon = 'fa-x-twitter'; colorClass = 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-black border-gray-200'; }
                        else if (p === 'linkedin') { icon = 'fa-linkedin-in'; colorClass = 'bg-blue-50 text-blue-800 hover:bg-blue-100 hover:text-blue-900 border-blue-200'; }
                        else if (p === 'pinterest') { icon = 'fa-pinterest-p'; colorClass = 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-100'; }

                        return (
                          <a 
                            key={index} 
                            href={social.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            title={social.platform} 
                            className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm ${colorClass}`}
                          >
                            <i className={`fa-brands ${icon} text-xl`}></i>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Artworks Grid */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#3b2012] flex items-center gap-3">
                <i className="fa-solid fa-paintbrush text-[#ae8c73]"></i>
                أعمال الفنان
                <span className="text-sm bg-[#5c4436] text-white px-3 py-0.5 rounded-full mr-2">{works.length}</span>
              </h2>

              {works.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-[#e8dcc4]">
                  <p className="text-xl text-[#9c7b65] font-bold">لا يوجد أعمال فنية حالياً</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {works.map((work, index) => (
                    <motion.div
                      key={work.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => openSlider(work)}
                      className="group bg-white rounded-3xl overflow-hidden border border-[#e8dcc4] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] hover:shadow-xl transition-all duration-500 flex flex-col cursor-pointer"
                    >
                      <div className="relative h-64 overflow-hidden m-2 rounded-2xl">
                        <Image
                          src={work.images?.[work.mainImageIndex || 0] || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800'}
                          alt={work.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-bold text-[#3b2012] mb-4 line-clamp-1">{work.title}</h3>
                        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4" onClick={(e) => e.stopPropagation()}>
                          <span className="font-bold text-lg text-[#3b2012]">
                            {work.price ? `${work.price} ₪` : 'حسب الطلب'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openSlider(work);
                            }}
                            className="bg-[#f0ece6] text-[#5c4436] hover:bg-[#5c4436] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                          >
                            عرض التفاصيل
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeSliderWork && (
          <ArtworkDetailModal
            work={activeSliderWork}
            isLoadingDetails={isLoadingArtworkDetails}
            onClose={() => { setActiveSliderWork(null); setIsLoadingArtworkDetails(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
