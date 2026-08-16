"use client";

import { createTPIOfficer } from "@/actions/userAction";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getLocationsByType } from "@/services/locationService";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import InputWithPassword from "./InputWithPassword";
import { Field, FieldLabel } from "./ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface CreateTPIDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTPIDialog({
  isOpen,
  onOpenChange,
}: CreateTPIDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    district_id: "",
    district_name: "",
    pan_number: "",
    address: "",
  });

  const [state, formAction, isPending] = useActionState(createTPIOfficer, {
    success: "",
    error: "",
  });

  useEffect(() => {
    if (state.success) {
      toast.success("TPI Officer created successfully.");
      onOpenChange(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state.success, state.error, onOpenChange]);

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
    const foundDistrict = districts.find(
      (d) => (d.district_code || d.districtid?.toString()) === value,
    );
    const districtName = foundDistrict?.districtname || "";

    setFormData((prev) => ({
      ...prev,
      district_id: value,
      district_name: districtName,
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
        district_name: "",
        pan_number: "",
        address: "",
      });
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[480px] p-0 border-0 rounded-2xl overflow-hidden bg-white shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gray-50/50">
          <DialogTitle className="text-[18px] font-bold text-[#1a2b3c]">
            Create TPI Officer
          </DialogTitle>
          <p className="text-[12px] text-gray-500 font-medium mt-1">
            Add a new Third Party Inspection officer for a district (Strictly 1 per district)
          </p>
        </DialogHeader>

        <form ref={formRef} action={formAction} className="space-y-4 p-6">
          <input type="hidden" name="district_id" value={formData.district_id} />
          <input
            type="hidden"
            name="district_name"
            value={formData.district_name}
          />

          <Field>
            <FieldLabel className="text-[12px] font-bold text-[#1a2b3c]">
              District <span className="text-red-500">*</span>
            </FieldLabel>
            <Select
              value={formData.district_id}
              onValueChange={handleDistrictChange}
              disabled={districtsLoading}
            >
              <SelectTrigger className="h-10 border-gray-200 focus:border-[#136FB6] focus:ring-0 text-[13px] bg-white">
                <SelectValue
                  placeholder={
                    districtsLoading
                      ? "Loading districts..."
                      : "Select assigned district"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => {
                  const code = district.district_code || district.districtid?.toString();
                  return (
                    <SelectItem key={district.districtid || code} value={code}>
                      {district.districtname}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel className="text-[12px] font-bold text-[#1a2b3c]">
              Full Name <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              name="name"
              placeholder="e.g. Ramesh Chandra"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="h-10 border-gray-200 focus:border-[#136FB6] focus:ring-0 text-[13px]"
            />
          </Field>

          <Field>
            <FieldLabel className="text-[12px] font-bold text-[#1a2b3c]">
              Email Address <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              name="email"
              type="email"
              placeholder="e.g. tpi.jaipur@jjm.gov.in"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="h-10 border-gray-200 focus:border-[#136FB6] focus:ring-0 text-[13px]"
            />
          </Field>

          <Field>
            <FieldLabel className="text-[12px] font-bold text-[#1a2b3c]">
              Mobile Number (10 Digits)
            </FieldLabel>
            <Input
              name="mobile"
              placeholder="e.g. 9876543210"
              value={formData.mobile}
              onChange={handleInputChange}
              maxLength={10}
              className="h-10 border-gray-200 focus:border-[#136FB6] focus:ring-0 text-[13px]"
            />
          </Field>

          <Field>
            <FieldLabel className="text-[12px] font-bold text-[#1a2b3c]">
              PAN Number
            </FieldLabel>
            <Input
              name="pan_number"
              placeholder="e.g. ABCDE1234F"
              value={formData.pan_number}
              onChange={handleInputChange}
              maxLength={10}
              className="h-10 border-gray-200 focus:border-[#136FB6] focus:ring-0 text-[13px] uppercase"
            />
          </Field>

          <Field>
            <FieldLabel className="text-[12px] font-bold text-[#1a2b3c]">
              Password <span className="text-red-500">*</span>
            </FieldLabel>
            <InputWithPassword
              name="password"
              placeholder="Min. 8 characters with upper, lower, number"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="h-10 border-gray-200 focus:border-[#136FB6] focus:ring-0 text-[13px]"
            />
          </Field>

          <DialogFooter className="pt-4 border-t border-gray-100 flex gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 text-[13px] font-semibold border-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !formData.district_id || !formData.name || !formData.email || !formData.password}
              className="h-10 text-[13px] font-semibold bg-[#136FB6] hover:bg-[#0f5a94] text-white"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create TPI Officer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
