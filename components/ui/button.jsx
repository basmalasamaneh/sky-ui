import React from 'react'
import Link from 'next/link'
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const Button = ({ children, variant = 'primary', size = 'md', href, onClick, className = '', asChild = false, ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-bold transition-all duration-300 active:scale-95 disabled:opacity-50'
  
  const sizeStyles = {
    sm: 'px-5 py-2 text-sm',
    md: 'px-8 py-3 text-md',
    lg: 'px-12 py-5 text-lg',
    icon: 'h-10 w-10 p-0',
    ghost: 'p-2',
  }

  const variantStyles = {
    primary: 'bg-gold-gradient text-black shadow-lg hover:shadow-xl hover:scale-[1.02]',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-50',
    outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
  }

  const finalClassName = twMerge(baseStyles, sizeStyles[size], variantStyles[variant], className)

  if (href) {
    return (
      <Link href={href} className={finalClassName} {...props}>
        {children}
      </Link>
    )
  }

  const Comp = asChild ? React.Fragment : 'button'

  return (
    <button onClick={onClick} className={finalClassName} {...props}>
      {children}
    </button>
  )
}
