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

const SELECT_Z = 100;

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
      className={"flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 transition disabled:opacity-50 disabled:pointer-events-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 " + className}
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
  return <span>{ctx.value || placeholder}</span>;
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

  const portalContent = (
    <>
      <div
        className="fixed inset-0"
        style={{ zIndex: SELECT_Z }}
        onClick={(e) => { e.stopPropagation(); ctx.setOpen(false); }}
        aria-hidden
      />
      <div
        className="fixed max-h-60 overflow-auto rounded-lg border border-slate-200/80 bg-white py-1 shadow-lg"
        style={{ zIndex: SELECT_Z + 1, top: position.top, left: position.left, width: position.width, minWidth: "8rem" }}
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
  return (
    <div
      className="relative cursor-pointer select-none px-4 py-2.5 text-sm text-slate-800 outline-none hover:bg-slate-50"
      onClick={() => { ctx.onValueChange(value); ctx.setOpen(false); }}
    >
      {children}
    </div>
  );
}
