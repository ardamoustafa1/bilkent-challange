import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info } from "lucide-react";

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Emin misiniz?",
  description = "Bu işlem geri alınamaz.",
  confirmLabel = "Onayla",
  cancelLabel = "Vazgeç",
  variant = "destructive",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "info" | "success";
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-[1.5rem] p-0 overflow-hidden">
        <div className="flex flex-col items-center px-8 pt-8 pb-6">
          {/* Icon */}
          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${variant === "destructive" ? "bg-rose-50" : "bg-blue-50"}`}>
            {variant === "destructive" ? (
              <AlertTriangle className="h-7 w-7 text-rose-500" />
            ) : (
              <Info className="h-7 w-7 text-blue-500" />
            )}
          </div>

          {/* Title */}
          <h3 className="mt-5 text-[17px] font-bold tracking-tight text-slate-900">
            {title}
          </h3>

          {/* Description */}
          <p className="mt-2 text-center text-[13px] leading-relaxed text-slate-500 whitespace-pre-line">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          <Button
            variant="outline"
            className="flex-1 rounded-xl text-[13px] font-semibold"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            className={`flex-1 rounded-xl text-[13px] font-semibold text-white ${
              variant === "destructive" ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
