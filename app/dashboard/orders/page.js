'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

const STATUS_MAP = {
  pending: { label: 'بانتظار الموافقة', color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50', icon: 'fa-clock' },
  approved: { label: 'تم القبول', color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50', icon: 'fa-check-circle' },
  rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50', icon: 'fa-circle-xmark' },
  preparing: { label: 'قيد التجهيز', color: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/50', icon: 'fa-box-open' },
  shipped: { label: 'تم الشحن', color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/50', icon: 'fa-truck' },
  delivered: { label: 'تم التسليم', color: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50', icon: 'fa-house-circle-check' },
  cancelled: { label: 'ملغي', color: 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-800', icon: 'fa-ban' }
};

const PARENT_STATUS_MAP = {
  pending: { label: 'قيد الانتظار', color: 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' },
  processing: { label: 'قيد التجهيز', color: 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' },
  partially_shipped: { label: 'تم شحن جزء', color: 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' },
  shipped: { label: 'تم الشحن', color: 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' },
  completed: { label: 'مكتمل', color: 'bg-green-600 text-white shadow-lg shadow-green-600/20' },
  cancelled: { label: 'ملغي', color: 'bg-gray-600 text-white shadow-lg shadow-gray-600/20' }
};

export default function OrdersDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('purchases');
  const [orders, setOrders] = useState({ purchases: [], sales: [] });
  const [loading, setLoading] = useState(true);
  const [isArtist, setIsArtist] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null, status: null, title: '', message: '' });

  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedSales, setExpandedSales] = useState({});

  const toggleGroup = (id) => setExpandedGroups(p => ({ ...p, [id]: !p[id] }));
  const toggleSale = (id) => setExpandedSales(p => ({ ...p, [id]: !p[id] }));

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const res = await orderService.getMyOrders(user.id);
      if (res.status === 'success') {
        setOrders(res.data);
        setIsArtist(res.data.sales.length > 0 || user?.role === 'artist');
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
    // If it's a destructive action, show confirmation first
    if (newStatus === 'cancelled' || newStatus === 'rejected') {
      const isCancellation = newStatus === 'cancelled';
      setConfirmModal({
        isOpen: true,
        orderId,
        status: newStatus,
        title: isCancellation ? 'تأكيد إلغاء الطلب' : 'تأكيد رفض الطلب',
        message: isCancellation 
          ? 'هل أنت متأكد من رغبتك في إلغاء هذه الشحنة؟ لن تتمكن من التراجع عن هذا القرار لاحقاً.'
          : 'هل أنت متأكد من رغبتك في رفض هذا الطلب؟ سيتم إخطار المشتري بقرارك.'
      });
      return;
    }

    executeStatusUpdate(orderId, newStatus);
  };

  const executeStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await orderService.updateStatus(orderId, newStatus);
      if (res.status === 'success') {
        fetchOrders();
        setConfirmModal({ isOpen: false, orderId: null, status: null, title: '', message: '' });
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
        <div className="w-12 h-12 border-4 border-[#3b2012]/10 border-t-[#3b2012] dark:border-[#e8dcc4]/10 dark:border-t-[#e8dcc4] rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentOrders = activeTab === 'purchases' ? orders.purchases : orders.sales;

  return (
    <>
      <div className="min-h-screen bg-[#fdfaf7] dark:bg-black pt-12 pb-20" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-12 text-center md:text-right">
          <h1 className="text-4xl md:text-5xl font-bold text-[#3b2012] dark:text-[#e8dcc4] mb-3 font-art">
            {isArtist ? 'لوحة تحكم الفنان' : 'طلباتي'}
          </h1>
          <p className="text-[#9c7b65] dark:text-[#e8dcc4]/80 text-lg">
            {isArtist
              ? 'أهلاً بك مجدداً، تابع مبيعاتك الفنية وطلباتك الشرائية في مكان واحد'
              : 'تابع حالة مشترياتك الفنية من مختلف الفنانين في أثر'}
          </p>
        </header>

        {isArtist && (
          <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
            <div className="flex gap-2 bg-white dark:bg-[#111] p-1.5 rounded-2xl border border-[#e8dcc4]/30 dark:border-gray-800 shadow-sm w-full md:w-fit">
              <button
                onClick={() => setActiveTab('purchases')}
                className={`flex-1 md:flex-none px-10 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'purchases' ? 'bg-[#3b2012] dark:bg-[#c4a993] text-white dark:text-black shadow-lg' : 'text-[#9c7b65] hover:bg-[#fdfaf7] dark:hover:bg-black/40'}`}
              >
                <i className="fa-solid fa-cart-shopping text-sm"></i>
                مشترياتي
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`flex-1 md:flex-none px-10 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'sales' ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-lg' : 'text-[#9c7b65] hover:bg-[#fdfaf7] dark:hover:bg-black/40'}`}
              >
                <i className="fa-solid fa-store text-sm"></i>
                مبيعاتي
              </button>
            </div>

            {activeTab === 'sales' && (
              <div className="flex items-center gap-8 bg-white dark:bg-[#111] px-8 py-4 rounded-3xl border border-[#e8dcc4]/30 dark:border-gray-800 shadow-sm">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">إجمالي المبيعات</p>
                  <p className="text-2xl font-black text-amber-600">
                    {orders.sales.filter(o => ['delivered', 'completed'].includes(o.status)).length}
                  </p>
                </div>
                <div className="w-px h-10 bg-[#e8dcc4]/30 dark:bg-gray-800"></div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">طلبات نشطة</p>
                  <p className="text-2xl font-black text-[#3b2012] dark:text-[#e8dcc4]">
                    {orders.sales.filter(o => !['delivered', 'completed', 'rejected', 'cancelled'].includes(o.status)).length}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {currentOrders.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#111] p-24 rounded-[3.5rem] border-2 border-dashed border-[#e8dcc4] dark:border-gray-800 text-center space-y-8 shadow-xl shadow-[#3b2012]/5"
              >
                <div className="w-24 h-24 bg-[#fdfaf7] dark:bg-black rounded-full flex items-center justify-center mx-auto text-5xl text-[#e8dcc4] shadow-inner">
                  <i className="fa-solid fa-box-open"></i>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#3b2012] dark:text-[#e8dcc4] font-art">لا توجد طلبات حالياً</h3>
                  <p className="text-lg text-[#9c7b65] dark:text-[#e8dcc4]/60 max-w-sm mx-auto">ابدأ رحلتك في معرض أثر واكتشف أجمل الأعمال الفنية من فنانين مبدعين.</p>
                </div>
                <Link href="/products" className="inline-flex items-center gap-3 px-10 py-4 bg-brown-gradient text-white rounded-2xl font-bold shadow-lg hover:scale-105 transition-all">
                  <i className="fa-solid fa-palette"></i>
                  تصفح المنتجات
                </Link>
              </motion.div>
            ) : activeTab === 'purchases' ? (
              // Buyer View
              currentOrders.map((group, gIdx) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gIdx * 0.1 }}
                  className="bg-white dark:bg-[#111] rounded-[3rem] border border-[#e8dcc4]/40 dark:border-gray-800 shadow-xl overflow-hidden mb-12"
                >
                  {/* Parent Order Header */}
                  <div
                    onClick={() => toggleGroup(group.id)}
                    className="bg-[#e9dcd0] dark:bg-[#1a1a1a] text-[#3b2012] dark:text-white p-8 md:p-10 flex flex-col lg:flex-row justify-between items-center gap-8 relative cursor-pointer group"
                  >
                    <div className="absolute inset-0 bg-brown-gradient opacity-0 dark:group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex items-center gap-8 z-10 w-full lg:w-auto">
                      <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-sm dark:shadow-inner border border-[#e8dcc4]/50 dark:border-none">
                        <i className="fa-solid fa-receipt"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <p className="text-[10px] text-[#9c7b65] dark:text-white/50 uppercase tracking-[0.2em] font-bold">طلب رئيسي</p>
                          {group.parent_status && (
                            <span className={`px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm ${PARENT_STATUS_MAP[group.parent_status]?.color}`}>
                              {PARENT_STATUS_MAP[group.parent_status]?.label}
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-mono font-bold tracking-tighter">#{group.id.slice(0, 8)}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-10 md:gap-14 z-10 w-full lg:w-auto justify-between lg:justify-end">
                      <div className="text-center lg:text-right">
                        <p className="text-[10px] text-[#9c7b65] dark:text-white/50 mb-1 uppercase tracking-widest font-bold">التاريخ</p>
                        <p className="text-lg font-bold">{new Date(group.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <div className="text-center lg:text-right">
                        <p className="text-[10px] text-[#9c7b65] dark:text-white/50 mb-1 uppercase tracking-widest font-bold">إجمالي الدفع</p>
                        <p className="text-3xl font-black">{group.total_price} ₪</p>
                      </div>
                      <div className={`text-2xl text-[#9c7b65] dark:text-white/40 group-hover:text-[#3b2012] dark:group-hover:text-white transition-all transform ${expandedGroups[group.id] ? 'rotate-180' : ''}`}>
                        <i className="fa-solid fa-chevron-down"></i>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedGroups[group.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[#fdfaf7] dark:bg-black/40"
                      >
                        <div className="p-8 md:p-12 space-y-8">
                          <div className="flex items-center gap-4 text-[#9c7b65] dark:text-[#e8dcc4] font-bold border-b border-[#e8dcc4]/20 dark:border-gray-800 pb-6">
                            <div className="w-8 h-8 bg-white dark:bg-[#111] rounded-full flex items-center justify-center text-xs shadow-sm border border-[#e8dcc4]/20 dark:border-gray-800">
                              <i className="fa-solid fa-truck-fast"></i>
                            </div>
                            {group.children?.length === 1
                              ? "شحنة واحدة من فنان واحد"
                              : `يحتوي الطلب على ${group.children?.length} شحنات منفصلة:`}
                          </div>

                          <div className="grid grid-cols-1 gap-8">
                            {group.children?.map((order) => (
                              <div key={order.id} className="bg-white dark:bg-[#111] rounded-[2.5rem] border border-[#e8dcc4]/30 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="p-8 flex flex-col lg:flex-row gap-10">
                                  {/* Artist Info */}
                                  <div className="lg:w-1/4 flex flex-col justify-between items-center lg:items-start text-center lg:text-right gap-6">
                                    <div className="flex flex-col lg:flex-row items-center gap-4">
                                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brown-gradient text-white flex items-center justify-center font-bold text-2xl shadow-lg ring-4 ring-[#fdfaf7] dark:ring-black">
                                        {order.artist?.profile_image ? (
                                          <Image src={order.artist.profile_image} alt="Artist" width={56} height={56} className="object-cover w-full h-full" />
                                        ) : (
                                          <span>{(order.artist?.artist_name || order.artist?.first_name || '?').charAt(0).toUpperCase()}</span>
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">الفنان</p>
                                        <p className="text-lg font-bold text-[#3b2012] dark:text-[#e8dcc4]">{order.artist?.artist_name || order.artist?.first_name}</p>
                                      </div>
                                    </div>
                                    <div className={`px-6 py-2.5 rounded-full border ${STATUS_MAP[order.status]?.color} text-xs font-bold flex items-center gap-3 shadow-md`}>
                                      <i className={`fa-solid ${STATUS_MAP[order.status]?.icon} text-sm`}></i>
                                      {STATUS_MAP[order.status]?.label}
                                    </div>
                                  </div>

                                  {/* Artwork Items */}
                                  <div className="lg:w-2/4 flex gap-6 overflow-x-auto no-scrollbar py-4 px-2">
                                    {order.items?.map(item => (
                                      <div key={item.id} className="flex items-center gap-4 bg-[#fdfaf7] dark:bg-black/50 p-4 rounded-3xl border border-[#e8dcc4]/20 dark:border-gray-800 min-w-[280px] shadow-sm">
                                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-black shrink-0 shadow-md">
                                          <Image src={item.artwork?.image} alt={item.artwork?.title} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                          <p className="text-sm font-bold text-[#3b2012] dark:text-[#e8dcc4] truncate mb-1">{item.artwork?.title}</p>
                                          <p className="text-xs text-[#9c7b65] font-bold">{item.quantity} × {item.price} ₪</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Shipping Total & Actions */}
                                  <div className="lg:w-1/4 flex flex-col justify-center border-t lg:border-t-0 lg:border-r border-[#e8dcc4]/20 dark:border-gray-800 pt-8 lg:pt-0 lg:pr-10">
                                    <div className="text-center lg:text-right space-y-6">
                                      <div>
                                        <p className="text-[10px] text-gray-400 mb-1 uppercase font-bold tracking-widest">إجمالي الشحنة</p>
                                        <p className="text-2xl font-black text-[#3b2012] dark:text-[#e8dcc4]">{order.total_price} ₪</p>
                                      </div>

                                      <div className="space-y-3">
                                        {order.status === 'shipped' ? (
                                          <button
                                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'delivered'); }}
                                            className="w-full py-4 bg-green-600 dark:bg-green-700 text-white rounded-2xl text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-600/20"
                                          >
                                            تأكيد الاستلام
                                          </button>
                                        ) : !['shipped', 'delivered', 'rejected', 'cancelled'].includes(order.status) ? (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleStatusUpdate(order.id, 'cancelled');
                                            }}
                                            className="w-full py-3.5 border-2 border-red-50 dark:border-red-900/10 text-red-500 rounded-2xl text-[11px] font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                                          >
                                            إلغاء الشحنة
                                          </button>
                                        ) : (order.status === 'rejected' || order.status === 'cancelled') && (
                                          <div className="text-[11px] text-red-500 font-bold bg-red-50 dark:bg-red-900/10 px-4 py-3 rounded-2xl border border-red-100 dark:border-red-900/20">
                                            <i className="fa-solid fa-circle-exclamation ml-2"></i>
                                            شحنة ملغاة
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              // Artist View (Sales)
              currentOrders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-[#111] rounded-[2.5rem] border border-[#e8dcc4]/40 dark:border-gray-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div
                    onClick={() => toggleSale(order.id)}
                    className="p-8 cursor-pointer flex flex-col md:flex-row justify-between items-center gap-6 group hover:bg-[#fdfaf7] dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-6 w-full lg:w-1/2">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/10 text-amber-600 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-box"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-1.5">
                          <h3 className="text-xl font-bold text-[#3b2012] dark:text-[#e8dcc4]">طلب #{order.id.slice(0, 8)}</h3>
                          <span className={`px-6 py-2 rounded-full border ${STATUS_MAP[order.status]?.color} text-xs font-bold uppercase tracking-wide shadow-md`}>
                            {STATUS_MAP[order.status]?.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-gray-500">
                          <span className="flex items-center gap-2"><i className="fa-regular fa-calendar text-amber-600"></i>{new Date(order.created_at).toLocaleDateString('ar-EG')}</span>
                          <span className="flex items-center gap-2"><i className="fa-solid fa-money-bill-wave text-green-600"></i>{order.total_price} ₪</span>
                          <span className="flex items-center gap-2 truncate max-w-[150px]" title={order.shipping_city}><i className="fa-solid fa-location-dot text-red-500"></i>{order.shipping_city}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                      <div className="text-gray-300 dark:text-gray-700 text-3xl transition-transform duration-300 group-hover:text-amber-500">
                        <i className={`fa-solid fa-chevron-${expandedSales[order.id] ? 'up' : 'down'}`}></i>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedSales[order.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-[#e8dcc4]/30 dark:border-gray-800"
                      >
                        <div className="p-8 md:p-12 flex flex-col xl:flex-row gap-12 bg-[#fdfaf7]/40 dark:bg-black/20">
                          {/* Items Section */}
                          <div className="flex-1 space-y-8">
                            <div className="space-y-4">
                              <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                                المنتجات المطلوبة
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {order.items.map(item => (
                                  <div key={item.id} className="flex items-center gap-4 bg-white dark:bg-[#111] p-4 rounded-[2rem] border border-[#e8dcc4]/20 dark:border-gray-800 shadow-sm">
                                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#fdfaf7] dark:bg-black shrink-0">
                                      <Image src={item.artwork.image} alt={item.artwork.title} fill className="object-cover" />
                                    </div>
                                    <div className="overflow-hidden">
                                      <p className="font-bold text-[#3b2012] dark:text-[#e8dcc4] truncate">{item.artwork.title}</p>
                                      <p className="text-xs text-[#9c7b65] font-black mt-1">الكمية: {item.quantity}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Customer & Actions Section */}
                          <div className="w-full xl:w-80 space-y-8">
                            <div className="bg-amber-50/50 dark:bg-amber-900/10 p-8 rounded-[2.5rem] border border-amber-200/50 dark:border-amber-900/30">
                              <h4 className="text-[11px] text-amber-800 dark:text-amber-400 mb-6 uppercase font-black tracking-widest flex items-center justify-between">
                                معلومات المشتري
                                <i className="fa-solid fa-user-tag text-lg"></i>
                              </h4>
                              <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-black flex items-center justify-center text-amber-600 shadow-sm">
                                    <i className="fa-solid fa-id-card"></i>
                                  </div>
                                  <div>
                                    <p className="text-lg font-bold text-[#3b2012] dark:text-[#e8dcc4]">{order.shipping_name}</p>
                                    <Link href={`tel:${order.shipping_phone}`} className="text-xs text-amber-700 hover:underline flex items-center gap-2 mt-1">
                                      <i className="fa-solid fa-phone text-[10px]"></i>
                                      {order.shipping_phone}
                                    </Link>
                                  </div>
                                </div>
                                <div className="pt-6 border-t border-amber-200/50 dark:border-amber-900/20">
                                  <p className="text-[10px] text-amber-800/60 mb-2 uppercase tracking-widest">عنوان الشحن</p>
                                  <p className="text-sm text-[#3b2012] dark:text-[#e8dcc4] leading-relaxed font-bold break-all">
                                    <i className="fa-solid fa-map-marker-alt text-red-500 ml-2"></i>
                                    {order.shipping_city}، {order.shipping_address}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Status Control */}
                            <div className="pt-6 border-t border-[#e8dcc4]/30 dark:border-gray-800">
                              {order.status === 'pending' ? (
                                <div className="space-y-4">
                                  <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
                                    <i className="fa-solid fa-triangle-exclamation text-amber-500"></i>
                                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-black">قرارك مطلوب لمعالجة هذا الطلب</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <button
                                      onClick={() => handleStatusUpdate(order.id, 'approved')}
                                      className="py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-green-600/20 flex items-center justify-center gap-3 transition-all hover:scale-105"
                                    >
                                      <i className="fa-solid fa-check"></i>
                                      قبول
                                    </button>
                                    <button
                                      onClick={() => handleStatusUpdate(order.id, 'rejected')}
                                      className="py-4 bg-white dark:bg-black text-red-600 border-2 border-red-50 dark:border-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl text-xs font-black transition-all"
                                    >
                                      <i className="fa-solid fa-xmark"></i>
                                      رفض
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center px-1">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">تحديث الحالة</p>
                                    {['rejected', 'cancelled', 'delivered'].includes(order.status) && (
                                      <span className="text-[10px] text-gray-400 font-bold italic">حالة نهائية</span>
                                    )}
                                  </div>
                                  <div className="relative">
                                    <select
                                      value={order.status}
                                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                      disabled={['delivered', 'rejected', 'cancelled'].includes(order.status)}
                                      className="w-full p-4 bg-white dark:bg-black border-2 border-[#e8dcc4] dark:border-gray-800 rounded-2xl text-xs font-black focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none appearance-none transition-all disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900/20"
                                    >
                                      <option value="approved">تم القبول</option>
                                      <option value="preparing">قيد التجهيز</option>
                                      <option value="shipped">تم الشحن</option>
                                      <option value="delivered" disabled>تم التسليم (من المشتري)</option>
                                      {order.status === 'rejected' && <option value="rejected" disabled>مرفوض</option>}
                                      {order.status === 'cancelled' && <option value="cancelled" disabled>ملغي من المشتري</option>}
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute left-5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none"></i>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>

    {/* Confirmation Modal */}
    <AnimatePresence>
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-[#111] w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-[#e8dcc4]/30 dark:border-gray-800 text-center"
          >
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-3xl flex items-center justify-center text-red-500 text-3xl mx-auto mb-6">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 className="text-2xl font-bold text-[#3b2012] dark:text-[#e8dcc4] mb-4 font-art">{confirmModal.title}</h3>
            <p className="text-[#9c7b65] dark:text-[#e8dcc4]/60 mb-10 leading-relaxed font-bold">
              {confirmModal.message}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => executeStatusUpdate(confirmModal.orderId, confirmModal.status)}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95"
              >
                {confirmModal.status === 'cancelled' ? 'إلغاء الطلب الآن' : 'رفض الطلب الآن'}
              </button>
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="w-full py-4 bg-[#fdfaf7] dark:bg-black text-[#9c7b65] dark:text-[#e8dcc4] rounded-2xl font-bold border border-[#e8dcc4]/30 dark:border-gray-800 transition-all hover:bg-[#e8dcc4]/20"
              >
                تراجع
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}
