"use client";

import { updateWorkOrderAction } from "@/actions/workOrderAction";
import BackButton from "@/components/BackButton";
import { ComboboxPopup } from "@/components/ComboboxPopup";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/types/usertypes";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

type LocationOption = {
  id: number;
  code: string;
  name: string;
  district_id?: number;
};

const filterByDistrict = (
  list: LocationOption[],
  selectedDistrictId: number | null,
) => {
  if (!selectedDistrictId) return list;

  return list.filter((item) => {
    if (!Number.isFinite(item.district_id as number)) return true;
    return Number(item.district_id) === selectedDistrictId;
  });
};

export default function EditWorkOrder({ workItem, userRole, agreements, assignedAgreement, locationDataByType }: {
  workItem: WorkItem;
  userRole: UserRole;
  agreements: Agreement[];
  assignedAgreement: Agreement | null;
  locationDataByType: {
    districts: LocationOption[];
    blocks: LocationOption[];
    panchayats: LocationOption[];
  };
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    id: workItem.id,
    work_code: workItem.work_code || "",
    schemetype: workItem.schemetype || "",
    workcodeid: workItem.workcodeid || "",
    excel: workItem.excel || "",
    district_id: String(workItem.district_id || ""),
    block_id: String(workItem.block_id || ""),
    panchayat_id: String(workItem.panchayat_id || ""),
    nofhtc: workItem.nofhtc || "",
    amount_approved: workItem.amount_approved !== undefined ? String(workItem.amount_approved) : "",
    sr: workItem.serial_no !== undefined ? String(workItem.serial_no) : "",
    agreement_id: workItem.agreement_id || "",
    title: workItem.title || "",
    latitude: workItem.latitude !== undefined ? String(workItem.latitude) : "",
    longitude: workItem.longitude !== undefined ? String(workItem.longitude) : "",
    progress_percentage: workItem.progress_percentage !== undefined ? String(workItem.progress_percentage) : "0",
    status: workItem.status || "PENDING",
  });

  const [state, formAction, isPending] = useActionState(updateWorkOrderAction, {
    success: "",
    error: "",
  });

  console.log(state)

  const districtObj = (locationDataByType.districts).find(
    (d) => d.code === formData.district_id
  );
  const districtFilter = districtObj ? districtObj.id : null;

  const blocks = filterByDistrict(
    locationDataByType.blocks || [],
    districtFilter,
  );
  const panchayats = filterByDistrict(
    locationDataByType.panchayats || [],
    districtFilter,
  );

  // Handle action state notifications
  useEffect(() => {
    if (state.success && hasSubmitted) {
      toast.success(state.success);
      setHasSubmitted(false);
      router.push("/work-order");
    } else if (state.error && hasSubmitted) {
      toast.error(state.error);
      setHasSubmitted(false);
    }
  }, [state.success, state.error, hasSubmitted, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "district_id") {
        updated.block_id = "";
        updated.panchayat_id = "";
      } else if (name === "block_id") {
        updated.panchayat_id = "";
      }
      return updated;
    });
  };

  const onRequestUpdate = (e: React.FormEvent) => {
    setIsConfirmOpen(true);
  };

  const onConfirmUpdate = () => {
    setIsConfirmOpen(false);
    setHasSubmitted(true);
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };



  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-[22px] font-extrabold text-[#1a2b3c]">
            Edit Work Item
          </h1>
          <p className="text-[12px] text-gray-500 mt-1">
            Modify details for work code: <span className="font-semibold">{workItem?.work_code}</span>
          </p>
        </div>
      </div>

      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.03)] rounded-[20px]">
        <CardHeader className="pb-4">
          <CardTitle className="text-[18px] text-[#1a2b3c]">
            Work Item Information
          </CardTitle>
          <CardDescription>
            Edit category, location, and associated agreement mappings.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <form ref={formRef} action={formAction} className="space-y-6">
            <input type="hidden" name="id" value={formData.id} />
            <input type="hidden" name="district_id" value={formData.district_id} />
            <input type="hidden" name="block_id" value={formData.block_id} />
            <input type="hidden" name="panchayat_id" value={formData.panchayat_id} />
            <input type="hidden" name="agreement_id" value={formData.agreement_id} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-500">Work Code *</FieldLabel>
                <Input
                  name="work_code"
                  required
                  placeholder="W123456789012"
                  value={formData.work_code}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-500">Scheme Type *</FieldLabel>
                <Input
                  name="schemetype"
                  required
                  placeholder="PWS"
                  value={formData.schemetype}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-500">Work Code ID</FieldLabel>
                <Input
                  name="workcodeid"
                  placeholder="workcode-123"
                  value={formData.workcodeid}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-500">Excel</FieldLabel>
                <Input
                  name="excel"
                  placeholder="records.xlsx"
                  value={formData.excel}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-500">Serial Number (SR)</FieldLabel>
                <Input
                  type="number"
                  name="sr"
                  placeholder="5"
                  value={formData.sr}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-500">District</FieldLabel>
                {locationDataByType.districts && locationDataByType.districts.length > 0 ? (
                  <Select
                    value={formData.district_id}
                    onValueChange={(val) => handleSelectChange("district_id", val)}
                    disabled={userRole !== UserRole.HeadOfficer}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationDataByType.districts.map((item) => (
                        <SelectItem key={item.code} value={item.code}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input disabled value="Loading districts..." className="bg-gray-50 text-gray-400" />
                )}
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-500">Block</FieldLabel>
                <Select
                  value={formData.block_id}
                  onValueChange={(val) => handleSelectChange("block_id", val)}
                  disabled={isPending || !formData.district_id}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select block" />
                  </SelectTrigger>
                  <SelectContent>
                    {blocks.map((item) => (
                      <SelectItem key={item.id} value={String(item.code)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-500">Panchayat</FieldLabel>
                <Select
                  value={formData.panchayat_id}
                  onValueChange={(val) => handleSelectChange("panchayat_id", val)}
                  disabled={isPending || !formData.district_id}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select panchayat" />
                  </SelectTrigger>
                  <SelectContent>
                    {panchayats.map((item) => (
                      <SelectItem key={item.id} value={String(item.code)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-500">Approved FHTCs</FieldLabel>
                <Input
                  name="nofhtc"
                  placeholder="850"
                  value={formData.nofhtc}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-500">Approved Amount</FieldLabel>
                <Input
                  type="number"
                  step="any"
                  name="amount_approved"
                  placeholder="1500000.00"
                  value={formData.amount_approved}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
              </Field>

              {/* Agreement Assignment Logic */}
              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-500">Linked Agreement</FieldLabel>
                {(() => {
                  const agreementsList = agreements?.map((ag: any) => ({
                    label: `${ag.agreementno} (${ag.agreementyear})`,
                    value: ag.id,
                  }));

                  return (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <ComboboxPopup
                          items={agreementsList}
                          value={formData.agreement_id}
                          onValueChange={(item) => handleSelectChange("agreement_id", item?.value || "")}
                          placeholder="Select associated agreement"
                          emptyMessage="No agreements found"
                        />
                      </div>
                      {formData.agreement_id && (
                        <Button
                          type="button"
                          variant="outline"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 shrink-0"
                          onClick={() => handleSelectChange("agreement_id", "")}
                        >
                          Remove Agreement
                        </Button>
                      )}
                    </div>
                  );
                })()}
              </Field>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onRequestUpdate}
                disabled={isPending}
                className="bg-[#1a2b3c] hover:bg-[#1a2b3c]/90 text-white"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          setIsConfirmOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save changes to this work item?</AlertDialogTitle>
            <AlertDialogDescription>
              Please confirm you want to update the details of this work item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmUpdate}
              disabled={isPending}
              className="bg-[#1a2b3c] hover:bg-[#1a2b3c]/90 text-white"
            >
              {isPending ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
