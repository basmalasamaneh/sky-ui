"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function EditWorkPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workId = params.id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    quantity: ''
  });

  const [images, setImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Load existing work data
  useEffect(() => {
    if (!workId) return;

    // Simulate fetching the work to edit
    const fetchWorkData = async () => {
      // First try local storage (for locally added mock works)
      const localMockStr = localStorage.getItem('mockWorks');
      let foundWork = null;
      if (localMockStr) {
        const localMock = JSON.parse(localMockStr);
        foundWork = localMock.find(w => w.id === workId);
      }

      // If not in local storage, check dummy data logic
      if (!foundWork) {
         // Fake hardcoded elements
         if (workId === '1') {
           foundWork = {
              id: '1',
              title: 'تجريد الألوان',
              description: 'لوحة زيتية تجريدية تعبر عن تداخل المشاعر والألوان في مشهد فني فريد.',
              images: [
                'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1501472312651-726afe119ff1?auto=format&fit=crop&q=80&w=800'
              ],
              mainImageIndex: 0
           };
         } else if (workId === '2') {
           foundWork = {
              id: '2',
              title: 'صمت الحجر',
              description: 'منحوتة يدوية من الرخام الصافي تجسد الهدوء والتأمل.',
              images: [
                'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800'
              ],
              mainImageIndex: 1
           };
         } else {
             // Fallback API try
            try {
              const res = await fetch(`/api/works/${workId}`, {
                 headers: { 'Authorization': `Bearer ${token}` }
              });
              const data = await res.json();
              if (res.ok && data.data) foundWork = data.data;
            } catch (e) {
               console.warn("Could not fetch from backend");
            }
         }
      }

      if (foundWork) {
        setFormData({ 
          title: foundWork.title, 
          description: foundWork.description, 
          category: foundWork.category || '',
          price: foundWork.price || '',
          quantity: foundWork.quantity || ''
        });
        setMainImageIndex(foundWork.mainImageIndex || 0);

        // For existing URLs, we fake a "file" object so the preview works similarly
        if (foundWork.images && foundWork.images.length > 0) {
            setImages(foundWork.images.map(img => ({
                isExisting: true, // flag to indicate it's not a local file
                preview: img,
                file: null
            })));
        }
      } else {
         setSubmitMessage({ type: 'error', text: 'لم يتم العثور على العمل المطلوب للتعديل.' });
      }

      setIsPageLoading(false);
    };

    fetchWorkData();
  }, [workId, token]);

  // حماية الصفحة
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) router.push('/login');
      else if (user?.role !== 'artist') router.push('/');
    }
  }, [isAuthenticated, isLoading, router, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (images.length + files.length > 5) {
      setSubmitMessage({ type: 'error', text: 'يمكنك رفع 5 صور كحد أقصى للعمل الواحد.' });
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    if (mainImageIndex === indexToRemove) {
      setMainImageIndex(0);
    } else if (mainImageIndex > indexToRemove) {
      setMainImageIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('price', formData.price);
      data.append('quantity', formData.quantity);
      data.append('mainImageIndex', mainImageIndex);
      
      // We would append files and existing URLs properly to real backend
      images.forEach((img) => {
        if (img.file) data.append('images', img.file);
        else data.append('existingImages', img.preview);
      });

      const res = await fetch(`/api/works/${workId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data,
      });

      let result = {};
      try { result = await res.json(); } catch (e) {
          // Backend missing handling
          if (!res.ok) result = { success: true };
      }

      if (!res.ok && res.status !== 404) {
        setSubmitMessage({ type: 'error', text: result.message || 'حدث خطأ أثناء تعديل العمل הפني.' });
        return;
      }

      // --- MOCK SAVE for Edit Demo ---
      try {
        const processedImages = await Promise.all(images.map(img => {
          if (img.isExisting) return img.preview;
          
          return new Promise((resolve) => {
             const reader = new FileReader();
             reader.onload = () => resolve(reader.result);
             reader.readAsDataURL(img.file);
          });
        }));

        const updatedWork = {
          id: workId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: formData.price,
          quantity: formData.quantity,
          mainImageIndex: mainImageIndex,
          images: processedImages,
          updatedAt: new Date().toISOString()
        };

        const existingStr = localStorage.getItem('mockWorks') || '[]';
        let existingWorks = JSON.parse(existingStr);
        
        const workIndex = existingWorks.findIndex(w => w.id === workId);
        if (workIndex >= 0) {
            existingWorks[workIndex] = { ...existingWorks[workIndex], ...updatedWork };
        } else {
            // It might have been a hardcoded one we're duplicating to "override"
            existingWorks = [updatedWork, ...existingWorks];
        }

        localStorage.setItem('mockWorks', JSON.stringify(existingWorks));
      } catch (err) { console.error('Local mock save failed', err); }

      setSubmitMessage({ type: 'success', text: 'تم تعديل العمل הפني بنجاح!' });
      setTimeout(() => router.push('/works/my'), 2000);
    } catch (err) {
      console.error('Update work failed:', err);
      setSubmitMessage({ type: 'error', text: 'حدث خطأ أثناء تعديل العمل.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated || user?.role !== 'artist' || isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf7]">
        <div className="w-12 h-12 border-4 border-[#3b2012] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf7] py-28 px-4 md:px-8 font-amiri" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/works/my"
          className="inline-flex items-center gap-2 text-[#9c7b65] hover:text-[#3b2012] mb-10 transition-colors font-bold group"
        >
          <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
          العودة لمعرضي الفني
        </Link>

        <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-[#e8dcc4] shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brown-gradient opacity-5 rounded-bl-full"></div>
          
          <div className="flex flex-col items-center mb-12">
            <div className="w-20 h-20 bg-brown-gradient rounded-full flex items-center justify-center text-white text-3xl mb-6 shadow-xl border-4 border-white ring-4 ring-[#fdfaf7]">
              <i className="fa-solid fa-pen-to-square"></i>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#3b2012] font-art mb-2">تعديل العمل الفني</h1>
            <p className="text-[#9c7b65] text-center max-w-md">قم بتحديث تفاصيل عملك أو إضافة صور جديدة.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-[#3b2012] mb-3 pr-2">عنوان العمل הפني <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <input 
                    type="text" name="title" required value={formData.title} onChange={handleInputChange}
                    className="w-full h-14 bg-[#fdfaf7] border border-[#e8dcc4] rounded-2xl px-5 text-[#3b2012] outline-none focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] transition-all font-bold"
                  />
                  <i className="fa-solid fa-pen absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"></i>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#3b2012] mb-3 pr-2 flex justify-between items-center">
                  <span>وصف العمل <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-gray-400 font-normal">{formData.description.length} / 500</span>
                </label>
                <div className="relative">
                  <textarea 
                    name="description" required value={formData.description} maxLength={500} onChange={handleInputChange} rows="5"
                    className="w-full bg-[#fdfaf7] border border-[#e8dcc4] rounded-2xl px-5 py-4 text-[#3b2012] outline-none focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] transition-all resize-none font-amiri"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#3b2012] mb-3 pr-2">الفئة <span className="text-red-500">*</span></label>
                  <select 
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full h-14 bg-[#fdfaf7] border border-[#e8dcc4] rounded-2xl px-5 text-[#3b2012] outline-none focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] transition-all font-bold appearance-none relative"
                  >
                    <option value="">اختر الفئة</option>
                    <option value="لوحات فنية">لوحات فنية</option>
                    <option value="تطريز فلسطيني">تطريز فلسطيني</option>
                    <option value="خزف وفخار">خزف وفخار</option>
                    <option value="خط عربي">خط عربي</option>
                    <option value="تصوير فوتوغرافي">تصوير فوتوغرافي</option>
                    <option value="نحت ومجسمات">نحت ومجسمات</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#3b2012] mb-3 pr-2">الكمية المتوفرة <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    name="quantity"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full h-14 bg-[#fdfaf7] border border-[#e8dcc4] rounded-2xl px-5 text-[#3b2012] outline-none focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] transition-all font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#3b2012] mb-3 pr-2">السعر (بالشيكل) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="number" 
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="مثال: 150"
                    className="w-full h-14 bg-[#fdfaf7] border border-[#e8dcc4] rounded-2xl px-5 text-[#3b2012] outline-none focus:ring-2 focus:ring-[#5c4436]/20 focus:border-[#5c4436] transition-all font-bold"
                  />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₪</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#3b2012] mb-3 pr-2">صور العمل الفني <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <input 
                    type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload"
                  />
                  <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 bg-[#fdfaf7] border-2 border-dashed border-[#e8dcc4] rounded-2xl cursor-pointer hover:bg-[#f0ece6] transition-colors group-hover:border-[#5c4436]">
                    <i className="fa-solid fa-cloud-arrow-up text-3xl text-[#9c7b65] mb-2 group-hover:scale-110 transition-transform"></i>
                    <span className="text-sm font-bold text-[#3b2012]">إضافة مزيد من الصور (المجموع: 1-5)</span>
                    <span className="text-xs text-gray-400 mt-1">المتبقي: {5 - images.length}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col h-full mt-4 lg:mt-0">
              <label className="block text-sm font-bold text-[#3b2012] mb-3 pr-2 flex items-center gap-2">
                <i className="fa-solid fa-images text-[#9c7b65]"></i>
                معاينة واختيار صورة العرض
              </label>
              
              <div className="flex-1 bg-[#fdfaf7] rounded-[2rem] border-2 border-dashed border-[#e8dcc4] p-4 flex flex-col relative min-h-[400px]">
                {images.length > 0 ? (
                  <div className="flex flex-col h-full gap-4">
                    <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-md shrink-0">
                      <Image src={images[mainImageIndex]?.preview || images[0]?.preview} alt="Main Preview" fill className="object-cover" />
                      <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        <i className="fa-solid fa-star"></i> صورة العرض الأساسية
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                        <h4 className="text-white font-bold text-xl mb-1">{formData.title || 'عنوان العمل'}</h4>
                      </div>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                      {images.map((img, idx) => (
                        <div 
                          key={idx} onClick={() => setMainImageIndex(idx)}
                          className={`relative w-24 h-24 rounded-xl overflow-hidden shrink-0 cursor-pointer border-4 transition-all ${mainImageIndex === idx ? 'border-amber-500 shadow-md scale-105' : 'border-transparent hover:border-[#e8dcc4]'}`}
                        >
                          <Image src={img.preview} alt={`Thumb ${idx}`} fill className="object-cover" />
                          <button 
                            type="button" onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                            className="absolute top-1 left-1 w-6 h-6 bg-red-500/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] transition-colors"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[#ceb29f]">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-[#e8dcc4]/50">
                      <i className="fa-regular fa-images text-4xl"></i>
                    </div>
                    <p className="text-sm font-bold font-art text-[#9c7b65]">لا توجد صور لهذا العمل</p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 pt-8 border-t border-[#f0ece6] mt-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                  <button
                    type="submit" disabled={isSubmitting || !formData.title || images.length === 0}
                    className="w-full sm:w-auto min-w-[250px] h-14 bg-brown-gradient text-white rounded-2xl font-bold font-art text-lg shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <><i className="fa-solid fa-check"></i> حفظ التعديلات</>
                    )}
                  </button>
                  <Link href="/works/my" className="w-full sm:w-auto text-center text-[#9c7b65] font-bold hover:text-[#3b2012] bg-[#f0ece6] hover:bg-[#e8dcc4] px-8 py-4 rounded-2xl transition-colors">
                    إلغاء
                  </Link>
                </div>

                {submitMessage.text && (
                  <motion.div className={`flex items-center gap-3 px-6 py-3 rounded-xl border font-bold text-sm ${submitMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {submitMessage.text}
                  </motion.div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
