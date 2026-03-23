"use client";

import BackButton from "@/components/BackButton";
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
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/hooks/useUser";
import {
  getLocationsByType,
  type LocationType,
} from "@/services/locationService";
import { getContractors } from "@/services/userService";
import { createWorkItem } from "@/services/workService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const requiredNumber = (label: string, min?: number, max?: number) => {
  let schema = z
    .number({ invalid_type_error: `${label} must be a number` })
    .finite(`${label} must be a valid number`);

  if (typeof min === "number") {
    schema = schema.min(min, `${label} must be at least ${min}`);
  }

  if (typeof max === "number") {
    schema = schema.max(max, `${label} must be at most ${max}`);
  }

  return z.preprocess((value) => Number(value), schema);
};

const optionalNumber = (label: string, min?: number, max?: number) => {
  let schema = z
    .number({ invalid_type_error: `${label} must be a number` })
    .finite(`${label} must be a valid number`);

  if (typeof min === "number") {
    schema = schema.min(min, `${label} must be at least ${min}`);
  }

  if (typeof max === "number") {
    schema = schema.max(max, `${label} must be at most ${max}`);
  }

  return z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }
    return Number(value);
  }, schema.optional());
};

const createWorkItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title is too long"),
  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional()
    .or(z.literal("")),
  district_id: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }
      return Number(value);
    },
    z
      .number({
        required_error: "District is required",
        invalid_type_error: "District is required",
      })
      .int("District is required")
      .min(1, "District is required"),
  ),
  block_id: optionalNumber("Block ID", 1),
  panchayat_id: optionalNumber("Panchayat ID", 1),
  village_id: optionalNumber("Village ID", 1),
  subdivision_id: optionalNumber("Subdivision ID", 1),
  circle_id: optionalNumber("Circle ID", 1),
  zone_id: optionalNumber("Zone ID", 1),
  schemetype: z.string().trim().min(1, "Scheme type is required"),
  nofhtc: z
    .string()
    .trim()
    .max(110, "No FHTC is too long")
    .optional()
    .or(z.literal("")),
  amount_approved: optionalNumber("Approved amount", 0),
  payment_amount: optionalNumber("Payment amount", 0),
  serial_no: optionalNumber("Serial number", 1),
  contractor_id: z.string().min(1, "Contractor is required"),
});

type CreateWorkItemFormValues = z.infer<typeof createWorkItemSchema>;

type LocationOption = {
  id: number;
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

const LOCATION_TYPES: LocationType[] = [
  "districts",
  "blocks",
  "panchayats",
  "villages",
  "subdivisions",
  "circles",
  "zones",
];

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

    if (!Number.isFinite(id) || !name) return acc;

    acc.push({
      id,
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

const toPayload = (values: CreateWorkItemFormValues) => {
  // Temporary coordinates until map pin/location picker is added.
  const randomLatitude = Number((Math.random() * 180 - 90).toFixed(6));
  const randomLongitude = Number((Math.random() * 360 - 180).toFixed(6));

  const payload: Record<string, unknown> = {
    title: values.title,
    district_id: values.district_id,
    schemetype: values.schemetype,
    contractor_id: values.contractor_id,
    latitude: randomLatitude,
    longitude: randomLongitude,
  };

  const optionalFields = [
    "description",
    "block_id",
    "panchayat_id",
    "village_id",
    "subdivision_id",
    "circle_id",
    "zone_id",
    "nofhtc",
    "amount_approved",
    "payment_amount",
    "serial_no",
  ] as const;

  for (const field of optionalFields) {
    const value = values[field];
    if (value !== undefined && value !== "") {
      payload[field] = value;
    }
  }

  return payload;
};

export default function CreateWorkItemPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<CreateWorkItemFormValues | null>(null);

  const form = useForm<CreateWorkItemFormValues>({
    resolver: zodResolver(createWorkItemSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      district_id: undefined,
      block_id: undefined,
      panchayat_id: undefined,
      village_id: undefined,
      subdivision_id: undefined,
      circle_id: undefined,
      zone_id: undefined,
      schemetype: "",
      nofhtc: "",
      amount_approved: undefined,
      payment_amount: undefined,
      serial_no: undefined,
      contractor_id: "",
    },
  });

  const { data: userInfo, isLoading: isUserLoading } = useUser();

  const locationQueries = useQueries({
    queries: LOCATION_TYPES.map((type) => ({
      queryKey: ["locations", type],
      queryFn: () => getLocationsByType(type),
    })),
  });

  const { data: contractors = [], isLoading: isContractorLoading } = useQuery({
    queryKey: ["contractors"],
    queryFn: () => getContractors(1, 500),
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

  const selectedDistrictId = form.watch("district_id");
  const districtFilter = Number.isFinite(selectedDistrictId)
    ? Number(selectedDistrictId)
    : null;

  const blocks = filterByDistrict(
    locationDataByType.blocks || [],
    districtFilter,
  );
  const panchayats = filterByDistrict(
    locationDataByType.panchayats || [],
    districtFilter,
  );
  const villages = filterByDistrict(
    locationDataByType.villages || [],
    districtFilter,
  );
  const subdivisions = filterByDistrict(
    locationDataByType.subdivisions || [],
    districtFilter,
  );
  const circles = filterByDistrict(
    locationDataByType.circles || [],
    districtFilter,
  );
  const zones = filterByDistrict(
    locationDataByType.zones || [],
    districtFilter,
  );

  useEffect(() => {
    if (!userInfo?.district_id) return;

    const districtId = Number(userInfo.district_id);
    if (!Number.isFinite(districtId)) return;

    if (form.getValues("district_id") !== districtId) {
      form.setValue("district_id", districtId, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [userInfo?.district_id, form]);

  useEffect(() => {
    form.setValue("block_id", undefined);
    form.setValue("panchayat_id", undefined);
    form.setValue("village_id", undefined);
    form.setValue("subdivision_id", undefined);
    form.setValue("circle_id", undefined);
    form.setValue("zone_id", undefined);
  }, [selectedDistrictId, form]);

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

  const goToNextStep = async () => {
    if (step === 1) {
      const valid = await form.trigger([
        "title",
        "description",
        "schemetype",
        "contractor_id",
      ]);
      if (!valid) return;
    }

    if (step === 2) {
      const valid = await form.trigger(["district_id"]);
      if (!valid) return;
    }

    setStep((current) => Math.min(current + 1, 3));
  };

  const goToPreviousStep = () => setStep((current) => Math.max(current - 1, 1));

  const onSubmit = (values: CreateWorkItemFormValues) => {
    const payload = toPayload(values);
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
  const isOnlyDistrictOfficer = userInfo?.role === "DO";

  if (isUserLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#136FB6]" />
      </div>
    );
  }

  if (!isOnlyDistrictOfficer) {
    return (
      <div className="max-w-[720px] mx-auto mt-10 bg-white rounded-xl border border-red-100 p-6">
        <h2 className="text-[18px] font-bold text-[#1a2b3c]">
          Access Restricted
        </h2>
        <p className="text-[13px] text-gray-600 mt-2">
          Only district officers (DO) can create new work items.
        </p>
        <Button className="mt-4" onClick={() => router.replace("/work-order")}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[980px] mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-[22px] font-extrabold text-[#1a2b3c]">
              Create Work Item
            </h1>
            <p className="text-[12px] text-gray-500 mt-1">
              Fill the details in 3 quick steps. Required fields are validated
              strictly.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className={`rounded-lg border px-3 py-2 text-[12px] font-semibold ${
              step === index
                ? "border-[#136FB6] bg-[#DFEEF9] text-[#136FB6]"
                : step > index
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-500"
            }`}
          >
            <div className="flex items-center gap-2">
              {step > index ? (
                <CheckCircle2 size={14} />
              ) : (
                <span>{index}.</span>
              )}
              <span>
                {index === 1
                  ? "Basic Info"
                  : index === 2
                    ? "Location"
                    : "Financial & Submit"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.03)] rounded-[20px]">
        <CardContent className="p-6 sm:p-8">
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Pipeline extension phase 1"
                            {...field}
                          />
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

                  <FormField
                    control={form.control}
                    name="contractor_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contractor *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => field.onChange(value)}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select contractor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isContractorLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading contractors...
                              </SelectItem>
                            ) : (
                              contractors.map((contractor: any) => (
                                <SelectItem
                                  key={contractor.id}
                                  value={contractor.id}
                                >
                                  {contractor.name} (
                                  {contractor.code || contractor.email})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed description of the work item"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="district_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District *</FormLabel>
                        <Select
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          disabled={Boolean(userInfo?.district_id)}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select district" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(locationDataByType.districts || []).map(
                              (item) => (
                                <SelectItem
                                  key={item.id}
                                  value={String(item.id)}
                                >
                                  {item.name}
                                </SelectItem>
                              ),
                            )}
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
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select block" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {blocks.map((item) => (
                              <SelectItem key={item.id} value={String(item.id)}>
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
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select panchayat" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {panchayats.map((item) => (
                              <SelectItem key={item.id} value={String(item.id)}>
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
                    name="village_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Village</FormLabel>
                        <Select
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select village" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {villages.map((item) => (
                              <SelectItem key={item.id} value={String(item.id)}>
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
                    name="subdivision_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subdivision</FormLabel>
                        <Select
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select subdivision" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subdivisions.map((item) => (
                              <SelectItem key={item.id} value={String(item.id)}>
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
                    name="circle_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Circle</FormLabel>
                        <Select
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select circle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {circles.map((item) => (
                              <SelectItem key={item.id} value={String(item.id)}>
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
                    name="zone_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zone</FormLabel>
                        <Select
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select zone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {zones.map((item) => (
                              <SelectItem key={item.id} value={String(item.id)}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="nofhtc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No FHTC</FormLabel>
                        <FormControl>
                          <Input placeholder="1250" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serial_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial No</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1" {...field} />
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
                            placeholder="1250000.5"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payment_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="450000.75"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {(isLocationLoading || isContractorLoading) && (
                <div className="text-[12px] text-gray-500 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Loading dropdown options...
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={step === 1 || createMutation.isPending}
                >
                  Previous
                </Button>

                {step < 3 ? (
                  <Button type="button" onClick={goToNextStep}>
                    Next
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={onRequestCreate}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 size={14} className="mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Work Item"
                    )}
                  </Button>
                )}
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
              Please confirm you want to create this new work item. You can go
              back and edit details if needed.
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
            >
              {createMutation.isPending ? "Creating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
