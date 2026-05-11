"use client";

import { createEmployee } from "@/actions/userAction";
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
import { getLocationsByType } from "@/services/locationService";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import InputWithPassword from "./InputWithPassword";
import { Field, FieldLabel } from "./ui/field";
import { Textarea } from "./ui/textarea";

interface CreateEmployeeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateEmployeeDialog({
  isOpen,
  onOpenChange,
}: CreateEmployeeDialogProps) {
  const { toast } = useToast();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    district_name: "",
    address: "",
    password: "",
  });

  const [state, formAction, isPending] = useActionState(createEmployee, {
    success: "",
    error: "",
  });

  console.log("CreateEmployeeDialog state:", state);

  const districtsQuery = useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const response = await getLocationsByType("districts");
      const districtList = response?.data || response || [];
      return Array.isArray(districtList) ? (districtList as District[]) : [];
    },
    enabled: isOpen,
  });

  const districts = districtsQuery.data || [];
  const districtsLoading = districtsQuery.isLoading;
  const districtsError = districtsQuery.error
    ? districtsQuery.error instanceof Error
      ? districtsQuery.error.message
      : "Failed to load districts from location api"
    : "";

  useEffect(() => {
    if (state.success && hasSubmitted) {
      toast({
        title: "Success",
        description: "Employee created successfully.",
      });
      setHasSubmitted(false);
      onOpenChange(false);
    }
  }, [state.success, hasSubmitted, toast, onOpenChange]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDistrictChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      district_name: value,
    }));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({
        name: "",
        email: "",
        mobile: "",
        district_name: "",
        address: "",
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
          <DialogTitle>Create New Employee</DialogTitle>
        </DialogHeader>

        <form
          action={formAction}
          className="mt-4 space-y-4"
          onSubmit={() => setHasSubmitted(true)}
        >
          <Field>
            <FieldLabel className="text-xs font-semibold text-gray-500">
              Name
            </FieldLabel>
            <Input
              type="text"
              name="name"
              required
              placeholder="John Doe"
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
              placeholder="employee@jjm.local"
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
              placeholder="9876543210"
              value={formData.mobile}
              onChange={handleInputChange}
              disabled={isPending}
            />
          </Field>

          {/* <Field>
            <FieldLabel className="text-xs font-semibold text-gray-500">
              District
            </FieldLabel>
            <Select
              name="district_name"
              value={formData.district_name}
              onValueChange={handleDistrictChange}
              disabled={isPending || districtsLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    districtsLoading
                      ? "Loading districts..."
                      : "Select district"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem
                    key={district.districtid}
                    value={district.districtname}
                  >
                    {district.districtname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="hidden"
              name="district_name"
              value={formData.district_name}
            />
            {districtsError && (
              <p className="mt-1 text-xs text-red-600">{districtsError}</p>
            )}
          </Field> */}

          <Field>
            <FieldLabel className="text-xs font-semibold text-gray-500">
              Address
            </FieldLabel>
            <Textarea
              name="address"
              required
              placeholder="Full postal address"
              value={formData.address}
              onChange={handleInputChange}
              disabled={isPending}
              rows={3}
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

          {state.error && hasSubmitted && (
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
  );
}
