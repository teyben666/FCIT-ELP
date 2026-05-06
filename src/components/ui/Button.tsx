import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95',
      secondary: 'bg-text-main text-white hover:bg-text-main/90 shadow-xl shadow-text-main/10',
      warning: 'bg-warning text-white hover:bg-warning/90 shadow-lg shadow-warning/20 transition-all active:scale-95',
      outline: 'border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700 font-bold',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 font-bold',
      danger: 'bg-danger text-white hover:bg-danger/90 shadow-lg shadow-danger/20',
    };

    const sizes = {
      sm: 'h-10 px-4 text-[10px] font-black uppercase tracking-widest',
      md: 'h-12 px-6 text-xs font-black uppercase tracking-widest',
      lg: 'h-16 px-10 text-sm font-black uppercase tracking-widest',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-2xl transition-all focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:pointer-events-none gap-2 shrink-0',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
