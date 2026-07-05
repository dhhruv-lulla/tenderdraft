"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  showLockIcon?: boolean;
}

export default function PasswordInput({ showLockIcon = false, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {showLockIcon && (
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
      )}
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={
          className ??
          `w-full rounded-lg border border-white/15 bg-white/5 py-2.5 ${
            showLockIcon ? "pl-10" : "pl-3.5"
          } pr-10 text-sm text-white placeholder:text-white/25 outline-none transition-all duration-200 focus:border-gold/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-gold/15`
        }
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors duration-200 hover:text-white/60"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
