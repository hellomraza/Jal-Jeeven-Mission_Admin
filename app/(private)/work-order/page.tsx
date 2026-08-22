import { getWorkItems } from "@/actions/workOrderAction";
import { createServerApiClient } from "@/lib/server-api-client";
import { UserRole, WorkOrderType } from "@/types/usertypes";
import { cookies } from "next/headers";
import WorkOrder from "./WorkOrder";

type WorkOrderPageProps = {
  searchParams?: Promise<{ page?: string; search?: string; mode?: string }>;
};

const WORK_ITEMS_PAGE_SIZE = 10;

const WorkOrderPage = async ({ searchParams }: WorkOrderPageProps) => {
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value || null;
  const cookieMode = cookieStore.get("app_work_order_mode")?.value;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const pageValue = Number(resolvedSearchParams?.page || "1");
  const currentPage =
    Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
  const search = resolvedSearchParams?.search || "";

  const apiClient = await createServerApiClient();
  let userProfile: any = null;
  try {
    const profileRes = await apiClient.get("/users/my-profile");
    userProfile = profileRes.data;
  } catch (err) {
    // Ignore error
  }

  let activeMode: WorkOrderType | undefined = undefined;

  if (role === UserRole.TPI || role === "TPI") {
    activeMode = WorkOrderType.BULK_VILLAGE;
  } else if (role === UserRole.HeadOfficer || role === "HO") {
    activeMode =
      (resolvedSearchParams?.mode as WorkOrderType) ||
      (cookieMode as WorkOrderType) ||
      WorkOrderType.SVS;
  } else if (role === UserRole.DistrictOfficer || role === "DO") {
    const isBulkAllowed = Boolean(userProfile?.is_bulk_order_allowed);
    if (isBulkAllowed) {
      activeMode =
        (resolvedSearchParams?.mode as WorkOrderType) ||
        (cookieMode as WorkOrderType) ||
        WorkOrderType.SVS;
    } else {
      activeMode = WorkOrderType.SVS;
    }
  }

  const response = await getWorkItems(
    currentPage,
    WORK_ITEMS_PAGE_SIZE,
    search,
    activeMode,
  );
  const workItems = response?.data || [];

  const isBulkAllowed = Boolean(userProfile?.is_bulk_order_allowed);

  return (
    <WorkOrder
      workItems={workItems}
      role={role}
      currentPage={response?.page || currentPage}
      totalPages={response?.totalPages || 1}
      totalWorkItems={response?.total || 0}
      activeMode={activeMode}
      isExecutiveEngineer={isExecutiveEngineer}
    />
  );
};

export default WorkOrderPage;
