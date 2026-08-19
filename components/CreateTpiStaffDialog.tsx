"use client";

import { createTpiStaff } from "@/actions/userAction";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import InputWithPassword from "./InputWithPassword";
import { Field, FieldLabel } from "./ui/field";

interface CreateTpiStaffDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTpiStaffDialog({
  isOpen,
  onOpenChange,
}: CreateTpiStaffDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [state, formAction, isPending] = useActionState(createTpiStaff, {
    success: "",
    error: "",
  });

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Success",
        description: "TPI Staff member created successfully.",
      });
      onOpenChange(false);
    }
  }, [state.success, toast, onOpenChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({
        name: "",
        email: "",
        password: "",
      });
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add TPI Inspection Staff</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4 mt-2">
          <Field>
            <FieldLabel className="text-xs font-semibold text-gray-500">
              Full Name
            </FieldLabel>
            <Input
              type="text"
              name="name"
              required
              placeholder="e.g. Ramesh Kumar"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isPending}
            />
          </Field>

          <Field>
            <FieldLabel className="text-xs font-semibold text-gray-500">
              Email Address
            </FieldLabel>
            <Input
              type="email"
              name="email"
              required
              placeholder="inspector@agency.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isPending}
            />
          </Field>

          <div className="space-y-1">
            <InputWithPassword
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isPending}
            />
            <p className="text-[11px] text-gray-500">
              Min 8 chars, uppercase, lowercase, number
            </p>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl text-[11px] text-blue-800">
            <strong>Note:</strong> TPI staff log in via the mobile app using their email & password to capture on-site baseline reference photos.
          </div>

          {state.error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#136FB6] hover:bg-[#0d5a8f] text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Staff Member"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
