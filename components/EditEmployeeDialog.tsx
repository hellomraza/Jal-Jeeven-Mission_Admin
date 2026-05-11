"use client";

import { updateEmployee } from "@/actions/userAction";
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
import { Field, FieldLabel } from "./ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

interface EditEmployeeDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditEmployeeDialog({
  employee,
  isOpen,
  onOpenChange,
}: EditEmployeeDialogProps) {
  const { toast } = useToast();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    mobile: "",
    district_name: "",
    address: "",
  });

  const [state, formAction, isPending] = useActionState(updateEmployee, {
    success: "",
    error: "",
  });

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
    if (isOpen && employee) {
      setFormData({
        id: employee.id,
        name: employee.name || "",
        email: employee.email || "",
        mobile: employee.mobile || "",
        district_name: employee.district_name || "",
        address: employee.address || "",
      });
      setHasSubmitted(false);
    }
  }, [employee, isOpen]);

  useEffect(() => {
    if (state.success && hasSubmitted) {
      toast({
        title: "Success",
        description: "Employee updated successfully.",
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
        id: "",
        name: "",
        email: "",
        mobile: "",
        district_name: "",
        address: "",
      });
      setHasSubmitted(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
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
            <input
              type="hidden"
              name="district_name"
              value={formData.district_name}
            />
            {districtsError && (
              <p className="mt-1 text-xs text-red-600">{districtsError}</p>
            )}
          </Field>

          <Field>
            <FieldLabel className="text-xs font-semibold text-gray-500">
              Address
            </FieldLabel>
            <Textarea
              name="address"
              required
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Full postal address"
              disabled={isPending}
              rows={3}
            />
          </Field>

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
