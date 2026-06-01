import { useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface KidsPinModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (pin?: string) => void;
  mode: "set" | "verify";
  currentPin?: string | null;
}

export const KidsPinModal = ({ open, onClose, onSuccess, mode, currentPin }: KidsPinModalProps) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");
    if (mode === "set") {
      if (pin.length !== 4) {
        setError("الرقم السري يجب أن يتكون من 4 أرقام");
        return;
      }
      if (pin !== confirmPin) {
        setError("الرقم السري غير مطابق");
        return;
      }
      onSuccess(pin);
    } else {
      if (pin === currentPin) {
        onSuccess();
      } else {
        setError("الرقم السري غير صحيح");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-black/80 border-accent/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent">
            {mode === "set" ? "تعيين رقم سري" : "أدخل الرقم السري"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === "set" ? "أدخل رقم سري مكون من 4 أرقام لحماية وضع الأطفال" : "أدخل الرقم السري للخروج من وضع الأطفال"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 items-center">
          <InputOTP maxLength={4} value={pin} onChange={setPin}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>

          {mode === "set" && (
            <>
              <p className="text-sm text-muted-foreground mt-2">تأكيد الرقم السري</p>
              <InputOTP maxLength={4} value={confirmPin} onChange={setConfirmPin}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </>
          )}

          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}

          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="w-4 h-4 mr-2" /> إلغاء
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-accent hover:bg-accent/80">
              {mode === "set" ? "حفظ" : "تأكيد"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
