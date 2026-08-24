import PaymentDetailsTable from "@/components/PaymentDetailsTable";
import { createServerApiClient } from "@/lib/server-api-client";
import { UserRole } from "@/types/usertypes";
import { cookies } from "next/headers";
import { forbidden } from "next/navigation";

export interface CompletedWorkflowsPageProps {
  searchParams?: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    district_id?: string;
  }>;
}

export default async function CompletedWorkflowsPage({
  searchParams,
}: CompletedWorkflowsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const currentPage = Number(resolvedParams.page) || 1;
  const limit = Number(resolvedParams.limit) || 20;
  const search = resolvedParams.search || "";
  const status = resolvedParams.status || "";
  const district_id = resolvedParams.district_id || "";

  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value || "";

  const allowedRoles = [
    UserRole.DistrictOfficer,
    UserRole.DOStaff,
    UserRole.ExecutiveEngineer,
    UserRole.HeadOfficer,
    "DO",
    "DO_STAFF",
    "EE",
    "HO",
  ];

  if (!allowedRoles.includes(role as any)) {
    forbidden();
  }

  const isHO = role === UserRole.HeadOfficer || role === "HO";

  let payments = [];
  let totalPayments = 0;
  let totalPages = 1;
  let districts: { id: string; name: string }[] = [];
  let error = null;

  try {
    const apiClient = await createServerApiClient();

    // Fetch payments and districts (if HO) in parallel
    const promises: [Promise<any>, Promise<any>?] = [
      apiClient.get<any>("/payments", {
        params: {
          page: currentPage,
          limit,
          search: search || undefined,
          status: status || undefined,
          district_id: district_id || undefined,
        },
      }),
    ];

    if (isHO) {
      promises.push(
        apiClient.get<any>("/locations/districts?page=1&limit=1000"),
      );
    }

    const [res, districtsRes] = await Promise.all(promises);

    if (res.data) {
      payments = res.data.data || [];
      totalPayments = res.data.total || 0;
      totalPages = res.data.totalPages || 1;
    }

    if (districtsRes && districtsRes.data) {
      districts = districtsRes.data.data || districtsRes.data || [];
    }
  } catch (err: any) {
    console.error(err);
    error =
      err.response?.data?.message ||
      err.message ||
      "Failed to load payment records";
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-[28px] font-bold text-[#1a2b3c]">SD Payment</h1>
          <p className="text-[14px] text-gray-500 font-medium">
            Manage contractor payment details, voucher verification, and
            approval workflow
          </p>
        </div>

        {error ? (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : (
          <PaymentDetailsTable
            initialPayments={payments}
            currentPage={currentPage}
            totalPages={totalPages}
            totalPayments={totalPayments}
            limit={limit}
            search={search}
            status={status}
            districtId={district_id}
            districts={districts}
            role={role}
          />
        )}
      </div>
    </div>
  );
}
