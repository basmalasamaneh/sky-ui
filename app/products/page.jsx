"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductsPage() {
  const { isAuthenticated } = useAuth();
  const [works, setWorks] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  
  // Slider states
  const [activeSliderWork, setActiveSliderWork] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Filters
  const [activeCategory, setActiveCategory] = useState('الكل');

  // Close slider on escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeSlider();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const openSlider = (work) => {
    setActiveSliderWork(work);
    setCurrentSlideIndex(0);
  };

  const closeSlider = () => {
    setActiveSliderWork(null);
  };

  const nextSlide = () => {
    if (!activeSliderWork) return;
    setCurrentSlideIndex((prev) => 
      prev === (activeSliderWork.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    if (!activeSliderWork) return;
    setCurrentSlideIndex((prev) => 
      prev === 0 ? (activeSliderWork.images?.length || 1) - 1 : prev - 1
    );
  };

  useEffect(() => {
    const fetchAllWorks = async () => {
      setIsFetching(true);
      
      let fetchedWorks = [];
      try {
        const res = await fetch('/api/works');
        const result = await res.json();
        if (res.ok && result.data && result.data.length > 0) {
          fetchedWorks = result.data;
        }
      } catch (e) {
        console.warn('Backend route missing or network error. Using mock data for public gallery.');
      }

      if (fetchedWorks.length === 0) {
        // Dummy placeholder data for global gallery
        fetchedWorks = [
          {
            id: '1',
            title: 'تجريد الألوان',
            description: 'لوحة زيتية تجريدية تعبر عن تداخل المشاعر والألوان في مشهد فني فريد.',
            category: 'لوحات فنية',
            artistName: 'خالد التميمي',
            artistAvatar: 'خ',
            artistPhone: '0599123456',
            location: 'القدس',
            price: '١٢٠',
            images: [
              'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800',
              'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800',
              'https://images.unsplash.com/photo-1501472312651-726afe119ff1?auto=format&fit=crop&q=80&w=800'
            ],
            mainImageIndex: 0,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'صمت الحجر',
            description: 'منحوتة يدوية من الرخام الصافي تجسد الهدوء والتأمل.',
            category: 'نحت ومجسمات',
            artistName: 'منى عبدالكريم',
            artistAvatar: 'م',
            artistPhone: '0598765432',
            location: 'نابلس',
            price: '٤٥٠',
            images: [
              'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800',
              'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800'
            ],
            mainImageIndex: 1,
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            title: 'خطوط عربية ذهبية',
            description: 'مخطوطة كلاسيكية بخط الثلث مطعمة بماء الذهب الصافي.',
            category: 'خط عربي',
            artistName: 'سعيد القحطاني',
            artistAvatar: 'س',
            artistPhone: '0567111222',
            location: 'رام الله',
            price: '٣٠٠',
            images: [
              'https://images.unsplash.com/photo-1580211110825-f09fd7ad0487?auto=format&fit=crop&q=80&w=800'
            ],
            mainImageIndex: 0,
            createdAt: new Date().toISOString()
          },
          {
            id: '4',
            title: 'مزهرية طينية تراثية',
            description: 'مزهرية مصنوعة يدوياً من طين المنطقة الوسطى بنقوش نجدية.',
            category: 'خزف وفخار',
            artistName: 'نورة العتيبي',
            artistAvatar: 'ن',
            artistPhone: '0592333444',
            location: 'الخليل',
            price: '٨٥',
            images: [
              'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800'
            ],
            mainImageIndex: 0,
            createdAt: new Date().toISOString()
          },
          {
            id: '5',
            title: 'المشهد الفلسطيني',
            description: 'لوحة فنية تنبض بالجمال تجسد الريف الفلسطيني بأشجار الزيتون والعمارة التقليدية. هذه القطعة تجسد جوهر التراث الفلسطيني والجمال الطبيعي للبلاد.',
            category: 'لوحات فنية',
            artistName: 'فادي القدومي',
            artistAvatar: 'ف',
            artistPhone: '0595123456',
            location: 'نابلس',
            price: '250',
            images: [
              'https://images.unsplash.com/photo-1551817958-c19601d4ad7d?auto=format&fit=crop&q=80&w=800',
              'https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&q=80&w=800'
            ],
            mainImageIndex: 0,
            createdAt: new Date().toISOString()
          }
        ];
      }

      // Merge with local mock data to see local additions directly
      try {
        const localMockStr = localStorage.getItem('mockWorks');
        if (localMockStr) {
          const localMock = JSON.parse(localMockStr);
          // Add default artist properties to local mock works
          const decoratedLocalMock = localMock.map(work => ({
            ...work,
            artistName: work.artistName || 'أنت',
            artistAvatar: work.artistName ? work.artistName.charAt(0) : 'أ',
            price: work.price || 'غير محدد',
            artistLocation: work.artistLocation || 'غير محدد',
            category: work.category || 'متنوع'
          }));
          
          fetchedWorks = [...decoratedLocalMock, ...fetchedWorks];
        }
      } catch (e) {
        console.error('Failed to load local works', e);
      }

      setWorks(fetchedWorks);
      setIsFetching(false);
    };

    fetchAllWorks();
  }, []);

  const categoryMapping = {
    'لوحات فنية': 'لوحات فنية',
    'تطريز فلسطيني': 'تطريز فلسطيني',
    'خزف وفخار': 'خزف وفخار',
    'خط عربي': 'خط عربي',
    'تصوير فوتوغرافي': 'تصوير فوتوغرافي',
    'نحت ومجسمات': 'نحت ومجسمات'
  };

  const filteredWorks = activeCategory === 'الكل' 
    ? works 
    : works.filter(w => (categoryMapping[w.category] || w.category) === activeCategory);

  const categories = ['الكل', 'لوحات فنية', 'تطريز فلسطيني', 'خزف وفخار', 'خط عربي', 'تصوير فوتوغرافي', 'نحت ومجسمات'];

  return (
    <div className="min-h-screen bg-[#fdfaf7] font-amiri" dir="rtl">
      <Header />
      
      <div className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#3b2012] font-art mb-4">معرض أثر</h1>
          <p className="text-[#9c7b65] text-lg md:text-xl max-w-2xl mx-auto">
            اكتشف أروع الإبداعات الفنية من مجتمع الفنانين في أثر. تصفح، وتأمل، واقتنِ ما يلامس روحك.
          </p>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 shadow-sm ${
                activeCategory === cat 
                ? 'bg-brown-gradient text-white scale-105' 
                : 'bg-white text-[#9c7b65] border border-[#e8dcc4] hover:border-[#6b4c3b] hover:text-[#3b2012]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {isFetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-3xl h-[420px] animate-pulse border border-[#e8dcc4] p-3 flex flex-col">
                <div className="w-full h-56 bg-gray-200 rounded-2xl mb-4"></div>
                <div className="px-2 space-y-3">
                  <div className="w-3/4 h-5 bg-gray-200 rounded-full"></div>
                  <div className="w-1/2 h-4 bg-gray-200 rounded-full"></div>
                  <div className="w-full h-8 bg-gray-200 rounded-xl mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredWorks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredWorks.map((work, index) => (
                <motion.div
                  key={work.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (index % 10) * 0.05 }}
                  onClick={() => isAuthenticated && openSlider(work)}
                  className={`group bg-white rounded-3xl overflow-hidden border border-[#e8dcc4] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] hover:shadow-xl transition-all duration-500 flex flex-col ${isAuthenticated ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div 
                    className="relative h-64 overflow-hidden m-2 rounded-2xl"
                  >
                    <Image
                      src={work.images?.[work.mainImageIndex || 0] || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800'}
                      alt={work.title}
                      fill
                      className={`object-cover transition-transform duration-700 ${isAuthenticated ? 'group-hover:scale-110' : ''}`}
                    />
                    
                    {work.images?.length > 1 && (
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                        <i className="fa-solid fa-layer-group"></i>
                        <span>{work.images.length}</span>
                      </div>
                    )}

                    {isAuthenticated && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                         <div className="self-end bg-white/20 backdrop-blur-md border border-white/30 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-white hover:text-[#3b2012] transition-colors mb-2">
                           <i className="fa-solid fa-expand text-sm"></i>
                         </div>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-[#3b2012] mb-4 line-clamp-1">{work.title}</h3>
                    
                    <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4" onClick={(e) => e.stopPropagation()}>
                      <span className="font-bold text-lg text-[#3b2012]">
                        {work.price ? `${work.price} ₪` : 'متاح للعرض'}
                      </span>
                      <button className="bg-[#f0ece6] text-[#5c4436] hover:bg-[#5c4436] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                        إضافة للسلة
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-[#e8dcc4] text-center">
            <i className="fa-regular fa-folder-open text-6xl text-[#ceb29f] mb-4"></i>
            <h3 className="text-2xl font-bold text-[#3b2012] font-art mb-2">لا توجد أعمال لعرضها</h3>
            <p className="text-[#9c7b65]">حاول تصفح قسم آخر أو العودة لاحقاً لاكتشاف إبداعات جديدة.</p>
          </div>
        )}

        {/* Global Product Detail Modal */}
        <AnimatePresence>
          {activeSliderWork && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row relative"
              >
                {/* Close Button */}
                <button 
                  onClick={closeSlider}
                  className="absolute top-6 left-6 z-50 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-[#3b2012] shadow-md transition-all active:scale-95"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>

                {/* Left Side: Image Gallery */}
                <div className="md:w-1/2 bg-[#fdfaf7] relative h-[40vh] md:h-auto border-l border-[#e8dcc4]/50">
                  <div className="relative w-full h-full p-4 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={currentSlideIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="relative w-full h-full"
                      >
                        <Image
                          src={activeSliderWork.images?.[currentSlideIndex] || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800'}
                          alt={activeSliderWork.title}
                          fill
                          className="object-contain"
                        />
                      </motion.div>
                    </AnimatePresence>

                    {activeSliderWork.images?.length > 1 && (
                      <>
                        <button 
                          onClick={prevSlide}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/50 hover:bg-white rounded-full flex items-center justify-center shadow-sm text-[#3b2012] transition-all"
                        >
                          <i className="fa-solid fa-chevron-right"></i>
                        </button>
                        <button 
                          onClick={nextSlide}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/50 hover:bg-white rounded-full flex items-center justify-center shadow-sm text-[#3b2012] transition-all"
                        >
                          <i className="fa-solid fa-chevron-left"></i>
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnails */}
                  {activeSliderWork.images?.length > 1 && (
                    <div className="absolute bottom-6 left-0 w-full flex justify-center gap-2 px-4 overflow-x-auto no-scrollbar">
                      {activeSliderWork.images.map((img, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${currentSlideIndex === idx ? 'border-amber-600 scale-110' : 'border-transparent opacity-60'}`}
                        >
                          <Image src={img} alt="thumb" width={48} height={48} className="object-cover w-full h-full" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Side: Details / Protected Content */}
                <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto bg-white flex flex-col h-full overflow-y-auto no-scrollbar">
                  {!isAuthenticated ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in">
                      <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 shadow-inner">
                        <i className="fa-solid fa-user-lock text-4xl"></i>
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-3xl font-bold text-[#3b2012] font-art">محتوى للأعضاء فقط</h2>
                        <p className="text-[#9c7b65] text-lg leading-relaxed font-amiri max-w-sm mx-auto">
                          لرؤية كامل تفاصيل العمل الفني، اسم الفنان، موقعه، ورقم التواصل، يرجى إنشاء حساب أو تسجيل الدخول.
                        </p>
                      </div>
                      <div className="flex flex-col w-full gap-4 pt-4">
                        <Link 
                          href="/signup" 
                          className="w-full h-14 bg-brown-gradient rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg hover:opacity-90 active:scale-95 transition-all"
                        >
                          إنشاء حساب جديد
                        </Link>
                        <Link 
                          href="/login" 
                          className="w-full text-[#6b4c3b] font-bold hover:underline"
                        >
                          لديك حساب؟ سجل دخولك
                        </Link>
                      </div>
                      <div className="pt-8 border-t border-gray-100 w-full">
                         <div className="flex items-center justify-center gap-6 opacity-30">
                            <i className="fa-solid fa-palette text-2xl"></i>
                            <i className="fa-solid fa-brush text-2xl"></i>
                            <i className="fa-solid fa-gem text-2xl"></i>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-fade-in">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <i className="fa-solid fa-tag text-[8px]"></i>
                            <span>الفئة: {categoryMapping[activeSliderWork.category] || activeSliderWork.category || 'متنوع'}</span>
                          </span>
                        </div>
                        <h2 className="text-4xl font-bold text-[#3b2012] font-art leading-tight">
                          {activeSliderWork.title}
                        </h2>
                      </div>

                      <div className="p-6 bg-[#fdfaf7] rounded-[2rem] border border-[#e8dcc4]/50 space-y-6">
                        {/* Artist Box */}
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-brown-gradient rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                            {activeSliderWork.artistAvatar || (activeSliderWork.artistName ? activeSliderWork.artistName.charAt(0) : 'ف')}
                          </div>
                          <div className="flex-1">
                             <p className="text-xs text-[#9c7b65] mb-0.5">الفنان المبدع</p>
                             <p className="text-lg font-bold text-[#3b2012]">{activeSliderWork.artistName || 'غير متوفر'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-2xl border border-[#e8dcc4]/30 shadow-sm flex items-center gap-3 group">
                             <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                               <i className="fa-solid fa-location-dot"></i>
                             </div>
                             <div>
                                <p className="text-[10px] text-gray-400">الموقع</p>
                                <p className="text-sm font-bold text-[#3b2012]">{activeSliderWork.artistLocation || activeSliderWork.location || 'نابلس، فلسطين'}</p>
                             </div>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-[#e8dcc4]/30 shadow-sm flex items-center gap-3 group">
                             <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
                               <i className="fa-solid fa-phone"></i>
                             </div>
                             <div>
                                <p className="text-[10px] text-gray-400">رقم التواصل</p>
                                <p className="text-sm font-bold text-[#3b2012] font-mono tracking-wider" dir="ltr">{activeSliderWork.artistPhone || '059xxxxxxx'}</p>
                             </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-bold text-[#3b2012] flex items-center gap-2">
                           <i className="fa-solid fa-align-right text-amber-600 text-sm"></i>
                           عن العمل الفني
                        </h4>
                        <p className="text-[#9c7b65] text-lg leading-relaxed font-amiri">
                          {activeSliderWork.description}
                        </p>
                      </div>

                      <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
                         <div className="space-y-1">
                            <p className="text-xs text-gray-400 font-bold">السعر المطلوب</p>
                            <p className="text-3xl font-black text-[#3b2012]">
                              {activeSliderWork.price ? `${activeSliderWork.price} ₪` : 'حسب الطلب'}
                            </p>
                         </div>
                         <button className="h-14 px-10 bg-[#3b2012] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-[#5c3d2e] transition-all active:scale-95 group">
                            <span>إضافة للسلة</span>
                            <i className="fa-solid fa-bag-shopping transition-transform group-hover:-translate-y-1"></i>
                         </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
