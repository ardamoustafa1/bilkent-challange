import { useEffect } from "react";

export type ToastItem = { message: string; type: "success" | "error" } | null;

export function Toast({
  toast,
  onClose,
  duration = 4000,
}: {
  toast: ToastItem;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [toast, duration, onClose]);

  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      className="fixed bottom-24 left-1/2 z-[200] -translate-x-1/2 rounded-lg px-5 py-3 shadow-lg"
      style={{
        backgroundColor: isError ? "#fef2f2" : "#f0fdf4",
        color: isError ? "#991b1b" : "#166534",
        border: `1px solid ${isError ? "#fecaca" : "#bbf7d0"}`,
      }}
      role="alert"
    >
      <span className="text-sm font-semibold">{toast.message}</span>
    </div>
  );
}
