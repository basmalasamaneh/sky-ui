'use client'
import React, { useState, useRef, useEffect } from 'react'

export const DropdownMenu = ({ children }) => {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-right" ref={menuRef}>
      {React.Children.map(children, child => {
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, { onClick: () => setOpen(!open) })
        }
        if (child.type === DropdownMenuContent && open) {
          return React.cloneElement(child, { setOpen })
        }
        return null
      })}
    </div>
  )
}

export const DropdownMenuTrigger = ({ children, asChild, onClick, ...props }) => {
  if (asChild) {
    return React.cloneElement(children, { onClick, ...props })
  }
  return <button onClick={onClick} {...props}>{children}</button>
}

export const DropdownMenuContent = ({ children, setOpen, align = 'right', className = '' }) => {
  const alignClasses = align === 'start' ? 'left-0' : 'right-0'
  return (
    <div className={`absolute z-[100] mt-2 ${alignClasses} bg-white dark:bg-black border border-gray-100 dark:border-gray-800 dark:border-gray-800 rounded-2xl shadow-2xl py-2 min-w-[200px] animate-fade-in ${className}`}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { setOpen })
      )}
    </div>
  )
}

export const DropdownMenuItem = ({ children, onClick, setOpen, className = '', ...props }) => (
  <div 
    onClick={() => {
      if (onClick) onClick()
      if (setOpen) setOpen(false)
    }}
    className={`px-4 py-3 text-right hover:bg-gray-50 dark:hover:bg-gray-900 dark:bg-gray-900 cursor-pointer text-sm font-medium transition-colors ${className}`}
    {...props}
  >
    {children}
  </div>
)

export const DropdownMenuLabel = ({ children, className = '' }) => (
  <div className={`px-4 py-2 text-right text-[10px] uppercase font-bold text-gray-400 ${className}`}>
    {children}
  </div>
)

export const DropdownMenuSeparator = ({ className = '' }) => (
  <div className={`h-[1px] bg-gray-100 dark:bg-gray-800 my-1 ${className}`} />
)
