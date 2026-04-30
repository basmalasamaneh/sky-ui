"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { login } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(60);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    
    if (error) setError('');
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('يرجى إدخال الرمز كاملاً');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        if (result.data?.user) {
          setTimeout(() => {
            login(result.data.user, result.data?.token);
            router.push('/');
          }, 2000);
        }
      } else {
        setError(result.message || 'الرمز غير صحيح أو منتهي الصلاحية');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;

    setIsResending(true);
    setError('');

    try {
      const response = await fetch('/api/v1/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setTimer(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0].focus();
      } else {
        const result = await response.json();
        setError(result.message || 'فشل إعادة إرسال الرمز');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setIsResending(false);
    }
  };

  // Auto submit when all digits are entered
  useEffect(() => {
    if (otp.every(digit => digit !== '') && otp.join('').length === 6) {
      handleSubmit();
    }
  }, [otp]);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2" dir="rtl">
      
      {/* Content - Right */}
      <div className="flex items-center justify-center bg-[#f5f0eb] dark:bg-black px-8 py-16 lg:order-1 pt-24">
        <div className="w-full max-w-md">
          
          <div className="mb-10 text-center lg:text-right animate-fade-in">
            <h1 className="text-5xl text-[#3b2012] dark:text-[#e8dcc4] mb-4 leading-tight">
              تفعيل <span className="text-[#6b4c3b] dark:text-[#c4a993] font-bold">الحساب</span>
            </h1>
            <p className="text-[#9c7b65] dark:text-[#e8dcc4]/80 text-lg">
              أدخل الرمز المكون من 6 أرقام المرسل إلى <span className="font-bold text-[#3b2012] dark:text-[#e8dcc4]">{email}</span>
            </p>
          </div>

          {success ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 p-8 rounded-3xl text-center animate-bounce-in">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                <i className="fa-solid fa-check text-4xl text-white"></i>
              </div>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">تم التفعيل بنجاح!</h2>
              <p className="text-green-600/80 dark:text-green-400/80">جاري توجيهك إلى المتجر...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-between gap-2" dir="ltr">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    className={`w-full aspect-square text-center text-3xl font-bold rounded-2xl border-2 transition-all outline-none
                      ${error 
                        ? 'border-red-300 bg-red-50 text-red-600 focus:border-red-500' 
                        : 'border-[#e0d5c8] bg-white dark:bg-zinc-900 text-[#3b2012] dark:text-[#e8dcc4] focus:border-[#6b4c3b] dark:focus:border-[#c4a993] focus:ring-4 focus:ring-[#6b4c3b]/10'
                      }`}
                  />
                ))}
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 animate-shake">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span className="text-sm font-bold">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.some(d => d === '')}
                className={`w-full h-14 flex justify-center items-center font-bold text-xl rounded-xl transition-all shadow-md
                  ${(!isLoading && otp.every(d => d !== ''))
                    ? 'bg-[#3b2012] dark:bg-[#c4a993] text-white dark:text-black hover:bg-[#5c3d2e] dark:hover:bg-[#d6c5b5] cursor-pointer'
                    : 'bg-[#bcaaa0] dark:bg-[#4a3728] text-gray-100 dark:text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isLoading ? <i className="fa-solid fa-circle-notch fa-spin ml-3"></i> : null}
                {isLoading ? 'جاري التحقق...' : 'تفعيل الحساب'}
              </button>

              <div className="text-center">
                <p className="text-[#9c7b65] dark:text-[#e8dcc4]/60 mb-2 text-lg">
                  لم يصلك الرمز؟
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={timer > 0 || isResending}
                  className={`font-bold text-lg transition-all ${timer > 0 || isResending ? 'text-gray-400 cursor-not-allowed' : 'text-[#6b4c3b] dark:text-[#c4a993] hover:underline'}`}
                >
                  {isResending ? 'جاري الإرسال...' : timer > 0 ? `إعادة الإرسال خلال ${timer} ثانية` : 'إعادة إرسال الرمز'}
                </button>
              </div>

              <div className="pt-4 text-center border-t border-[#e0d5c8] dark:border-zinc-800">
                <Link href="/login" className="text-[#9c7b65] dark:text-[#e8dcc4]/60 hover:text-[#3b2012] dark:hover:text-[#e8dcc4] transition-colors flex items-center justify-center gap-2">
                  <i className="fa-solid fa-arrow-right"></i>
                  <span>العودة لتسجيل الدخول</span>
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* Image - Left */}
      <div className="relative hidden lg:block border-r border-[#e0d5c8]/50 dark:border-gray-800 lg:order-2">
        <Image
          src="/images/login-art.png"
          alt="فن أثر"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10 dark:bg-black/40"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
           <div className="text-white text-center space-y-4 animate-fade-in-up">
              <h2 className="text-6xl font-serif italic">الأصالة تبدأ من هنا</h2>
              <p className="text-xl text-white/80">خطوة واحدة تفصلك عن عالم من الإبداع</p>
           </div>
        </div>
      </div>

    </div>
  );
}
