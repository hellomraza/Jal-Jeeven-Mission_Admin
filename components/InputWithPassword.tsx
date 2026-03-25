"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Field, FieldLabel } from "./ui/field";

const InputWithPassword = (props: React.ComponentProps<"input">) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Field className="w-full max-w-lg">
      <FieldLabel
        htmlFor="password-toggle"
        className="text-xs text-gray-500 font-semibold"
      >
        Password
      </FieldLabel>
      <div className="relative">
        <Input
          placeholder="Enter your password"
          type={showPassword ? "text" : "password"}
          {...props}
        />
        <Button
          className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          size="icon"
          type="button"
          variant="ghost"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </Field>
  );
};

export default InputWithPassword;
