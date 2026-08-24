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
import { useMode } from "@/components/providers/ModeContext";
import { getAgreements } from "@/services/agreementService";
import { getLocationsByType } from "@/services/locationService";
import { createWorkItem } from "@/services/workService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const createWorkOrderSchema = z.object({
  work_code: z.string().trim().min(1, "Work code is required"),
  schemetype: z.string().trim().min(1, "Scheme type is required"),
  work_order_type: z.enum(["SVS", "BULK_VILLAGE"]).optional(),
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

type CreateWorkOrderFormValues = z.infer<typeof createWorkOrderSchema>;

type LocationOption = {
  id: number;
  code: string;
  name: string;
  district_id?: number;
};

const LOCATION_META: Record<
  LocationType,
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
  villages: {
    idKey: "villageid",
    nameKey: "villagename",
    parentDistrictKey: "district_id",
  },
  subdivisions: {
    idKey: "subdivisionid",
    nameKey: "subdivisionname",
    parentDistrictKey: "district_id",
  },
  circles: {
    idKey: "circleid",
    nameKey: "circlename",
    parentDistrictKey: "district_id",
  },
  zones: {
    idKey: "zoneid",
    nameKey: "zonename",
    parentDistrictKey: "district_id",
  },
};

const LOCATION_TYPES: LocationType[] = ["districts", "blocks", "panchayats"];

const mapLocationOptions = (
  type: LocationType,
  records: any[] = [],
): LocationOption[] => {
  const meta = LOCATION_META[type];

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

export default function CreateWorkOrderPage() {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<CreateWorkOrderFormValues | null>(null);

  const { mode } = useMode();

  const form = useForm<CreateWorkOrderFormValues>({
    resolver: zodResolver(createWorkOrderSchema),
    mode: "onChange",
    defaultValues: {
      work_code: "",
      schemetype: "",
      work_order_type: (mode as "SVS" | "BULK_VILLAGE") || "SVS",
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
    const map = {} as Record<LocationType, LocationOption[]>;

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

  // Auto-set DO district if available
  useEffect(() => {
    if (!userInfo?.district_id || !locationDataByType.districts?.length) return;

    const userDistrictIdNum = Number(userInfo.district_id);
    if (isNaN(userDistrictIdNum)) return;

    const matchDistrict = locationDataByType.districts.find(
      (d) => d.id === userDistrictIdNum
    );

    if (matchDistrict) {
      const currentVal = form.getValues("district_id");
      if (currentVal !== matchDistrict.code) {
        form.setValue("district_id", matchDistrict.code, {
          shouldDirty: false,
          shouldValidate: true,
        });
      }
    }
  }, [userInfo?.district_id, locationDataByType.districts, form]);

  // Clear sub-locations when district code changes
  useEffect(() => {
    form.setValue("block_id", "");
    form.setValue("panchayat_id", "");
  }, [selectedDistrictCode, form]);

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createWorkItem(payload),
    onSuccess: () => {
      toast.success("Work item created successfully");
      router.push("/work-order");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create work item");
    },
  });

  const onSubmit = (values: CreateWorkOrderFormValues) => {
    const payload = {
      work_code: values.work_code,
      schemetype: values.schemetype,
      work_order_type: values.work_order_type || mode || "SVS",
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
    createMutation.mutate(payload);
  };

  const onRequestCreate = form.handleSubmit((values) => {
    setPendingValues(values);
    setIsConfirmOpen(true);
  });

  const onConfirmCreate = () => {
    if (!pendingValues || createMutation.isPending) return;

    onSubmit(pendingValues);
    setIsConfirmOpen(false);
    setPendingValues(null);
  };

  const isLocationLoading = locationQueries.some((query) => query.isLoading);
  const isAllowed = userInfo?.role === "HO" || userInfo?.role === "DO" || userInfo?.role === "CO";

  if (isUserLoading) {
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
          Only Head Officers, Divisional Account Officers, or Contractors can create new work items.
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
            Create Work Item
          </h1>
          <p className="text-[12px] text-gray-500 mt-1">
            Fill out the details to manually register a new work item.
          </p>
        </div>
      </div>

      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.03)] rounded-[20px]">
        <CardHeader className="pb-4">
          <CardTitle className="text-[18px] text-[#1a2b3c]">
            Work Item Information
          </CardTitle>
          <CardDescription>
            Specify unique identifiers, category, location, and associated agreement.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
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
                        <Input placeholder="Sector C Pipeline Laying" {...field} />
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
                          <SelectTrigger className="w-full">
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
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select block" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {blocks.map((item) => (
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
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select panchayat" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {panchayats.map((item) => (
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
                />

                <FormField
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
                      <FormLabel>Initial Status</FormLabel>
                      <Select
                        value={field.value || "PENDING"}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
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
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={onRequestCreate}
                  disabled={createMutation.isPending}
                  className="bg-[#1a2b3c] hover:bg-[#1a2b3c]/90 text-white"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Work Item"
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
          if (!open && !createMutation.isPending) {
            setPendingValues(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create this work item?</AlertDialogTitle>
            <AlertDialogDescription>
              Please confirm you want to create this new work item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                onConfirmCreate();
              }}
              disabled={createMutation.isPending}
              className="bg-[#1a2b3c] hover:bg-[#1a2b3c]/90 text-white"
            >
              {createMutation.isPending ? "Creating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
