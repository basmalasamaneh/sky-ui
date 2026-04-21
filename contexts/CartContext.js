'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('sky-cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (e) {
        console.error('Failed to parse cart', e)
      }
    }
  }, [])

  // Save cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem('sky-cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addItem = (item) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id)
      if (existingItem) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(i => i.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  }

  const clearCart = () => setCartItems([])

  const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0)

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      totalItems, 
      totalPrice, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
