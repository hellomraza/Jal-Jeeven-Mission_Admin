"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const InputWithPassword = (props: React.ComponentProps<"input">) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-sm space-y-2">
      <Label
        htmlFor="password-toggle"
        className="text-xs text-gray-500 font-semibold"
      >
        Password
      </Label>
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
    </div>
  );
};

export default InputWithPassword;
