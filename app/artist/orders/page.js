'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const STATUS_MAP = {
  pending: { label: 'بانتظار الموافقة', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/30', icon: 'fa-clock' },
  approved: { label: 'تم القبول', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/30', icon: 'fa-check-circle' },
  rejected: { label: 'مرفوض', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/30', icon: 'fa-circle-xmark' },
  preparing: { label: 'قيد التجهيز', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/10 dark:text-indigo-400 dark:border-indigo-900/30', icon: 'fa-box-open' },
  shipped: { label: 'تم الشحن', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/10 dark:text-purple-400 dark:border-purple-900/30', icon: 'fa-truck' },
  delivered: { label: 'تم التسليم', color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900/30', icon: 'fa-house-circle-check' },
  cancelled: { label: 'ملغي', color: 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-800', icon: 'fa-ban' }
};

export default function ArtistOrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'artist')) {
      router.push('/');
    } else if (user) {
      fetchOrders();
    }
  }, [user, loading]);

  const fetchOrders = async () => {
    if (!user) return;
    setFetching(true);
    try {
      const res = await orderService.getMyOrders(user.id);
      if (res.status === 'success') {
        // Here we assume this page is for sales only, but the service returns both.
        // We'll prioritize the sales data if it's structured that way, or just show all.
        const salesData = res.data.sales || res.data; 
        setOrders(Array.isArray(salesData) ? salesData : []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setFetching(false);
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
    } catch (error) {
      alert('حدث خطأ أثناء تحديث الحالة');
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-[#fdfaf7] dark:bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#3b2012]/10 border-t-[#3b2012] dark:border-[#e8dcc4]/10 dark:border-t-[#e8dcc4] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf7] dark:bg-black py-12" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="text-center md:text-right">
            <h1 className="text-4xl md:text-5xl font-bold text-[#3b2012] dark:text-[#e8dcc4] mb-3 font-art">إدارة المبيعات</h1>
            <p className="text-[#9c7b65] dark:text-[#e8dcc4]/70 text-lg">تتبع مبيعاتك الفنية وقم بتحديث حالة الطلبات للمشترين</p>
          </div>
          <button 
            onClick={fetchOrders} 
            className="w-full md:w-auto px-6 py-3 bg-white dark:bg-[#111] border border-[#e8dcc4]/40 dark:border-gray-800 rounded-2xl text-[#3b2012] dark:text-[#e8dcc4] hover:bg-[#f0ece6] dark:hover:bg-black transition-all shadow-sm flex items-center justify-center gap-2 font-bold"
          >
            <i className="fa-solid fa-rotate-right"></i>
            تحديث القائمة
          </button>
        </header>

        {orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-white dark:bg-[#111] rounded-[3.5rem] border-2 border-dashed border-[#e8dcc4] dark:border-gray-800 shadow-xl shadow-[#3b2012]/5 space-y-8"
          >
            <div className="w-24 h-24 bg-[#fdfaf7] dark:bg-black rounded-full flex items-center justify-center mx-auto text-5xl text-[#e8dcc4] shadow-inner">
              <i className="fa-solid fa-box-open"></i>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#3b2012] dark:text-[#e8dcc4] font-art">لا توجد مبيعات حالياً</h2>
              <p className="text-[#9c7b65] dark:text-[#e8dcc4]/70 max-w-sm mx-auto text-lg">ستظهر الطلبات الجديدة هنا فور قيام المستخدمين بشراء أعمالك الفنية.</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <AnimatePresence mode="popLayout">
              {orders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-[#111] rounded-[3rem] border border-[#e8dcc4]/40 dark:border-gray-800 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-[#e8dcc4]/20 dark:divide-gray-800">
                    
                    {/* Main Info */}
                    <div className="flex-1 p-8 md:p-10">
                      <div className="flex flex-wrap items-center gap-4 mb-8">
                        <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${STATUS_MAP[order.status]?.color}`}>
                          <i className={`fa-solid ${STATUS_MAP[order.status]?.icon} ml-2`}></i>
                          {STATUS_MAP[order.status]?.label}
                        </span>
                        <span className="text-xs font-mono font-bold text-gray-400">ID: #{order.id.slice(0, 8)}</span>
                        <span className="text-xs font-bold text-gray-400">
                          <i className="fa-regular fa-calendar ml-1.5 text-amber-600"></i>
                          {new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-10">
                        {/* Buyer Details */}
                        <div className="flex-1 space-y-6">
                          <div className="bg-[#fdfaf7] dark:bg-black/40 p-6 rounded-[2rem] border border-[#e8dcc4]/30 dark:border-gray-800">
                            <h4 className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-4 flex items-center gap-2">
                              <i className="fa-solid fa-user-tag text-amber-600"></i>
                              تفاصيل المشتري
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xl font-bold text-[#3b2012] dark:text-[#e8dcc4]">{order.shipping_name || `${order.user?.first_name} ${order.user?.last_name}`}</p>
                                <p className="text-sm text-[#9c7b65] font-bold mt-1">{order.user?.email}</p>
                              </div>
                              <div className="flex flex-col gap-2 pt-4 border-t border-[#e8dcc4]/20 dark:border-gray-800">
                                <div className="flex items-center gap-3 text-sm text-[#3b2012] dark:text-[#e8dcc4]">
                                  <i className="fa-solid fa-phone text-amber-600/50"></i>
                                  <Link href={`tel:${order.shipping_phone}`} className="font-mono font-bold hover:text-amber-600 transition-colors">{order.shipping_phone}</Link>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[#3b2012] dark:text-[#e8dcc4]">
                                  <i className="fa-solid fa-location-dot text-red-500/50"></i>
                                  <span className="font-bold leading-relaxed">{order.shipping_city}، {order.shipping_address}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="flex-1">
                          <h4 className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-palette text-amber-600"></i>
                            المنتجات المطلوبة ({order.items?.length})
                          </h4>
                          <div className="space-y-3">
                            {order.items?.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 bg-[#fdfaf7] dark:bg-black/20 p-4 rounded-2xl border border-[#e8dcc4]/20 dark:border-gray-800">
                                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-black shrink-0 shadow-sm border border-[#e8dcc4]/10">
                                  <Image src={item.artwork?.image} alt={item.artwork?.title} fill className="object-cover" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <p className="font-bold text-[#3b2012] dark:text-[#e8dcc4] truncate text-sm">{item.artwork?.title}</p>
                                  <p className="text-xs text-amber-600 font-black mt-0.5">الكمية: {item.quantity} × {item.price} ₪</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary & Actions */}
                    <div className="w-full lg:w-80 p-8 md:p-10 bg-[#fdfaf7]/50 dark:bg-black/30 flex flex-col justify-between">
                      <div className="text-center lg:text-right mb-10">
                        <span className="block text-[10px] text-gray-400 mb-2 uppercase tracking-widest font-black">إجمالي المستحقات</span>
                        <span className="text-5xl font-black text-[#3b2012] dark:text-[#e8dcc4] tracking-tighter">{order.total_price} <span className="text-xl font-bold">₪</span></span>
                      </div>

                      <div className="space-y-4">
                        {order.status === 'pending' ? (
                          <div className="grid grid-cols-1 gap-3">
                            <button 
                              onClick={() => handleStatusUpdate(order.id, 'approved')}
                              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-xl shadow-green-600/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <i className="fa-solid fa-check"></i>
                              قبول الطلب
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(order.id, 'rejected')}
                              className="w-full py-4 bg-white dark:bg-black text-red-600 border border-red-100 dark:border-red-900/30 font-black rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-sm"
                            >
                              <i className="fa-solid fa-xmark ml-2"></i>
                              رفض الطلب
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-2 px-1">تحديث الحالة</label>
                            <div className="relative">
                              <select 
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                disabled={['delivered', 'rejected', 'cancelled'].includes(order.status)}
                                className="w-full p-4 bg-white dark:bg-[#111] border-2 border-[#e8dcc4] dark:border-gray-800 rounded-2xl text-xs font-black focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none appearance-none transition-all disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-black/50"
                              >
                                <option value="approved">تم القبول</option>
                                <option value="preparing">قيد التجهيز</option>
                                <option value="shipped">تم الشحن</option>
                                <option value="delivered" disabled>تم الاستلام</option>
                                {order.status === 'rejected' && <option value="rejected" disabled>مرفوض</option>}
                                {order.status === 'cancelled' && <option value="cancelled" disabled>ملغي</option>}
                              </select>
                              <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9c7b65]">
                                <i className="fa-solid fa-chevron-down text-[10px]"></i>
                              </div>
                            </div>
                            
                            {order.status === 'delivered' ? (
                              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/20 text-green-700 dark:text-green-400 shadow-sm">
                                <i className="fa-solid fa-circle-check text-xl"></i>
                                <span className="text-sm font-black">طلب مكتمل بنجاح</span>
                              </div>
                            ) : (order.status === 'rejected' || order.status === 'cancelled') && (
                              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 text-red-700 dark:text-red-400 shadow-sm">
                                <i className="fa-solid fa-circle-exclamation text-xl"></i>
                                <span className="text-sm font-black">طلب ملغي</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

