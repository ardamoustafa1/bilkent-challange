import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary";
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
    const v =
      variant === "secondary"
        ? "bg-slate-50 text-slate-600 border-slate-200/80"
        : "bg-slate-100 text-slate-700 border-slate-200/80";
    return (
      <span
        className={
          "inline-flex items-center rounded-[var(--radius-button)] border px-2.5 py-0.5 text-xs font-semibold transition-colors " + v + " " + className
        }
        {...props}
      />
    );
}
export { Badge };
