"use client";

import { updateDOStaff } from "@/actions/userAction";
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

interface EditDOStaffDialogProps {
  staff: any | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditDOStaffDialog({
  staff,
  isOpen,
  onOpenChange,
}: EditDOStaffDialogProps) {
  const { toast } = useToast();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [state, formAction, isPending] = useActionState(updateDOStaff, {
    success: "",
    error: "",
  });

  useEffect(() => {
    if (isOpen && staff) {
      setFormData({
        id: staff.id,
        name: staff.name || "",
        email: staff.email || "",
        mobile: staff.mobile || "",
        password: "",
      });
      setHasSubmitted(false);
    }
  }, [staff, isOpen]);

  useEffect(() => {
    if (state.success && hasSubmitted) {
      toast({
        title: "Success",
        description: "Data Entry Operator updated successfully.",
      });
      setHasSubmitted(false);
      onOpenChange(false);
    }
  }, [state.success, hasSubmitted, toast, onOpenChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({
        id: "",
        name: "",
        email: "",
        mobile: "",
        password: "",
      });
      setHasSubmitted(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Data Entry Operator</DialogTitle>
        </DialogHeader>

        <form
          action={formAction}
          className="mt-4 space-y-4"
          onSubmit={() => setHasSubmitted(true)}
        >
          <input type="hidden" name="id" value={formData.id} />

          <Field>
            <FieldLabel className="text-xs font-semibold text-gray-500">
              Name
            </FieldLabel>
            <Input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              disabled={isPending}
            />
          </Field>

          <Field>
            <FieldLabel className="text-xs font-semibold text-gray-500">
              Email
            </FieldLabel>
            <Input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              disabled={isPending}
            />
          </Field>

          <Field>
            <FieldLabel className="text-xs font-semibold text-gray-500">
              Mobile Number
            </FieldLabel>
            <Input
              type="tel"
              name="mobile"
              required
              maxLength={10}
              value={formData.mobile}
              onChange={handleInputChange}
              disabled={isPending}
            />
          </Field>

          <InputWithPassword
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={isPending}
          />

          {state.error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              className="bg-[#136FB6] hover:bg-[#0d5a8f] text-white"
              disabled={isPending || !formData.id}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
