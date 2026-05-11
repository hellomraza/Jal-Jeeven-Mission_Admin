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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getLocationsByType } from "@/services/locationService";
import { useQuery } from "@tanstack/react-query";
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
    mobile: "",
    pan_number: "",
    district_name: "",
    address: "",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "pan_number" ? value.toUpperCase() : value,
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
        password: "",
        mobile: "",
        pan_number: "",
        district_name: "",
        address: "",
      });
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

            <Field>
              <FieldLabel className="text-xs font-semibold text-gray-500">
                PAN Number
              </FieldLabel>
              <Input
                type="text"
                name="pan_number"
                required
                maxLength={10}
                placeholder="ABCDE1234F"
                value={formData.pan_number}
                onChange={handleInputChange}
                disabled={isPending}
                pattern="[A-Z]{5}[0-9]{4}[A-Z]"
                title="PAN must follow the format AAAAA9999A"
                autoComplete="off"
              />
              <p className="text-xs text-gray-500">Format: AAAAA9999A</p>
            </Field>

            <Field>
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
              {districtsError && (
                <p className="text-xs text-red-600 mt-1">{districtsError}</p>
              )}
            </Field>

            <Field>
              <FieldLabel className="text-xs font-semibold text-gray-500">
                Address
              </FieldLabel>
              <Input
                type="text"
                name="address"
                required
                placeholder="Full postal address"
                value={formData.address}
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
