import type { ReactNode } from "react";

export function Glass({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={
        "rounded-xl border border-slate-200/80 bg-white shadow-sm " + className
      }
    >
      {children}
    </div>
  );
}
