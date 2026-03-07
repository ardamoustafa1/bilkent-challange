import * as React from "react";
import { createPortal } from "react-dom";

type SelectContextType = {
  value: string;
  onValueChange: (v: string) => void;
  open: boolean;
  setOpen: (o: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};
const SelectContext = React.createContext<SelectContextType | null>(null);

const SELECT_Z = 10000;

export function Select({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, triggerRef }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className = "", children, disabled }: { className?: string; children?: React.ReactNode; disabled?: boolean }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  return (
    <button
      ref={ctx.triggerRef as React.RefObject<HTMLButtonElement>}
      type="button"
      className={"flex h-10 w-full items-center justify-between rounded-[var(--radius-button)] border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-inner-soft transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none hover:border-slate-300 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100 " + className}
      onClick={() => !disabled && ctx.setOpen(!ctx.open)}
      disabled={disabled}
    >
      {children ?? <SelectValue />}
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  const display = ctx.value === "all" && placeholder ? placeholder : (ctx.value || placeholder);
  return <span>{display}</span>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(SelectContext);
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 200 });

  React.useLayoutEffect(() => {
    if (!ctx?.open || !ctx.triggerRef.current) return;
    const el = ctx.triggerRef.current;
    const rect = el.getBoundingClientRect();
    setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }, [ctx?.open]);

  if (!ctx || !ctx.open) return null;

  const close = () => ctx.setOpen(false);
  const portalContent = (
    <>
      <div
        className="fixed inset-0"
        style={{ zIndex: SELECT_Z }}
        onClick={close}
        onMouseDown={close}
        aria-hidden
      />
      <div
        className="fixed max-h-60 overflow-auto rounded-[var(--radius-card)] border border-slate-100 bg-white py-1.5 shadow-float"
        style={{ zIndex: SELECT_Z + 1, top: position.top + 4, left: position.left, width: position.width, minWidth: "8rem" }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>
  );

  return typeof document !== "undefined" ? createPortal(portalContent, document.body) : portalContent;
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  const select = () => {
    ctx.onValueChange(value);
    ctx.setOpen(false);
  };
  return (
    <div
      role="option"
      className="relative cursor-pointer select-none px-4 py-2 min-h-[36px] flex items-center text-[13px] font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100"
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); select(); }}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); select(); }}
    >
      {children}
    </div>
  );
}
