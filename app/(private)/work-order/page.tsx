import { getWorkItems } from "@/actions/workOrderAction";
import { cookies } from "next/headers";
import WorkOrder from "./WorkOrder";

const WorkOrderPage = async () => {
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value || null;
  const response = await getWorkItems();
  const workItems = response.data;
  return <WorkOrder workItems={workItems} role={role} />;
};

export default WorkOrderPage;
