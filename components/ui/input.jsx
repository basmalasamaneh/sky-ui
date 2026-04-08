import React from 'react';

const Input = React.forwardRef(({ className, type, label, labelExtra, error, icon, ...props }, ref) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-sm font-bold text-[#3b2012] font-amiri">
            {label}
          </label>
        )}
        {labelExtra}
      </div>
      <div className="relative">
        {icon && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9c7b65]">
            {icon}
          </span>
        )}
        <input
          type={type}
          className={`w-full h-14 bg-white border ${
            error ? 'border-red-400 focus:border-red-500' : 'border-[#e0d5c8] focus:border-[#6b4c3b]'
          } rounded-xl ${icon ? 'pr-12' : 'pr-4'} pl-4 text-sm text-[#3b2012] placeholder:text-[#c5b0a0] outline-none transition-colors font-amiri shadow-sm ${className}`}
          ref={ref}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 font-bold font-amiri mt-1 animate-fadeIn">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
