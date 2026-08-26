import React, { useState, forwardRef } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { FieldError } from "react-hook-form";
import { Input } from "@supportflow/ui/src/components/ui/input";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { Label } from "@supportflow/ui/src/components/ui/label";

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label = "Mật khẩu", error, className = "", ...props }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div className="space-y-2">
        {label && (
          <Label className={error ? "text-destructive" : ""}>{label}</Label>
        )}

        <div className="relative flex items-center">
          <Lock className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />

          <Input
            {...props}
            ref={ref}
            type={show ? "text" : "password"}
            aria-invalid={!!error}
            className={`pl-9 pr-10 ${className}`}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setShow(!show)}
            tabIndex={-1}
          >
            {show ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        </div>

        {error && (
          <p className="text-xs font-medium text-destructive">
            {error.message}
          </p>
        )}
      </div>
    );
  },
);

PasswordField.displayName = "PasswordField";
