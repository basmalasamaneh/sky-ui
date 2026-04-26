'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

const STATUS_MAP = {
  pending: { label: 'بانتظار الموافقة', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: 'fa-clock' },
  approved: { label: 'تم القبول', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'fa-check-circle' },
  rejected: { label: 'مرفوض من قبل الفنان', color: 'bg-red-100 text-red-700 border-red-200', icon: 'fa-times-circle' },
  preparing: { label: 'قيد التجهيز', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: 'fa-box-open' },
  shipped: { label: 'تم الشحن', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: 'fa-truck' },
  delivered: { label: 'تم التسليم', color: 'bg-green-100 text-green-700 border-green-200', icon: 'fa-house-circle-check' },
  cancelled: { label: 'ملغي من قبل المشتري', color: 'bg-gray-100 text-gray-500 border-gray-200', icon: 'fa-ban' }
};

export default function OrdersDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('purchases');
  const [orders, setOrders] = useState({ purchases: [], sales: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isArtist, setIsArtist] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const res = await orderService.getMyOrders(user.id);
      if (res.status === 'success') {
        setOrders(res.data);
        setIsArtist(res.data.sales.length > 0 || localStorage.getItem('role') === 'artist');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('فشل في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await orderService.updateStatus(orderId, newStatus);
      if (res.status === 'success') {
        fetchOrders();
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert('حدث خطأ أثناء تحديث الحالة');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfaf7] dark:bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentOrders = activeTab === 'purchases' ? orders.purchases : orders.sales;

  return (
    <div className="min-h-screen bg-[#fdfaf7] dark:bg-black font-art pt-12 pb-20" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-12 text-center md:text-right">
          <h1 className="text-4xl font-bold text-[#3b2012] dark:text-[#e8dcc4] mb-2">
            {isArtist ? 'لوحة تحكم الفنان' : 'طلباتي'}
          </h1>
          <p className="text-[#9c7b65] dark:text-[#e8dcc4]/70">
            {isArtist 
              ? 'أهلاً بك مجدداً، تابع مبيعاتك الفنية وطلباتك الشرائية في مكان واحد' 
              : 'تابع حالة مشترياتك الفنية من مختلف الفنانين في أثر'}
          </p>
        </header>

        {isArtist && (
          <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
            <div className="flex gap-2 bg-white dark:bg-black p-1.5 rounded-2xl border border-[#e8dcc4]/30 shadow-sm w-full md:w-fit">
              <button 
                onClick={() => setActiveTab('purchases')}
                className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'purchases' ? 'bg-[#3b2012] text-white shadow-lg' : 'text-[#9c7b65] hover:bg-[#fdfaf7]'}`}
              >
                <i className="fa-solid fa-cart-shopping text-sm"></i>
                مشترياتي
              </button>
              <button 
                onClick={() => setActiveTab('sales')}
                className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'sales' ? 'bg-amber-600 text-white shadow-lg' : 'text-[#9c7b65] hover:bg-[#fdfaf7]'}`}
              >
                <i className="fa-solid fa-store text-sm"></i>
                مبيعاتي
              </button>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase">إجمالي المبيعات</p>
                <p className="text-xl font-black text-amber-600">{orders.sales.length}</p>
              </div>
              <div className="w-px h-8 bg-[#e8dcc4]/30"></div>
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase">طلبات نشطة</p>
                <p className="text-xl font-black text-[#3b2012] dark:text-[#e8dcc4]">
                  {orders.sales.filter(o => !['delivered', 'rejected'].includes(o.status)).length}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="wait">
            {currentOrders.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-black p-20 rounded-[3rem] border border-dashed border-[#e8dcc4] text-center space-y-6"
              >
                <div className="text-6xl text-[#e8dcc4]">
                  <i className="fa-solid fa-box-open"></i>
                </div>
                <p className="text-xl text-[#9c7b65]">لا يوجد طلبات حالياً</p>
                <Link href="/products" className="inline-block px-8 py-3 bg-amber-600 text-white rounded-xl font-bold">
                  تصفح المنتجات
                </Link>
              </motion.div>
            ) : activeTab === 'purchases' ? (
              // Buyer View: Grouped Orders
              currentOrders.map((group, gIdx) => (
                <motion.div 
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gIdx * 0.05 }}
                  className="bg-white dark:bg-black rounded-[3rem] border border-[#e8dcc4]/40 shadow-sm overflow-hidden mb-8"
                >
                  {/* Master Order Header */}
                  <div className="bg-[#3b2012] text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">
                        <i className="fa-solid fa-receipt"></i>
                      </div>
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-widest mb-1">طلب رئيسي رقم</p>
                        <h3 className="text-xl font-mono font-bold">#{group.id.slice(0, 8)}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 text-center md:text-right">
                      <div>
                        <p className="text-[10px] text-white/60 mb-1">التاريخ</p>
                        <p className="font-bold">{new Date(group.created_at).toLocaleDateString('ar-EG')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/60 mb-1">إجمالي الدفع</p>
                        <p className="text-xl font-black">{group.total_price} ₪</p>
                      </div>
                    </div>
                  </div>

                  {/* Child Orders List */}
                  <div className="p-6 md:p-8 space-y-6">
                    <p className="text-sm font-bold text-[#9c7b65] border-b border-[#e8dcc4]/20 pb-4 flex items-center gap-2">
                      <i className="fa-solid fa-store text-xs"></i>
                      {group.orders?.length === 1 
                        ? "يحتوي هذا الطلب على شحنة واحدة من فنان واحد:" 
                        : `يحتوي هذا الطلب على ${group.orders?.length} شحنات من فنانين مختلفين:`}
                    </p>
                    
                    {group.orders?.map((order) => (
                      <div key={order.id} className="bg-[#fdfaf7] dark:bg-black/20 rounded-[2rem] border border-[#e8dcc4]/30 overflow-hidden">
                        <div className="p-6 flex flex-col lg:flex-row gap-6">
                          {/* Artist & Status */}
                          <div className="lg:w-1/4 flex flex-col justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e8dcc4] text-[#6b4c3b] flex items-center justify-center font-bold text-lg shrink-0">
                                {order.artist?.profile_image ? (
                                  <Image src={order.artist.profile_image} alt="Artist" width={40} height={40} className="object-cover w-full h-full" />
                                ) : (
                                  <span>{(order.artist?.artist_name || order.artist?.first_name || '?').charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">الفنان</p>
                                <p className="text-sm font-bold text-[#3b2012] dark:text-[#e8dcc4]">{order.artist?.artist_name || order.artist?.first_name}</p>
                              </div>
                            </div>
                            <div className={`w-fit px-4 py-1.5 rounded-full border ${STATUS_MAP[order.status]?.color} text-[11px] font-bold flex items-center gap-2`}>
                              <i className={`fa-solid ${STATUS_MAP[order.status]?.icon}`}></i>
                              {STATUS_MAP[order.status]?.label}
                            </div>
                          </div>

                          {/* Items */}
                          <div className="lg:w-2/4 flex gap-4 overflow-x-auto no-scrollbar py-1">
                            {order.items?.map(item => (
                              <div key={item.id} className="flex items-center gap-3 bg-white dark:bg-black p-3 rounded-2xl border border-[#e8dcc4]/20 min-w-[220px]">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                                  <Image src={item.artwork?.image} alt={item.artwork?.title} fill className="object-cover" />
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-xs font-bold text-[#3b2012] dark:text-[#e8dcc4] truncate">{item.artwork?.title}</p>
                                  <p className="text-[10px] text-[#9c7b65]">الكمية: {item.quantity} × {item.price} ₪</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Actions */}
                          <div className="lg:w-1/4 flex flex-col justify-center border-t lg:border-t-0 lg:border-r border-[#e8dcc4]/30 pt-4 lg:pt-0 lg:pr-6">
                            <div className="flex items-center justify-between lg:block lg:space-y-3">
                              <p className="text-sm font-black text-[#3b2012] dark:text-[#e8dcc4] lg:mb-3">المجموع: {order.total_price} ₪</p>
                              
                              {order.status === 'shipped' ? (
                                <button 
                                  onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                  className="w-full py-2.5 bg-green-600 text-white rounded-xl text-[11px] font-bold hover:bg-green-700 transition-all shadow-lg"
                                >
                                  تأكيد الاستلام
                                </button>
                              ) : !['shipped', 'delivered', 'rejected', 'cancelled'].includes(order.status) ? (
                                <button 
                                  onClick={() => {
                                    if (window.confirm('هل أنت متأكد من رغبتك في إلغاء هذه الشحنة؟')) {
                                      handleStatusUpdate(order.id, 'cancelled')
                                    }
                                  }}
                                  className="w-full py-2.5 border border-red-100 text-red-500 rounded-xl text-[11px] font-bold hover:bg-red-50 transition-all"
                                >
                                  إلغاء الشحنة
                                </button>
                              ) : (order.status === 'rejected' || order.status === 'cancelled') && (
                                <div className="text-[10px] text-red-500 font-bold bg-red-50 px-3 py-2 rounded-lg">
                                  <i className="fa-solid fa-circle-exclamation ml-1"></i>
                                  تم إلغاء هذه الشحنة
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))
            ) : (
              // Artist View: Individual Sales
              currentOrders.map((order, idx) => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white dark:bg-black rounded-[2.5rem] border ${activeTab === 'sales' ? 'border-amber-200 shadow-md ring-1 ring-amber-500/10' : 'border-[#e8dcc4]/40 shadow-sm'} overflow-hidden transition-all hover:shadow-lg`}
                >
                  <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                    {/* Order Details */}
                    <div className="flex-1 space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          {activeTab === 'sales' && (
                            <div className="flex items-center gap-2 text-[8px] font-black text-amber-600 uppercase tracking-widest mb-2 bg-amber-50 w-fit px-2 py-0.5 rounded-full border border-amber-200">
                              <i className="fa-solid fa-star"></i>
                              إدارة مبيعاتك
                            </div>
                          )}
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">رقم الطلب</p>
                          <h3 className="text-lg font-mono font-bold text-[#3b2012] dark:text-[#e8dcc4]">#{order.id.slice(0, 8)}</h3>
                        </div>
                        <div className={`px-4 py-2 rounded-full border ${STATUS_MAP[order.status]?.color} text-sm font-bold flex items-center gap-2`}>
                          <i className={`fa-solid ${STATUS_MAP[order.status]?.icon}`}></i>
                          {STATUS_MAP[order.status]?.label}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-[#9c7b65] dark:text-[#e8dcc4]">
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-calendar text-amber-600/50"></i>
                          {new Date(order.created_at).toLocaleDateString('ar-EG')}
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-location-dot text-amber-600/50"></i>
                          {order.shipping_city}
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-money-bill-wave text-amber-600/50"></i>
                          {order.total_price} ₪
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-xs font-bold text-gray-400">المنتجات:</p>
                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                          {order.items.map(item => (
                            <div key={item.id} className="flex items-center gap-3 bg-[#fdfaf7] dark:bg-black/40 p-3 rounded-2xl border border-[#e8dcc4]/20 min-w-[200px]">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                                <Image src={item.artwork.image} alt={item.artwork.title} fill className="object-cover" />
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-xs font-bold text-[#3b2012] dark:text-[#e8dcc4] truncate">{item.artwork.title}</p>
                                <p className="text-[10px] text-[#9c7b65]">الكمية: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions / Info */}
                    <div className="w-full md:w-64 border-t md:border-t-0 md:border-r border-[#e8dcc4]/30 pt-6 md:pt-0 md:pr-8 flex flex-col justify-between">
                      <div className="space-y-4">
                        {activeTab === 'purchases' ? (
                          <div className="bg-[#fdfaf7] dark:bg-black/40 p-4 rounded-2xl border border-[#e8dcc4]/20">
                            <p className="text-[10px] text-gray-400 mb-2 uppercase">الفنان</p>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-50 shrink-0">
                                <Image src={order.artist?.profile_image || '/default-avatar.png'} alt="Artist" width={40} height={40} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#3b2012] dark:text-[#e8dcc4]">{order.artist?.artist_name || order.artist?.first_name}</p>
                                <p className="text-[10px] text-[#9c7b65]">فنان أثر</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-amber-50/30 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-200/50">
                            <p className="text-[10px] text-amber-800 dark:text-amber-400 mb-3 uppercase font-black tracking-tighter">تفاصيل المشتري</p>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                                  <i className="fa-solid fa-user"></i>
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-[#3b2012] dark:text-[#e8dcc4]">{order.user?.first_name} {order.user?.last_name}</p>
                                  <p className="text-[10px] text-amber-600 font-bold mb-1">الاسم عند التوصيل: {order.shipping_name}</p>
                                  <Link href={`tel:${order.shipping_phone}`} className="text-xs text-amber-700 hover:underline flex items-center gap-1">
                                    <i className="fa-solid fa-phone text-[8px]"></i>
                                    {order.shipping_phone}
                                  </Link>
                                </div>
                              </div>
                              <div className="pt-3 border-t border-amber-200/30">
                                <p className="text-[10px] text-amber-800/60 mb-1">عنوان الشحن</p>
                                <p className="text-xs text-[#3b2012] dark:text-[#e8dcc4] leading-relaxed font-medium break-words">
                                  <i className="fa-solid fa-location-arrow text-[10px] ml-1"></i>
                                  {order.shipping_city}، {order.shipping_address}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {activeTab === 'sales' && (
                        <div className="mt-6 pt-6 border-t border-[#e8dcc4]/20">
                          {order.status === 'pending' ? (
                            <div className="space-y-4">
                              <p className="text-[10px] text-amber-600 font-bold flex items-center gap-2">
                                <i className="fa-solid fa-circle-exclamation"></i>
                                طلب جديد بانتظار قرارك
                              </p>
                              <div className="grid grid-cols-2 gap-4">
                                <button 
                                  onClick={() => handleStatusUpdate(order.id, 'approved')}
                                  className="py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                                >
                                  <i className="fa-solid fa-check"></i>
                                  قبول الطلب
                                </button>
                                <button 
                                  onClick={() => handleStatusUpdate(order.id, 'rejected')}
                                  className="py-3 bg-white text-red-600 border border-red-100 hover:bg-red-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                                >
                                  <i className="fa-solid fa-xmark"></i>
                                  رفض
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">تحديث حالة التجهيز:</p>
                                {order.status === 'rejected' && (
                                  <span className="text-[10px] text-red-500 font-bold">هذا الطلب ملغي</span>
                                )}
                              </div>
                              <select 
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                disabled={order.status === 'delivered' || order.status === 'rejected' || order.status === 'cancelled'}
                                className="w-full p-3 bg-white dark:bg-black border border-[#e8dcc4] rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500/20 focus:outline-none appearance-none transition-all disabled:opacity-50"
                              >
                                <option value="approved">تم القبول (بانتظار التجهيز)</option>
                                <option value="preparing">قيد التجهيز</option>
                                <option value="shipped">تم الشحن</option>
                                <option value="delivered" disabled>تم تأكيد التسليم من قبل المشتري</option>
                                {order.status === 'rejected' && <option value="rejected" disabled>مرفوض</option>}
                                {order.status === 'cancelled' && <option value="cancelled" disabled>ملغي من قبل المشتري</option>}
                              </select>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'purchases' && (order.status === 'rejected' || order.status === 'cancelled') && (
                        <div className={`mt-6 p-4 ${order.status === 'rejected' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-gray-50 border-gray-100 text-gray-500'} border rounded-2xl flex items-center gap-3`}>
                          <i className={`fa-solid ${order.status === 'rejected' ? 'fa-circle-xmark' : 'fa-ban'} text-xl`}></i>
                          <div className="flex-1">
                            <p className="text-sm font-bold">{order.status === 'rejected' ? 'عذراً، تم رفض هذا الطلب' : 'تم إلغاء هذا الطلب'}</p>
                            <p className="text-xs opacity-70">
                              {order.status === 'rejected' 
                                ? 'تمت إعادة المنتجات إلى سلتك لتتمكن من شرائها مجدداً أو اختيار بديل.' 
                                : 'تم إلغاء الطلب بنجاح وتمت إعادة المنتجات إلى المخزن.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'purchases' && !['shipped', 'delivered', 'rejected', 'cancelled'].includes(order.status) && (
                        <button 
                          onClick={() => {
                            if (window.confirm('هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ سيتم استعادة المنتجات للمتجر.')) {
                              handleStatusUpdate(order.id, 'cancelled')
                            }
                          }}
                          className="mt-6 w-full py-3 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2 group"
                        >
                          <i className="fa-solid fa-ban group-hover:rotate-12 transition-transform"></i>
                          إلغاء الطلب
                        </button>
                      )}

                      {activeTab === 'purchases' && order.status === 'shipped' && (
                        <button 
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          className="mt-6 w-full py-3 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow-lg"
                        >
                          تأكيد الاستلام
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
