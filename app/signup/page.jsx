"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateField = (name, value, currentFormData = formData) => {
    let error = '';

    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          error = 'الاسم الكامل مطلوب';
        } else if (value.trim().length < 2) {
          error = 'يجب أن يتكون الاسم من حرفين على الأقل';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'البريد الإلكتروني مطلوب';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'صيغة البريد الإلكتروني غير صحيحة';
        }
        break;
      case 'password':
        if (!value) {
          error = 'كلمة المرور مطلوبة';
        } else if (value.length < 8) {
          error = 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = 'يجب أن تحتوي على: حرف كبير، حرف صغير، ورقم على الأقل';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'يرجى تأكيد كلمة المرور';
        } else if (value !== currentFormData.password) {
          error = 'كلمتا المرور غير متطابقتين';
        }
        break;
      default:
        break;
    }

    return error;
  };

  const validateAll = (data = formData) => {
    const newErrors = {};
    Object.keys(data).forEach(key => {
      const error = validateField(key, data[key], data);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  useEffect(() => {
    const currentErrors = validateAll();
    setIsFormValid(Object.keys(currentErrors).length === 0);

    setErrors(prev => {
      const nextErrors = { ...prev };
      Object.keys(touched).forEach(key => {
        if (touched[key]) {
          nextErrors[key] = validateField(key, formData[key], formData);
        }
      });
      return nextErrors;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, touched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    const checkErrors = validateAll();
    setErrors(checkErrors);

    if (Object.keys(checkErrors).length === 0) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        console.log('تم الإرسال بنجاح:', formData);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2" dir="rtl">

      {/* الفورم - يمين */}
      <div className="flex items-center justify-center bg-[#f5f0eb] px-8 py-16 lg:order-1 pt-24">
        <div className="w-full max-w-md">

          {/* العنوان */}
          <div className="mb-10 text-center lg:text-right animate-fade-in">
            <h1 className="text-5xl text-[#3b2012] mb-4 font-amiri leading-tight">
              إنضم إلى <span className="text-[#6b4c3b] font-bold">أثر</span>
            </h1>
            <p className="text-[#9c7b65] text-lg font-amiri">
              أنشئ حساباً جديداً للبدء بجمع أفضل اللوحات والأعمال الفنية الحصرية.
            </p>
          </div>

          {/* الفورم */}
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>

            {/* الاسم الكامل */}
            <div>
              <label className="block text-sm font-bold text-[#3b2012] mb-2 font-amiri">
                الاسم الكامل
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9c7b65]">
                  <i className="fa-regular fa-user"></i>
                </span>
                <input
                  name="fullName"
                  type="text"
                  placeholder="بتول سويسه"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full h-14 bg-white border ${errors.fullName ? 'border-red-400 focus:border-red-500' : 'border-[#e0d5c8] focus:border-[#6b4c3b]'} rounded-xl pr-12 pl-4 text-sm text-[#3b2012] placeholder:text-[#c5b0a0] outline-none transition-colors font-amiri shadow-sm`}
                />
              </div>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${errors.fullName ? 'max-h-10 opacity-100 mt-1.5' : 'max-h-0 opacity-0'}`}>
                <p className="text-xs text-red-500 font-bold font-amiri">{errors.fullName}</p>
              </div>
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-bold text-[#3b2012] mb-2 font-amiri">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9c7b65]">
                  <i className="fa-regular fa-envelope"></i>
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder="batool@gmail.com"
                  dir="ltr"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full h-14 bg-white border ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-[#e0d5c8] focus:border-[#6b4c3b]'} rounded-xl pr-12 pl-4 text-sm text-left text-[#3b2012] placeholder:text-[#c5b0a0] outline-none transition-colors font-amiri shadow-sm`}
                />
              </div>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${errors.email ? 'max-h-10 opacity-100 mt-1.5' : 'max-h-0 opacity-0'}`}>
                <p className="text-xs text-red-500 font-bold font-amiri">{errors.email}</p>
              </div>
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="block text-sm font-bold text-[#3b2012] mb-2 font-amiri">
                كلمة المرور
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c7b65] hover:text-[#3b2012] transition-colors"
                >
                  {showPassword ? <i className="fa-regular fa-eye-slash"></i> : <i className="fa-regular fa-eye"></i>}
                </button>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9c7b65]">
                  <i className="fa-solid fa-lock"></i>
                </span>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  dir="ltr"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full h-14 bg-white border ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-[#e0d5c8] focus:border-[#6b4c3b]'} rounded-xl pr-12 pl-12 text-sm text-left text-[#3b2012] placeholder:text-[#c5b0a0] outline-none transition-colors font-amiri shadow-sm`}
                />
              </div>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${errors.password ? 'max-h-20 opacity-100 mt-1.5' : 'max-h-0 opacity-0'}`}>
                <p className="text-xs text-red-500 font-bold font-amiri">{errors.password}</p>
              </div>
            </div>

            {/* تأكيد كلمة المرور */}
            <div>
              <label className="block text-sm font-bold text-[#3b2012] mb-2 font-amiri">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c7b65] hover:text-[#3b2012] transition-colors"
                >
                  {showConfirmPassword ? <i className="fa-regular fa-eye-slash"></i> : <i className="fa-regular fa-eye"></i>}
                </button>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9c7b65]">
                  <i className="fa-solid fa-lock"></i>
                </span>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  dir="ltr"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full h-14 bg-white border ${errors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-[#e0d5c8] focus:border-[#6b4c3b]'} rounded-xl pr-12 pl-12 text-sm text-left text-[#3b2012] placeholder:text-[#c5b0a0] outline-none transition-colors font-amiri shadow-sm`}
                />
              </div>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${errors.confirmPassword ? 'max-h-10 opacity-100 mt-1.5' : 'max-h-0 opacity-0'}`}>
                <p className="text-xs text-red-500 font-bold font-amiri">{errors.confirmPassword}</p>
              </div>
            </div>

            {/* زر إنشاء حساب */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full h-14 flex justify-center items-center font-bold text-xl rounded-xl transition-all font-amiri shadow-md mt-6
                ${(isFormValid && !isLoading)
                  ? 'bg-[#3b2012] text-white hover:bg-[#5c3d2e] cursor-pointer'
                  : 'bg-[#bcaaa0] text-gray-100 cursor-not-allowed'
                }`}
            >
              {isLoading ? (
                <i className="fa-solid fa-circle-notch fa-spin -mr-1 ml-3 text-xl"></i>
              ) : null}
              {isLoading ? 'جاري الإنشاء...' : 'انضم إلينا'}
            </button>

          </form>

          {/* الرابط لصفحة الدخول */}
          <p className="text-center text-lg text-[#9c7b65] mt-8 font-amiri">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-[#6b4c3b] font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </p>

        </div>
      </div>

      {/* الصورة - يسار */}
      <div className="relative hidden lg:block border-r border-[#e0d5c8]/50 lg:order-2">
        <Image
          src="/images/login-art.jpg"
          alt="فن أثر"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

    </div>
  );
}
