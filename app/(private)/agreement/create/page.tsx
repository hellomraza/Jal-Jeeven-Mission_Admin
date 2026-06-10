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
import { createAgreement } from "@/services/agreementService";
import { getContractors } from "@/services/userService";
import { getWorkItemsWithoutAgreement } from "@/services/workService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as z from "zod";

const createAgreementSchema = z.object({
  agreementno: z.string().trim().min(1, "Agreement number is required"),
  agreementyear: z.string().trim().min(1, "Agreement year is required"),
  division_code: z.string().trim().min(1, "Division code is required"),
  agrid: z.string().trim().optional(),
  sr: z.string().trim().optional(),
  workorderno: z.string().trim().optional(),
  workorderdate: z.string().trim().optional().or(z.literal("")),
  unitag: z.string().trim().optional(),
  contractor_id: z.string().optional().or(z.literal("")),
  work_ids: z.array(z.string()).optional().default([]),
});

type CreateAgreementFormValues = z.infer<typeof createAgreementSchema>;

export default function CreateAgreementPage() {
  const router = useRouter();
  const { data: userInfo, isLoading: isUserLoading } = useUser();

  const form = useForm<CreateAgreementFormValues>({
    resolver: zodResolver(createAgreementSchema),
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

  const { data: workItemsData, isLoading: isWorkItemsLoading } = useQuery({
    queryKey: ["workItemsWithoutAgreement"],
    queryFn: getWorkItemsWithoutAgreement,
  });

  const createMutation = useMutation({
    mutationFn: createAgreement,
    onSuccess: () => {
      toast.success("Agreement created successfully");
      router.push("/agreement");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create agreement");
    },
  });

  const onSubmit = (values: CreateAgreementFormValues) => {
    let formattedDate: string | undefined = undefined;
    if (values.workorderdate) {
      const dateObj = new Date(values.workorderdate);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toISOString();
      }
    }

    const payload = {
      agreementno: values.agreementno,
      agreementyear: values.agreementyear,
      division_code: values.division_code,
      agrid: values.agrid || undefined,
      contractor_id: values.contractor_id || undefined,
      sr: values.sr || undefined,
      workorderno: values.workorderno || undefined,
      workorderdate: formattedDate,
      work_ids: values.work_ids && values.work_ids.length > 0 ? values.work_ids : undefined,
      unitag: values.unitag || undefined,
    };
    createMutation.mutate(payload);
  };

  const isHOUser = userInfo?.role === "HO";

  if (isUserLoading) {
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
          Only Head Officers (HO) can create new agreements.
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
            Create Agreement
          </h1>
          <p className="text-[12px] text-gray-500 mt-1">
            Fill out the details to manually register a new agreement.
          </p>
        </div>
      </div>

      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.03)] rounded-[20px]">
        <CardHeader className="pb-4">
          <CardTitle className="text-[18px] text-[#1a2b3c]">
            Agreement Information
          </CardTitle>
          <CardDescription>
            Specify agreement reference codes, order dates, contractor, and matching work items.
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

                <FormField
                  control={form.control}
                  name="work_ids"
                  render={({ field }) => {
                    const workItemItems = workItemsData?.data?.map((w: any) => ({
                      label: `${w.work_code}`,
                      value: w.id,
                    }));

                    return (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Work Items</FormLabel>
                        <FormControl>
                          <ComboboxMultiple
                            items={workItemItems}
                            value={field.value || []}
                            onSelect={(selectedIds) => {
                              field.onChange(selectedIds);
                            }}
                            placeholder="Search work items..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

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
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-[#1a2b3c] hover:bg-[#1a2b3c]/90 text-white"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Agreement"
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
