'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cartService } from '@/services/cartService'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const SHIPPING_AREAS = [
  { id: 'westbank', label: 'الضفة الغربية', fee: 20 },
  { id: 'jerusalem', label: 'القدس', fee: 30 },
  { id: '48lands', label: 'أراضي 48', fee: 70 },
];

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [cartId, setCartId] = useState(null)
  const [shippingArea, setShippingArea] = useState(SHIPPING_AREAS[0])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [info, setInfo] = useState(null)
  const { user } = useAuth()

  // Auto-clear notifications
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (info) {
      const timer = setTimeout(() => setInfo(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [info])

  // Load cart from API if logged in, otherwise localStorage
  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        const res = await cartService.getCartByUserId(user.id)
        if (res.status === 'success') {
          setCartId(res.data.cartId)
          // Map backend items to frontend format
          const items = res.data.items.map(item => ({
            id: item.id,
            artworkId: item.artwork.id,
            title: item.artwork.title,
            price: item.artwork.price,
            quantity: item.quantity,
            stock: item.artwork.quantity,
            image: item.artwork.images?.find(img => img.is_featured)?.url || item.artwork.images?.[0]?.url || 'placeholder.jpg',
            artistName: item.artwork.users?.artist_name || 'فنان'
          }))
          setCartItems(items)
        }
      } else {
        const savedCart = localStorage.getItem('sky-cart')
        if (savedCart) setCartItems(JSON.parse(savedCart))
      }
    }
    fetchCart()
  }, [user])

  const addItem = async (item) => {
    // التحقق مما إذا كان المنتج موجوداً بالفعل في السلة
    // نستخدم String() لضمان مطابقة المعرفات حتى لو اختلف نوعها (رقم vs نص)
    // ونفحص artworkId (للمسجلين) و id (للضيوف)
    const isAlreadyInCart = cartItems.some(i =>
      String(i.artworkId || i.id) === String(item.id)
    );

    if (isAlreadyInCart) {
      setInfo('هذا المنتج موجود بالفعل في سلتك');
      return false;
    }

    if (user && cartId) {
      const res = await cartService.addItem(cartId, item.id, 1)
      if (res.status === 'success') {
        // Refresh cart from server
        const fullCart = await cartService.getCart(cartId)
        setCartItems(fullCart.data.items.map(i => ({
          id: i.id,
          artworkId: i.artwork.id,
          title: i.artwork.title,
          price: i.artwork.price,
          quantity: i.quantity,
          stock: i.artwork.quantity,
          image: i.artwork.images?.find(img => img.is_featured)?.url || i.artwork.images?.[0]?.url || 'placeholder.jpg',
          artistName: i.artwork.users?.artist_name || 'فنان'
        })))
        setSuccess('تمت الإضافة للسلة بنجاح')
        return true;
      } else {
        setError(res.message || 'فشل إضافة المنتج')
        return false;
      }
    } else if (!user) {
      setCartItems(prev => {
        const existingItem = prev.find(i => i.id === item.id)
        if (existingItem) {
          return prev;
        }
        const newCart = [...prev, { ...item, quantity: 1 }];
        localStorage.setItem('sky-cart', JSON.stringify(newCart));
        return newCart;
      })
      setSuccess('تمت الإضافة للسلة بنجاح')
      return true;
    }
    return false;
  }

  const removeItem = async (id) => {
    if (user && cartId) {
      await cartService.removeItem(cartId, id)
      setCartItems(prev => prev.filter(i => i.id !== id))
    } else {
      setCartItems(prev => prev.filter(i => i.id !== id))
    }
  }

  const updateQuantity = async (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    if (user && cartId) {
      try {
        const res = await cartService.updateQuantity(cartId, id, quantity);
        if (res.status === 'success') {
          // Re-map items from the backend response
          const items = res.data.items.map(item => ({
            id: item.id,
            artworkId: item.artwork.id,
            title: item.artwork.title,
            price: item.artwork.price,
            quantity: item.quantity,
            stock: item.artwork.quantity,
            image: item.artwork.images?.find(img => img.is_featured)?.url || item.artwork.images?.[0]?.url || 'placeholder.jpg',
            artistName: item.artwork.users?.artist_name || 'فنان'
          }));
          setCartItems(items);
        } else {
          setError(res.message || 'فشل تحديث الكمية');
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    } else {
      setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    }
  };

  const clearCart = () => setCartItems([])

  const totalItems = cartItems.length
  const itemsPrice = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0)
  const shippingFee = cartItems.length > 0 ? shippingArea.fee : 0
  const totalPrice = itemsPrice + shippingFee

  return (
    <CartContext.Provider value={{
      user,
      cartItems,
      totalItems,
      totalPrice,
      itemsPrice,
      shippingFee,
      shippingArea,
      setShippingArea,
      error,
      setError,
      setInfo,
      addItem,
      removeItem,
      updateQuantity,
      clearCart
    }}>
      {children}

      {/* Toast Notification */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] bg-[#3b2012] text-[#e8dcc4] px-6 py-4 rounded-2xl shadow-2xl border border-red-500/50 flex items-center gap-3 font-bold"
          >
            <i className="fa-solid fa-triangle-exclamation text-red-500 text-xl"></i>
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] bg-[#3b2012] text-[#e8dcc4] px-6 py-4 rounded-2xl shadow-2xl border border-green-500/50 flex items-center gap-3 font-bold"
          >
            <i className="fa-solid fa-circle-check text-green-500 text-xl"></i>
            {success}
          </motion.div>
        )}
        {info && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] bg-[#3b2012] text-[#e8dcc4] px-6 py-4 rounded-2xl shadow-2xl border border-amber-500/50 flex items-center gap-3 font-bold"
          >
            <i className="fa-solid fa-circle-info text-amber-500 text-xl"></i>
            {info}
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
