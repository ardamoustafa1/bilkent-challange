import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={
        "flex h-10 w-full rounded-[var(--radius-button)] border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-900 shadow-inner-soft outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100 hover:border-slate-300 " +
        className
      }
      {...props}
    />
  );
});
Input.displayName = "Input";
export { Input };
