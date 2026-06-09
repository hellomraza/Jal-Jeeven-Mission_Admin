"use client";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/hooks/useUser";
import { getAgreements } from "@/services/agreementService";
import { getLocationsByType } from "@/services/locationService";
import { getWorkItem, updateWorkItem } from "@/services/workService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueries } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const editWorkOrderSchema = z.object({
  work_code: z.string().trim().min(1, "Work code is required"),
  schemetype: z.string().trim().min(1, "Scheme type is required"),
  workcodeid: z.string().trim().optional(),
  excel: z.string().trim().optional(),
  district_id: z.string().trim().optional(),
  block_id: z.string().trim().optional(),
  panchayat_id: z.string().trim().optional(),
  nofhtc: z.string().trim().optional(),
  amount_approved: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  sr: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  agreement_id: z.string().optional().or(z.literal("")),
  title: z.string().trim().optional(),
  latitude: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  longitude: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  progress_percentage: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0).max(100).optional()
  ),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional().default("PENDING"),
});

type EditWorkOrderFormValues = z.infer<typeof editWorkOrderSchema>;

type LocationOption = {
  id: number;
  code: string;
  name: string;
  district_id?: number;
};

const LOCATION_META: Record<
  string,
  { idKey: string; nameKey: string; parentDistrictKey?: string }
> = {
  districts: { idKey: "districtid", nameKey: "districtname" },
  blocks: {
    idKey: "blockid",
    nameKey: "blockname",
    parentDistrictKey: "district_id",
  },
  panchayats: {
    idKey: "panchayatid",
    nameKey: "panchayatname",
    parentDistrictKey: "district_id",
  },
};

const LOCATION_TYPES = ["districts", "blocks", "panchayats"] as const;

const mapLocationOptions = (
  type: string,
  records: any[] = [],
): LocationOption[] => {
  const meta = LOCATION_META[type];
  if (!meta) return [];

  return records.reduce<LocationOption[]>((acc, item) => {
    const id = Number(item?.[meta.idKey]);
    const name = String(item?.[meta.nameKey] || "").trim();
    const districtId = meta.parentDistrictKey
      ? Number(item?.[meta.parentDistrictKey])
      : undefined;

    let code = "";
    if (type === "districts") {
      code = item?.district_code || item?.districtcode || "";
    } else if (type === "blocks") {
      code = item?.block_code || item?.blockcode || "";
    } else if (type === "panchayats") {
      code = item?.panchayat_code || item?.panchayatcode || "";
    }

    if (!Number.isFinite(id) || !name) return acc;

    acc.push({
      id,
      code,
      name,
      district_id: Number.isFinite(districtId as number)
        ? districtId
        : undefined,
    });

    return acc;
  }, []);
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

export default function EditWorkOrderPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<EditWorkOrderFormValues | null>(null);

  const { data: workItem, isLoading: isWorkItemLoading } = useQuery({
    queryKey: ["work-item", id],
    queryFn: () => getWorkItem(id),
    enabled: !!id,
  });

  const form = useForm<EditWorkOrderFormValues>({
    resolver: zodResolver(editWorkOrderSchema),
    mode: "onChange",
    defaultValues: {
      work_code: "",
      schemetype: "",
      workcodeid: "",
      excel: "",
      district_id: "",
      block_id: "",
      panchayat_id: "",
      nofhtc: "",
      amount_approved: undefined,
      sr: undefined,
      agreement_id: "",
      title: "",
      latitude: undefined,
      longitude: undefined,
      progress_percentage: 0,
      status: "PENDING",
    },
  });

  // Load options
  const { data: userInfo, isLoading: isUserLoading } = useUser();

  const locationQueries = useQueries({
    queries: LOCATION_TYPES.map((type) => ({
      queryKey: ["locations", type],
      queryFn: () => getLocationsByType(type),
    })),
  });

  const { data: agreementsData, isLoading: isAgreementsLoading } = useQuery({
    queryKey: ["agreements"],
    queryFn: () => getAgreements(1, 500),
  });

  const locationDataByType = useMemo(() => {
    const map = {} as Record<string, LocationOption[]>;

    LOCATION_TYPES.forEach((type, index) => {
      const queryData = locationQueries[index]?.data;
      const records = queryData?.data || [];
      map[type] = mapLocationOptions(type, records);
    });

    return map;
  }, [locationQueries]);

  const selectedDistrictCode = form.watch("district_id");
  const districtObj = (locationDataByType.districts || []).find(
    (d) => d.code === selectedDistrictCode
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

  // Sync form values once workItem is loaded
  useEffect(() => {
    if (!workItem) return;

    form.reset({
      work_code: workItem.work_code || "",
      schemetype: workItem.schemetype || "",
      workcodeid: workItem.workcodeid || "",
      excel: workItem.excel || "",
      district_id: workItem.district_id || "",
      block_id: String(workItem.block_id || ""),
      panchayat_id: String(workItem.panchayat_id || ""),
      nofhtc: workItem.nofhtc || "",
      amount_approved: workItem.amount_approved !== undefined ? Number(workItem.amount_approved) : undefined,
      sr: workItem.serial_no !== undefined ? Number(workItem.serial_no) : undefined,
      agreement_id: workItem.agreement_id || "",
      title: workItem.title || "",
      latitude: workItem.latitude !== undefined ? Number(workItem.latitude) : undefined,
      longitude: workItem.longitude !== undefined ? Number(workItem.longitude) : undefined,
      progress_percentage: workItem.progress_percentage !== undefined ? Number(workItem.progress_percentage) : 0,
      status: workItem.status || "PENDING",
    });
  }, [workItem, form]);

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => updateWorkItem(id, payload),
    onSuccess: () => {
      toast.success("Work item updated successfully");
      router.push("/work-order");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update work item");
    },
  });

  const onSubmit = (values: EditWorkOrderFormValues) => {
    const payload = {
      work_code: values.work_code,
      schemetype: values.schemetype,
      workcodeid: values.workcodeid || undefined,
      excel: values.excel || undefined,
      district_id: values.district_id || undefined,
      block_id: values.block_id || undefined,
      panchayat_id: values.panchayat_id || undefined,
      nofhtc: values.nofhtc || undefined,
      amount_approved: values.amount_approved !== undefined ? values.amount_approved : undefined,
      sr: values.sr !== undefined ? values.sr : undefined,
      agreement_id: values.agreement_id || undefined,
      title: values.title || undefined,
      latitude: values.latitude !== undefined ? values.latitude : undefined,
      longitude: values.longitude !== undefined ? values.longitude : undefined,
      progress_percentage: values.progress_percentage !== undefined ? values.progress_percentage : undefined,
      status: values.status || undefined,
    };
    updateMutation.mutate(payload);
  };

  const onRequestUpdate = form.handleSubmit((values) => {
    setPendingValues(values);
    setIsConfirmOpen(true);
  });

  const onConfirmUpdate = () => {
    if (!pendingValues || updateMutation.isPending) return;

    onSubmit(pendingValues);
    setIsConfirmOpen(false);
    setPendingValues(null);
  };

  const isLocationLoading = locationQueries.some((query) => query.isLoading);
  const isAllowed = userInfo?.role === "HO" || userInfo?.role === "DO" || userInfo?.role === "CO";

  const isPageLoading = isWorkItemLoading || isUserLoading;

  // Find linked agreement name if already assigned
  const assignedAgreement = useMemo(() => {
    if (!workItem?.agreement_id || !agreementsData?.data) return null;
    return agreementsData.data.find((ag: any) => ag.id === workItem.agreement_id);
  }, [workItem?.agreement_id, agreementsData?.data]);

  if (isPageLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#1a2b3c]" />
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="max-w-180 mx-auto mt-10 bg-white rounded-xl border border-red-100 p-6">
        <h2 className="text-[18px] font-bold text-[#1a2b3c]">
          Access Restricted
        </h2>
        <p className="text-[13px] text-gray-600 mt-2">
          Only Head Officers, District Officers, or Contractors can edit work items.
        </p>
        <Button className="mt-4" onClick={() => router.replace("/work-order")}>
          Back
        </Button>
      </div>
    );
  }

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
          <Form {...form}>
            <form className="space-y-6" onSubmit={onRequestUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="work_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="W123456789012" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schemetype"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheme Type *</FormLabel>
                      <FormControl>
                        <Input placeholder="PWS" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Work Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                <FormField
                  control={form.control}
                  name="workcodeid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Code ID</FormLabel>
                      <FormControl>
                        <Input placeholder="workcode-123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excel</FormLabel>
                      <FormControl>
                        <Input placeholder="records.xlsx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number (SR)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={Boolean(userInfo?.district_id)}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(locationDataByType.districts || []).map((item) => (
                            <SelectItem key={item.id} value={item.code}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="block_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Block</FormLabel>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={!selectedDistrictCode}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Select block" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {blocks.map((item) => (
                            <SelectItem key={item.id} value={String(item.code)}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="panchayat_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Panchayat</FormLabel>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={!selectedDistrictCode}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Select panchayat" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {panchayats.map((item) => (
                            <SelectItem key={item.id} value={String(item.code)}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nofhtc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approved FHTCs</FormLabel>
                      <FormControl>
                        <Input placeholder="850" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount_approved"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approved Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="1500000.00"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Agreement Assignment Logic */}
                {workItem?.agreement_id ? (
                  <FormItem>
                    <FormLabel>Linked Agreement (Read-Only)</FormLabel>
                    <FormControl>
                      <Input
                        value={assignedAgreement ? `${assignedAgreement.agreementno} (${assignedAgreement.agreementyear})` : workItem.agreement_id}
                        disabled
                        className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                      />
                    </FormControl>
                    <p className="text-[11px] text-amber-600 mt-1">
                      Agreement cannot be modified once assigned.
                    </p>
                  </FormItem>
                ) : (
                  <FormField
                    control={form.control}
                    name="agreement_id"
                    render={({ field }) => {
                      const agreementsList = (agreementsData?.data || []).map((ag: any) => ({
                        label: `${ag.agreementno} (${ag.agreementyear})`,
                        value: ag.id,
                      }));

                      return (
                        <FormItem>
                          <FormLabel>Linked Agreement</FormLabel>
                          <FormControl>
                            <ComboboxPopup
                              items={agreementsList}
                              value={field.value}
                              onValueChange={(item) => {
                                field.onChange(item?.value || "");
                              }}
                              placeholder="Select associated agreement"
                              isLoading={isAgreementsLoading}
                              emptyMessage="No agreements found"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}

                {/* <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="25.5941"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                {/* <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="85.1376"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                {/* <FormField
                  control={form.control}
                  name="progress_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Progress Percentage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          max="100"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                {/* <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value || "PENDING"}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </div>

              {(isLocationLoading || isAgreementsLoading) && (
                <div className="text-[12px] text-gray-500 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Loading dropdown options...
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-[#1a2b3c] hover:bg-[#1a2b3c]/90 text-white"
                >
                  {updateMutation.isPending ? (
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
          </Form>
        </CardContent>
      </Card>

      <AlertDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          setIsConfirmOpen(open);
          if (!open && !updateMutation.isPending) {
            setPendingValues(null);
          }
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
            <AlertDialogCancel disabled={updateMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                onConfirmUpdate();
              }}
              disabled={updateMutation.isPending}
              className="bg-[#1a2b3c] hover:bg-[#1a2b3c]/90 text-white"
            >
              {updateMutation.isPending ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
