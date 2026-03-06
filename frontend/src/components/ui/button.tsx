import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ";
    const sizes = { default: "h-10 px-5 py-2", sm: "h-8 px-3 py-1.5 text-xs" };
    const variants = {
      default: "bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-900",
      outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300",
      ghost: "text-slate-700 hover:bg-slate-100",
    };
    return <button ref={ref} className={base + variants[variant] + " " + sizes[size] + " " + className} {...props} />;
  }
);
Button.displayName = "Button";
export { Button };
