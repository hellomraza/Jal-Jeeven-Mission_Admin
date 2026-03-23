import BackButton from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ViewPhoto from "@/components/ViewPhoto";
import { createServerApiClient } from "@/lib/server-api-client";
import { WorkItemComponentStatus } from "@/types/usertypes";
import { AlertCircle, CheckCircle2, Clock, XSquare } from "lucide-react";

const WorkOrderUpdatePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const apiClient = await createServerApiClient();

  const response = await apiClient.get<WorkItemComponent[]>(
    `/components/work-item/${id}`,
  );

  const userResponse = await apiClient.get("/users/my-profile");
  const userRole = userResponse.data?.role;

  const components = response.data;

  const getStatusBadge = (
    status: string,
    progress: number,
    quantity: number,
  ) => {
    switch (status) {
      case WorkItemComponentStatus.APPROVED:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-bold">
            <CheckCircle2 size={13} /> Approved
          </span>
        );
      case WorkItemComponentStatus.IN_PROGRESS: {
        if (progress === quantity && quantity > 0) {
          return (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
              <Clock size={13} /> Completed
            </span>
          );
        } else if (progress > 0) {
          return (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
              <Clock size={13} /> In Progress
            </span>
          );
        }
      }
      case WorkItemComponentStatus.SUBMITTED:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-[11px] font-bold">
            <Clock size={13} /> Submitted
          </span>
        );
      case WorkItemComponentStatus.REJECTED:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-bold">
            <XSquare size={13} /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-[11px] font-bold">
            <AlertCircle size={13} /> Pending
          </span>
        );
    }
  };
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
      </div>
      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white  py-0 my-6">
        <CardContent className="p-0 ">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="rounded-t-2xl overflow-hidden">
                <TableRow className="bg-[#DFEEF9] hover:bg-[#DFEEF9] border-none">
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 rounded-tl-[20px]">
                    S No.
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Component Name
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                    Quantity
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                    Progress
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                    % of Progress
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                    Status
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                    Photos
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {components?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-40 text-center text-gray-500"
                    >
                      No components found for this work item.
                    </TableCell>
                  </TableRow>
                ) : (
                  components?.map((row, index) => {
                    const quantity = Number(row.quantity) || 0;
                    const progress = Number(row.progress) || 0;
                    const percentageProgress =
                      quantity > 0 ? (progress / quantity) * 100 : 0;
                    return (
                      <TableRow
                        key={row.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell className="text-[12px] text-gray-600 py-4.5 font-bold pl-8">
                          {index + 1}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-900 py-4.5 font-bold">
                          {row.component?.name || "N/A"}{" "}
                          {row.component?.unit ? `(${row.component.unit})` : ""}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-900 py-4.5 font-extrabold text-center">
                          {row.quantity || "0"}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-900 py-4.5 font-extrabold text-center">
                          {row.progress || "0"}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-900 py-4.5 font-extrabold text-center">
                          {percentageProgress
                            ? `${percentageProgress.toFixed(2)}%`
                            : "0%"}
                        </TableCell>
                        <TableCell className="py-4.5 text-center">
                          <div className="flex justify-center">
                            {getStatusBadge(
                              row.status,
                              Number(row.progress),
                              Number(row.quantity),
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4.5 ">
                          <ViewPhoto component={row} role={userRole} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkOrderUpdatePage;
