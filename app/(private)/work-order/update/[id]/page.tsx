import BackButton from "@/components/BackButton";
import EmployeeManagementSheet from "@/components/EmployeeManagementSheet";
import { Card, CardContent } from "@/components/ui/card";
import WorkOrderComponentsTable from "@/components/WorkOrderComponentsTable";
import { createServerApiClient } from "@/lib/server-api-client";

const WorkOrderUpdatePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const apiClient = await createServerApiClient();

  const response = await apiClient.get(`/components/work-item/${id}`);

  const userResponse = await apiClient.get("/users/my-profile");
  const userRole = userResponse.data?.role;

  const components = response.data;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-[20px] font-extrabold text-[#1a2b3c] tracking-tight">
              Work Order Components
            </h1>
            <p className="text-[12px] text-gray-500 font-medium">
              Update and manage components for Work Code: {id}
            </p>
          </div>
        </div>
        <EmployeeManagementSheet workItemId={id} />
      </div>
      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white  py-0 my-6">
        <CardContent className="p-0 ">
          <WorkOrderComponentsTable
            components={components}
            userRole={userRole}
            workItemId={id}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkOrderUpdatePage;
