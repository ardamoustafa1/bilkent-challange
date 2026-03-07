import * as React from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const onEscape = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    },
    [onOpenChange]
  );
  React.useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open, onEscape]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 z-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} aria-hidden />
      <div className="pointer-events-none relative z-10 flex max-h-[90vh] w-full max-w-[95vw] items-center justify-center overflow-y-auto p-2">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const focusables = el.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])");
    const list = Array.from(focusables).filter((f) => !f.hasAttribute("disabled"));
    if (list[0]) list[0].focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const first = list[0];
      const last = list[list.length - 1];
      if (!first || !last) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, []);
  return (
    <div ref={contentRef} className={"pointer-events-auto flex max-h-[85vh] w-full max-w-full flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white p-6 shadow-xl " + className}>
      {children}
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function DialogTitle({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={"text-base font-semibold text-slate-800 " + className}>{children}</h2>;
}
