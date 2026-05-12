"use client";

import { createDistrictOfficer } from "@/actions/userAction";
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
import { useActionState, useEffect, useRef, useState } from "react";
import InputWithPassword from "./InputWithPassword";
import { Field, FieldLabel } from "./ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface CreateDODialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateDODialog({
  isOpen,
  onOpenChange,
}: CreateDODialogProps) {
  const { toast } = useToast();
  const fromRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    district_id: "",
  });

  const [state, formAction, isPending] = useActionState(createDistrictOfficer, {
    success: "",
    error: "",
  });

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Success",
        description: "District Officer created successfully.",
      });
      onOpenChange(false);
    }
  }, [state.success, toast, onOpenChange]);

  const districtsQuery = useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const response = await getLocationsByType("districts");
      const districtList = response?.data || response || [];
      return Array.isArray(districtList) ? (districtList as any[]) : [];
    },
    enabled: isOpen,
  });

  const districts = districtsQuery.data || [];
  const districtsLoading = districtsQuery.isLoading;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDistrictChange = (value: string) => {
    // set district_id based on selected district
    fromRef.current
      ?.querySelector('input[name="district_id"]')
      ?.setAttribute("value", value);
    setFormData((prev) => ({
      ...prev,
      district_id: value,
    }));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({
        name: "",
        email: "",
        password: "",
        mobile: "",
        district_id: "",
      });
    }
    onOpenChange(open);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New District Officer</DialogTitle>
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
                placeholder="John DO"
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
                placeholder="do@jjm.local"
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
                District
              </FieldLabel>
              <Select
                name="district"
                value={formData.district_id}
                disabled={isPending || districtsLoading}
                onValueChange={handleDistrictChange}
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
                  {districts.map((district: any) => (
                    <SelectItem
                      key={district.districtid}
                      value={String(district.district_code)}
                    >
                      {district.districtname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="hidden"
                name="district_id"
                value={formData.district_id}
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
