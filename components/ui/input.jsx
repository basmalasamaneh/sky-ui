import React from 'react';

const Input = React.forwardRef(({ className, type, label, labelExtra, error, icon, leftIcon, ...props }, ref) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-sm font-bold text-[#3b2012] dark:text-[#e8dcc4]">
            {label}
          </label>
        )}
        {labelExtra}
      </div>
      <div className="relative">
        {icon && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9c7b65] dark:text-[#e8dcc4] z-10 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={type}
          className={`w-full h-14 bg-white dark:bg-black border ${
            error 
              ? 'border-red-400 focus:border-red-500' 
              : 'border-[#e0d5c8] dark:border-gray-800 focus:border-[#6b4c3b] dark:focus:border-[#c4a993]'
          } rounded-xl ${icon ? 'pr-12' : 'pr-4'} ${leftIcon ? 'pl-12' : 'pl-4'} text-sm text-[#3b2012] dark:text-[#e8dcc4] placeholder:text-[#c5b0a0] outline-none transition-colors shadow-sm ${className}`}
          ref={ref}
          {...props}
        />
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c7b65] dark:text-[#e8dcc4] z-10">
            {leftIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 font-bold mt-1 animate-fadeIn">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
