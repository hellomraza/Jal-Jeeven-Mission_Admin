import BackButton from "@/components/BackButton";
import { createServerApiClient } from "@/lib/server-api-client";
import { PaymentDetail } from "@/types/payment";
import { cookies } from "next/headers";
import CheckPaymentDetailsClient from "./CheckPaymentDetailsClient";

export interface CheckPaymentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CheckPaymentPage({
  params,
}: CheckPaymentPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value || "";

  let payment: PaymentDetail | null = null;
  let error: string | null = null;

  try {
    const apiClient = await createServerApiClient();
    const res = await apiClient.get<PaymentDetail>(`/payments/${id}`);
    payment = res.data;
  } catch (err: any) {
    console.error("Failed to load payment detail for check:", err);
    error = err.response?.data?.message || err.message || "Record not found";
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <BackButton />
          <div className="rounded-xl bg-red-50 p-6 text-red-700 border border-red-100">
            <h2 className="text-lg font-bold">Payment Record Not Found</h2>
            <p className="text-sm mt-1">
              {error || "The requested payment record could not be loaded for checking."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CheckPaymentDetailsClient payment={payment} userRole={role} />
  );
}
