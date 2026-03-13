import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-[var(--radius-button)] text-[13px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-100 disabled:pointer-events-none disabled:opacity-50 ";
    const sizes = { default: "h-10 px-5 py-2", sm: "h-9 px-4 py-1.5" };
    const variants = {
      default:
        "bg-gradient-to-r from-slate-900 via-indigo-700 to-sky-600 text-white shadow-sm hover:brightness-110 hover:shadow-md active:scale-[0.98]",
      outline:
        "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-indigo-50 hover:border-indigo-200 hover:text-slate-900 active:scale-[0.98]",
      ghost: "text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]",
    };
    return <button ref={ref} className={base + variants[variant] + " " + sizes[size] + " " + className} {...props} />;
  }
);
Button.displayName = "Button";
export { Button };
