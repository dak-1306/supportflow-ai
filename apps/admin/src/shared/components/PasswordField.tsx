import React, { useState, forwardRef } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { FieldError } from "react-hook-form";

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label = "Mật khẩu", error, className = "", ...props }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            ref={ref}
            type={show ? "text" : "password"}
            {...props}
            className={`w-full pl-9 pr-10 py-2.5 bg-white border text-xs rounded-xl outline-none focus:ring-2 ${
              error
                ? "border-red-500 focus:ring-red-200"
                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
            } ${className}`}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            {show ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {error && (
          <p className="text-[11px] text-red-500 font-medium">
            {error.message}
          </p>
        )}
      </div>
    );
  },
);

PasswordField.displayName = "PasswordField";
