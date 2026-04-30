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
    // Check if item already exists in cart
    const isExisting = cartItems.some(i => i.artworkId === item.id || i.id === item.id);
    if (isExisting) {
      setError('هذا العمل موجود بالفعل في سلتك');
      return;
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
        } else {
          setError(res.message || 'فشل إضافة المنتج')
        }
    } else if (!user) {
      setCartItems(prev => [...prev, { ...item, artworkId: item.id, quantity: 1 }])
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
            key="error-toast"
            initial={{ opacity: 0, y: 100, x: '-50%' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              x: ['-50%', '-52%', '-48%', '-51%', '-49%', '-50%'],
              transition: { x: { duration: 0.4, times: [0, 0.2, 0.4, 0.6, 0.8, 1] } }
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-12 left-1/2 z-[99999] bg-white dark:bg-[#111] text-red-600 px-8 py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-2 border-red-100 dark:border-red-900/30 flex items-center gap-4 font-bold min-w-[320px] justify-center"
          >
            <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center shrink-0">
              <i className="fa-solid fa-circle-exclamation text-xl"></i>
            </div>
            <span className="text-lg">{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div
            key="success-toast"
            initial={{ opacity: 0, y: 100, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-12 left-1/2 z-[99999] bg-white dark:bg-[#111] text-green-600 px-8 py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-2 border-green-100 dark:border-green-900/30 flex items-center gap-4 font-bold min-w-[320px] justify-center"
          >
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center shrink-0">
              <i className="fa-solid fa-circle-check text-xl"></i>
            </div>
            <span className="text-lg">{success}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
