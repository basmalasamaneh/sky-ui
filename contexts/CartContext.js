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
  const [isLoading, setIsLoading] = useState(true)
  const { user, isLoading: authLoading } = useAuth()

  // Auto-clear error after 3s
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

  // Load cart from API if logged in, otherwise localStorage
  useEffect(() => {
    const fetchCart = async () => {
      // Don't do anything until we know the user's auth status
      if (authLoading) return

      setIsLoading(true)
      try {
        if (user) {
          const res = await cartService.getCartByUserId(user.id)
          if (res?.status === 'success' && res.data) {
            setCartId(res.data.cartId)
            const items = (res.data.items || []).map(item => {
              const artwork = item.artwork || {}
              return {
                id: item.id || Math.random().toString(),
                artworkId: artwork.id,
                title: artwork.title || 'عمل فني',
                price: artwork.price || 0,
                quantity: item.quantity || 1,
                stock: artwork.quantity || 0,
                image: artwork.images?.find(img => img.is_featured)?.url || artwork.images?.[0]?.url || '/images/placeholder.jpg',
                artistName: artwork.users?.artist_name || artwork.users?.first_name || 'فنان'
              }
            })
            setCartItems(items)
          }
        } else {
          const savedCart = localStorage.getItem('sky-cart')
          if (savedCart) {
            try {
              setCartItems(JSON.parse(savedCart))
            } catch (e) {
              console.error('Failed to parse saved cart', e)
              setCartItems([])
            }
          }
        }
      } catch (err) {
        console.error('Error fetching cart:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCart()
  }, [user, authLoading])

  // Persist guest cart to localStorage
  useEffect(() => {
    // ONLY save if we are NOT loading and NOT logged in
    if (!authLoading && !isLoading && !user) {
      localStorage.setItem('sky-cart', JSON.stringify(cartItems))
    }
  }, [cartItems, user, authLoading, isLoading])

  const addItem = async (item) => {
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
        } else {
          setError(res.message || 'فشل إضافة المنتج')
        }
    } else if (!user) {
      setCartItems(prev => {
        const existingItem = prev.find(i => i.id === item.id)
        if (existingItem) {
          return prev.map(i => i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i)
        }
        return [...prev, { ...item, quantity: 1 }]
      })
      setSuccess('تمت الإضافة للسلة بنجاح')
    }
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
      isLoading,
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
      </AnimatePresence>
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
