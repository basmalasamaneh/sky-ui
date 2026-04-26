'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

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
        setOrders(res.data);
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
        if (newStatus === 'approved') {
          alert('تم قبول الطلب وإرسال إشعار للمشتري');
        }
      }
    } catch (error) {
      alert('حدث خطأ أثناء تحديث الحالة');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'قيد الانتظار',
      approved: 'تم القبول',
      rejected: 'مرفوض',
      preparing: 'قيد التجهيز',
      shipped: 'تم الشحن',
      delivered: 'تم الاستلام'
    };
    return labels[status] || status;
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf7] dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf7] dark:bg-black font-art py-12" dir="rtl">
      <div className="container mx-auto px-4">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-[#3b2012] dark:text-[#e8dcc4] mb-2">إدارة الطلبات</h1>
            <p className="text-[#9c7b65] dark:text-[#e8dcc4]/70">تتبع وحدث حالة طلباتك من المشترين</p>
          </div>
          <div className="flex gap-4">
            <button onClick={fetchOrders} className="p-3 bg-white dark:bg-black border border-[#e8dcc4] rounded-xl hover:bg-[#f0ece6] transition-all">
              <i className="fa-solid fa-rotate-right"></i>
            </button>
          </div>
        </header>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-black rounded-[2.5rem] border border-[#e8dcc4]/40 shadow-sm">
            <div className="text-6xl text-[#e8dcc4] mb-6">
              <i className="fa-solid fa-box-open"></i>
            </div>
            <h2 className="text-2xl font-bold text-[#3b2012] dark:text-[#e8dcc4]">لا توجد طلبات بعد</h2>
            <p className="text-[#9c7b65] dark:text-[#e8dcc4]/70 mt-2">ستظهر الطلبات الجديدة هنا فور قيام المستخدمين بالشراء</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-black p-6 rounded-[2rem] border border-[#e8dcc4]/40 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    {/* Order Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <span className={`px-4 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        <span className="text-sm text-gray-400">#{order.id.slice(0, 8)}</span>
                        <span className="text-sm text-gray-400">
                          {new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-[#3b2012] dark:text-[#e8dcc4]">المشتري: {order.user?.first_name} {order.user?.last_name}</h3>
                        <p className="text-sm text-[#9c7b65]">{order.user?.email}</p>
                      </div>

                      <div className="space-y-2">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex justify-between items-center bg-[#fdfaf7] dark:bg-[#1a1a1a] p-3 rounded-xl border border-[#e8dcc4]/20">
                            <span className="font-medium text-[#3b2012] dark:text-[#e8dcc4]">{item.artwork?.title} (×{item.quantity})</span>
                            <span className="font-bold text-amber-600">{item.price * item.quantity} ₪</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions & Summary */}
                    <div className="lg:w-64 flex flex-col justify-between border-r lg:pr-6 border-[#e8dcc4]/30">
                      <div className="text-center lg:text-right mb-6">
                        <span className="block text-sm text-[#9c7b65] mb-1">إجمالي الطلب</span>
                        <span className="text-3xl font-black text-[#3b2012] dark:text-[#e8dcc4]">{order.total_price} ₪</span>
                      </div>

                      <div className="space-y-3">
                        {order.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusUpdate(order.id, 'approved')}
                              className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                            >
                              قبول الطلب
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(order.id, 'rejected')}
                              className="w-full py-3 bg-white text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-50 transition-all"
                            >
                              رفض الطلب
                            </button>
                          </>
                        )}

                        {order.status === 'approved' && (
                          <button 
                            onClick={() => handleStatusUpdate(order.id, 'preparing')}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                          >
                            بدء التجهيز
                          </button>
                        )}

                        {order.status === 'preparing' && (
                          <button 
                            onClick={() => handleStatusUpdate(order.id, 'shipped')}
                            className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20"
                          >
                            تحديد كتم الشحن
                          </button>
                        )}

                        {order.status === 'shipped' && (
                          <div className="text-center py-2 px-4 bg-gray-100 rounded-xl text-gray-500 text-sm font-medium">
                            في انتظار تأكيد الاستلام من العميل
                          </div>
                        )}

                        {order.status === 'delivered' && (
                          <div className="text-center py-2 px-4 bg-green-50 rounded-xl text-green-600 text-sm font-bold">
                            تم اكتمال الطلب بنجاح
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
