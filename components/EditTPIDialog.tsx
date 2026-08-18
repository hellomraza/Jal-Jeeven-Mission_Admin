"use client";

import { updateTpi } from "@/actions/userAction";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface EditTPIDialogProps {
  tpi: any | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditTPIDialog({
  tpi,
  isOpen,
  onOpenChange,
}: EditTPIDialogProps) {
  const { toast } = useToast();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    code: "",
    mobile: "",
    district_id: "",
    pan_number: "",
    address: "",
    password: "",
  });

  const [state, formAction, isPending] = useActionState(updateTpi, {
    success: "",
    error: "",
  });

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

  useEffect(() => {
    if (isOpen && tpi) {
      setFormData({
        id: tpi.id,
        name: tpi.name || "",
        email: tpi.email || "",
        code: tpi.code || "",
        mobile: tpi.mobile || "",
        district_id: tpi.district_id?.toString() || "",
        pan_number: tpi.pan_number || "",
        address: tpi.address || "",
        password: "",
      });
      setHasSubmitted(false);
    }
  }, [tpi, isOpen]);

  useEffect(() => {
    if (state.success && hasSubmitted) {
      toast({
        title: "Success",
        description: "TPI Agency updated successfully.",
      });
      setHasSubmitted(false);
      onOpenChange(false);
    }
  }, [state.success, hasSubmitted, toast, onOpenChange]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDistrictChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      district_id: value,
    }));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({
        id: "",
        name: "",
        email: "",
        code: "",
        mobile: "",
        district_id: "",
        pan_number: "",
        address: "",
        password: "",
      });
      setHasSubmitted(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit TPI Agency</DialogTitle>
        </DialogHeader>

        <form
          action={formAction}
          className="space-y-3.5 mt-2"
          onSubmit={() => setHasSubmitted(true)}
        >
          <input type="hidden" name="id" value={formData.id} />
          <input
            type="hidden"
            name="district_id"
            value={formData.district_id}
          />

          <Field>
            <FieldLabel className="text-xs font-semibold text-gray-500">
              Agency Name
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
              User Code (Immutable)
            </FieldLabel>
            <Input
              type="text"
              disabled
              value={formData.code}
              className="bg-gray-50 text-gray-500"
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
              District
            </FieldLabel>
            <Select
              name="district"
              value={formData.district_id}
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
                {districts.map((district: any) => (
                  <SelectItem
                    key={district.district_code}
                    value={String(district.district_code)}
                  >
                    {district.districtname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel className="text-xs font-semibold text-gray-500">
                Mobile Number
              </FieldLabel>
              <Input
                type="tel"
                name="mobile"
                maxLength={10}
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
                value={formData.pan_number}
                onChange={handleInputChange}
                disabled={isPending}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel className="text-xs font-semibold text-gray-500">
              Address
            </FieldLabel>
            <Input
              type="text"
              name="address"
              value={formData.address}
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
              Leave blank to keep existing password
            </p>
          </div>

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
