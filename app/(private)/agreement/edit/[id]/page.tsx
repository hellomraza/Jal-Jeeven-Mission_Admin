"use client";

import BackButton from "@/components/BackButton";
import { ComboboxMultiple } from "@/components/ComboboxMultiSelect";
import { ComboboxPopup } from "@/components/ComboboxPopup";
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
import { useUser } from "@/hooks/useUser";
import { getAgreement, updateAgreement } from "@/services/agreementService";
import { getContractors } from "@/services/userService";
import { getWorkItemsWithoutAgreement } from "@/services/workService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Lock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as z from "zod";

const editAgreementSchema = z.object({
  agreementno: z.string().trim().min(1, "Agreement number is required"),
  agreementyear: z.string().trim().min(1, "Agreement year is required"),
  division_code: z.string().trim().min(1, "Division code is required"),
  agrid: z.string().trim().optional(),
  sr: z.string().trim().optional(),
  workorderno: z.string().trim().optional(),
  workorderdate: z.string().trim().optional().or(z.literal("")),
  unitag: z.string().trim().optional(),
  contractor_id: z.string().optional().or(z.literal("")),
  work_ids: z.array(z.string()).optional().default([]), // Newly selected ones
});

type EditAgreementFormValues = z.infer<typeof editAgreementSchema>;

export default function EditAgreementPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const { data: userInfo, isLoading: isUserLoading } = useUser();

  const { data: agreement, isLoading: isAgreementLoading, refetch } = useQuery({
    queryKey: ["agreement", id],
    queryFn: () => getAgreement(id),
    enabled: !!id,
  });

  const form = useForm<EditAgreementFormValues>({
    resolver: zodResolver(editAgreementSchema),
    mode: "onChange",
    defaultValues: {
      agreementno: "",
      agreementyear: "",
      division_code: "",
      agrid: "",
      sr: "",
      workorderno: "",
      workorderdate: "",
      unitag: "",
      contractor_id: "",
      work_ids: [],
    },
  });

  const { data: contractorsData = [], isLoading: isContractorLoading } =
    useQuery({
      queryKey: ["contractors"],
      queryFn: () => getContractors(1, 500),
    });

  const { data: unassignedWorkItemsData, isLoading: isWorkItemsLoading } = useQuery({
    queryKey: ["workItemsWithoutAgreement"],
    queryFn: getWorkItemsWithoutAgreement,
  });

  // Sync form values on loaded agreement
  useEffect(() => {
    if (!agreement) return;

    let formattedDate = "";
    if (agreement.workorderdate) {
      const dateObj = new Date(agreement.workorderdate);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toISOString().split("T")[0];
      }
    }

    form.reset({
      agreementno: agreement.agreementno || "",
      agreementyear: agreement.agreementyear || "",
      division_code: String(agreement.division_code || ""),
      agrid: agreement.agrid || "",
      sr: agreement.sr || "",
      workorderno: agreement.workorderno || "",
      workorderdate: formattedDate,
      unitag: agreement.unitag || "",
      contractor_id: agreement.contractor_id || "",
      work_ids: [], // Keep newly selected ones empty initially
    });
  }, [agreement, form]);

  const updateMutation = useMutation({
    mutationFn: (payload: any) => updateAgreement(id, payload),
    onSuccess: () => {
      toast.success("Agreement updated successfully");
      refetch();
      router.push("/agreement");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update agreement");
    },
  });

  // Gather existing linked work items
  const existingWorkItems = useMemo<any[]>(() => {
    return agreement?.workItems || [];
  }, [agreement]);

  const onSubmit = (values: EditAgreementFormValues) => {
    let formattedDate: string | undefined = undefined;
    if (values.workorderdate) {
      const dateObj = new Date(values.workorderdate);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toISOString();
      }
    }

    // Combine existing work items and newly added ones
    const existingIds = existingWorkItems.map((w: any) => w.id);
    const addedIds = values.work_ids || [];
    const combinedWorkIds = Array.from(new Set([...existingIds, ...addedIds]));

    const payload = {
      agreementno: values.agreementno,
      agreementyear: values.agreementyear,
      division_code: values.division_code,
      agrid: values.agrid || undefined,
      contractor_id: values.contractor_id || undefined,
      sr: values.sr || undefined,
      workorderno: values.workorderno || undefined,
      workorderdate: formattedDate,
      work_ids: combinedWorkIds.length > 0 ? combinedWorkIds : undefined,
      unitag: values.unitag || undefined,
    };

    updateMutation.mutate(payload);
  };

  const isHOUser = userInfo?.role === "HO";
  const isPageLoading = isAgreementLoading || isUserLoading;

  // Find linked contractor name if assigned
  const assignedContractor = useMemo(() => {
    if (!agreement?.contractor_id || !contractorsData) return null;
    return contractorsData.find((c: any) => c.id === agreement.contractor_id);
  }, [agreement?.contractor_id, contractorsData]);

  if (isPageLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#1a2b3c]" />
      </div>
    );
  }

  if (!isHOUser) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white rounded-xl border border-red-100 p-6">
        <h2 className="text-[18px] font-bold text-[#1a2b3c]">
          Access Restricted
        </h2>
        <p className="text-[13px] text-gray-600 mt-2">
          Only Head Officers (HO) can edit agreements.
        </p>
        <Button className="mt-4" onClick={() => router.replace("/agreement")}>
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
            Edit Agreement
          </h1>
          <p className="text-[12px] text-gray-500 mt-1">
            Modify details for agreement: <span className="font-semibold">{agreement?.agreementno}</span>
          </p>
        </div>
      </div>

      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.03)] rounded-[20px]">
        <CardHeader className="pb-4">
          <CardTitle className="text-[18px] text-[#1a2b3c]">
            Agreement Information
          </CardTitle>
          <CardDescription>
            Modify agreement numbers, years, contractor, and link additional work items.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="agreementno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agreement Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="AG-2023-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agreementyear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agreement Year *</FormLabel>
                      <FormControl>
                        <Input placeholder="2023-2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="division_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Division Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="DIST001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agrid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AGRID Reference ID</FormLabel>
                      <FormControl>
                        <Input placeholder="agrid-123" {...field} />
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
                      <FormLabel>SR Number</FormLabel>
                      <FormControl>
                        <Input placeholder="sr-123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workorderno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Order Number</FormLabel>
                      <FormControl>
                        <Input placeholder="WO-2023-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workorderdate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Order Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Uni-Tag Identifier</FormLabel>
                      <FormControl>
                        <Input placeholder="tag-123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contractor Assignment Logic */}
                {agreement?.contractor_id ? (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Contractor (Read-Only)</FormLabel>
                    <FormControl>
                      <Input
                        value={assignedContractor ? `${assignedContractor.name} (${assignedContractor.code || "No Code"})` : agreement.contractor_id}
                        disabled
                        className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                      />
                    </FormControl>
                    <p className="text-[11px] text-amber-600 mt-1">
                      Contractor cannot be modified once assigned.
                    </p>
                  </FormItem>
                ) : (
                  <FormField
                    control={form.control}
                    name="contractor_id"
                    render={({ field }) => {
                      const contractorItems = contractorsData.map((c: any) => ({
                        label: `${c.name} (${c.code || "No Code"})`,
                        value: c.id,
                      }));

                      return (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Contractor</FormLabel>
                          <FormControl>
                            <ComboboxPopup
                              items={contractorItems}
                              value={field.value}
                              onValueChange={(item) => {
                                field.onChange(item?.value || "");
                              }}
                              placeholder="Search contractor by name"
                              isLoading={isContractorLoading}
                              emptyMessage="No contractors found"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}

                {/* Work Orders Locked and Additional Selection */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <FormLabel className="text-[#1a2b3c] font-bold">Currently Linked Work Orders (Read-Only)</FormLabel>
                    {existingWorkItems.length === 0 ? (
                      <p className="text-[12px] text-gray-400 mt-1 italic">No work orders currently linked.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {existingWorkItems.map((w: any) => (
                          <div
                            key={w.id}
                            className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-[11px] font-semibold border border-gray-200 shadow-sm"
                          >
                            <Lock size={12} className="text-gray-400" />
                            <span>{w.work_code} {w.title ? `(${w.title})` : ""}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] text-amber-600 mt-1.5">
                      Existing linked work orders cannot be deselected or removed.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="work_ids"
                    render={({ field }) => {
                      const workItemItems = (unassignedWorkItemsData?.data || []).map((w: any) => ({
                        label: `${w.work_code} - ${w.title || "No Title"}`,
                        value: w.id,
                      }));

                      return (
                        <FormItem>
                          <FormLabel className="text-[#1a2b3c] font-bold">Add Additional Work Items</FormLabel>
                          <FormControl>
                            <ComboboxMultiple
                              items={workItemItems}
                              value={field.value || []}
                              onSelect={(selectedIds) => {
                                field.onChange(selectedIds);
                              }}
                              placeholder="Search and select unassigned work items to add..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>

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
    </div>
  );
}
