'use client';

import { LucideIcon } from 'lucide-react';
import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  children: React.ReactNode;
}

export function ActionButton({ icon: Icon, variant = 'primary', children, className = '', ...props }: ActionButtonProps) {
  const baseClass = "flex items-center gap-2 h-9 px-4 rounded-lg text-[13px] font-medium transition-colors shadow-sm";
  let variantClass = "";
  
  if (variant === 'primary') {
    variantClass = "bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white";
  } else if (variant === 'outline') {
    variantClass = "border border-gray-200 text-gray-600 hover:bg-gray-50 bg-white";
  } else if (variant === 'ghost') {
    variantClass = "text-gray-500 hover:text-gray-700 hover:bg-gray-50 shadow-none bg-transparent";
  } else if (variant === 'danger') {
    variantClass = "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200";
  }

  return (
    <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}
