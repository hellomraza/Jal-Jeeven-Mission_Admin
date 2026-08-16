import { getWorkItems } from "@/actions/workOrderAction";
import WorkOrderTPITable from "@/components/WorkOrderTPITable";
import { createServerApiClient } from "@/lib/server-api-client";
import { cookies } from "next/headers";
import WorkOrder from "./WorkOrder";

type WorkOrderPageProps = {
  searchParams?: Promise<{ page?: string; search?: string }>;
};

const WORK_ITEMS_PAGE_SIZE = 10;

const WorkOrderPage = async ({ searchParams }: WorkOrderPageProps) => {
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value || null;
  const cookieMode = cookieStore.get("admin_app_mode")?.value || "svs";
  const isTpiMode = cookieMode === "tpi" || cookieMode === "ee";
  const isExecutiveEngineer = cookieMode === "ee";

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const pageValue = Number(resolvedSearchParams?.page || "1");
  const currentPage =
    Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
  const search = resolvedSearchParams?.search || "";

  if (isTpiMode) {
    const apiClient = await createServerApiClient();
    const response = await apiClient.get<any>("/work-order-tpi");
    const workOrders = response.data?.data || response.data || [];

    return (
      <WorkOrderTPITable
        workOrders={workOrders}
        userRole={role || undefined}
        isExecutiveEngineer={isExecutiveEngineer}
      />
    );
  }

  const response = await getWorkItems(currentPage, WORK_ITEMS_PAGE_SIZE, search);
  const workItems = response.data || [];

  return (
    <WorkOrder
      workItems={workItems}
      role={role}
      currentPage={response.page || currentPage}
      totalPages={response.totalPages || 1}
      totalWorkItems={response.total || 0}
    />
  );
};

export default WorkOrderPage;
