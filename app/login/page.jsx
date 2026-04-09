"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
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
          error = 'يجب أن تكون كلمة المرور 8 أحرف على الأقل';
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
      const error = validateField(key, data[key]);
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
          nextErrors[key] = validateField(key, formData[key]);
        }
      });
      return nextErrors;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, touched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (loginError) setLoginError('');
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    const checkErrors = validateAll();
    setErrors(checkErrors);

    if (Object.keys(checkErrors).length === 0) {
      setIsLoading(true);
      
      // Simulation of a login process
      setTimeout(() => {
        setIsLoading(false);
        // For demonstration purposes, if password is "password123", we show an error
        if (formData.password === 'password123') {
          setLoginError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        } else {
          console.log('تم الدخول بنجاح:', formData);
          
          // محاكاة بيانات المستخدم (في الحقيقة تأتي من السيرفر)
          const namePart = formData.email.split('@')[0] || 'مستخدم';
          const mockUser = {
            firstName: namePart,
            lastName: '',
            email: formData.email
          };
          
          login(mockUser);
          router.push('/');
        }
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
              مرحباً بعودتك إلى <span className="text-[#6b4c3b] font-bold">أثر</span>
            </h1>
            <p className="text-[#9c7b65] text-lg font-amiri">
              قم بتسجيل الدخول لاستكشاف أحدث اللوحات والأعمال الفنية الحصرية.
            </p>
          </div>

          {/* الفورم */}
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>

            {/* البريد الإلكتروني */}
            <Input
              name="email"
              type="email"
              label="البريد الإلكتروني"
              placeholder="batool@gmail.com"
              dir="ltr"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              icon={<i className="fa-regular fa-envelope"></i>}
            />

            {/* كلمة المرور */}
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="كلمة المرور"
              labelExtra={
                <Link href="/forgot-password" size="sm" className="text-sm text-[#6b4c3b] hover:font-bold hover:underline transition-all font-amiri">
                  هل نسيت كلمة المرور؟
                </Link>
              }
              placeholder="••••••••"
              dir="ltr"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              icon={<i className="fa-solid fa-lock"></i>}
              leftIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#9c7b65] hover:text-[#3b2012] transition-colors"
                >
                  {showPassword ? <i className="fa-regular fa-eye-slash"></i> : <i className="fa-regular fa-eye"></i>}
                </button>
              }
            />

            {/* رسالة الخطأ العامة */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 animate-shake font-amiri">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span className="text-sm font-bold">{loginError}</span>
              </div>
            )}

            {/* زر الدخول */}
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
              {isLoading ? 'جاري الدخول...' : 'دخول'}
            </button>

          </form>

          {/* رابط إنشاء حساب */}
          <p className="text-center text-lg text-[#9c7b65] mt-8 font-amiri">
            ليس لديك حساب بعد؟{' '}
            <Link href="/signup" className="text-[#6b4c3b] font-bold hover:underline">
              أنشئ حساباً جديداً
            </Link>
          </p>

        </div>
      </div>

      {/* الصورة - يسار */}
      <div className="relative hidden lg:block border-r border-[#e0d5c8]/50 lg:order-2">
        <Image
          src="/images/login-art.png"
          alt="فن أثر"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

    </div>
  );
}
