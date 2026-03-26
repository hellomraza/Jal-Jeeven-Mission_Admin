"use client";

import { createContractor } from "@/actions/userAction";
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
import { useActionState, useEffect, useRef, useState } from "react";
import InputWithPassword from "./InputWithPassword";
import { Field, FieldLabel } from "./ui/field";

interface CreateContractorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateContractorDialog({
  isOpen,
  onOpenChange,
}: CreateContractorDialogProps) {
  const { toast } = useToast();
  const fromRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [state, formAction, isPending] = useActionState(createContractor, {
    success: "",
    error: "",
  });

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Success",
        description: "Contractor created successfully.",
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
      setFormData({ name: "", email: "", password: "" });
    }
    onOpenChange(open);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Contractor</DialogTitle>
          </DialogHeader>

          <form action={formAction} ref={fromRef} className="space-y-4 mt-4">
            <Field>
              <FieldLabel className="text-xs font-semibold text-gray-500">
                Name
              </FieldLabel>
              <Input
                type="text"
                name="name"
                required
                placeholder="Jane Smith"
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
                placeholder="contractor@jjm.local"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isPending}
              />
            </Field>

            <div className="space-y-2">
              <InputWithPassword
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isPending}
              />
              <p className="text-xs text-gray-500">
                Min 8 chars, uppercase, lowercase, number
              </p>
            </div>
            {state.error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-700">{state.error}</p>
              </div>
            )}

            <DialogFooter>
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
                className="bg-[#136FB6] hover:bg-[#0d5a8f]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
