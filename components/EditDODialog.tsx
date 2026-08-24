"use client";

import { updateDistrictOfficer } from "@/actions/userAction";
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

interface EditDODialogProps {
  officer: any | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditDODialog({
  officer,
  isOpen,
  onOpenChange,
}: EditDODialogProps) {
  const { toast } = useToast();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    mobile: "",
    district_id: "",
    password: "",
    is_bulk_order_allowed: false,
  });

  const [state, formAction, isPending] = useActionState(updateDistrictOfficer, {
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
    if (isOpen && officer) {
      setFormData({
        id: officer.id,
        name: officer.name || "",
        email: officer.email || "",
        mobile: officer.mobile || "",
        district_id:
          officer.district_id || officer.district_id?.toString() || "",
        password: "",
        is_bulk_order_allowed: Boolean(officer.is_bulk_order_allowed),
      });
      setHasSubmitted(false);
    }
  }, [officer, isOpen]);

  useEffect(() => {
    if (state.success && hasSubmitted) {
      toast({
        title: "Success",
        description: "Divisional Account Officer updated successfully.",
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
        mobile: "",
        district_id: "",
        password: "",
        is_bulk_order_allowed: false,
      });
      setHasSubmitted(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Divisional Account Officer</DialogTitle>
        </DialogHeader>

        <form
          action={formAction}
          className="mt-4 space-y-4"
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

          <InputWithPassword
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={isPending}
          />

          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div>
              <label
                htmlFor="edit_is_bulk_order_allowed"
                className="text-xs font-bold text-[#1a2b3c] cursor-pointer"
              >
                Allow Bulk Orders
              </label>
              <p className="text-[11px] text-gray-500">
                Grant Bulk Village workflow & TPI assignment permissions for district
              </p>
            </div>
            <input
              type="checkbox"
              id="edit_is_bulk_order_allowed"
              name="is_bulk_order_allowed"
              checked={formData.is_bulk_order_allowed}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_bulk_order_allowed: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-gray-300 text-[#136FB6] focus:ring-[#136FB6]"
              disabled={isPending}
            />
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
