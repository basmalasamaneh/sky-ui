'use client'
import React, { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [totalItems, setTotalItems] = useState(2) // Default mock items in cart

  const addItem = () => setTotalItems(prev => prev + 1)
  const removeItem = () => setTotalItems(prev => Math.max(0, prev - 1))

  return (
    <CartContext.Provider value={{ totalItems, addItem, removeItem }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
