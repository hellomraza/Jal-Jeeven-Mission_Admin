import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createServerApiClient } from "@/lib/server-api-client";
import {
  ArrowRight,
  Building2,
  ChartNoAxesCombined,
  ClipboardList,
  MapPin,
  Users,
} from "lucide-react";
import Link from "next/link";

type PageParams = {
  params: Promise<{ id: string }>;
};

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "---";
  }

  return String(value);
};

const getStatusClasses = (status: string) => {
  switch (status) {
    case "COMPLETED":
    case "APPROVED":
      return "bg-green-50 text-green-700 border-green-100";
    case "IN_PROGRESS":
    case "SUBMITTED":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-100";
    default:
      return "bg-gray-50 text-gray-600 border-gray-100";
  }
};

const DetailItem = ({ label, value }: { label: string; value: unknown }) => (
  <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
      {label}
    </p>
    <p className="mt-2 text-[13px] font-semibold text-[#1a2b3c] wrap-break-word">
      {formatValue(value)}
    </p>
  </div>
);

const StatCard = ({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
}) => (
  <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_10px_30px_rgba(19,111,182,0.08)] backdrop-blur">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
          {label}
        </p>
        <p className="mt-2 text-2xl font-extrabold text-[#1a2b3c]">{value}</p>
      </div>
      <div className="rounded-2xl bg-[#DFEEF9] p-3 text-[#136FB6]">{icon}</div>
    </div>
    <p className="mt-3 text-[12px] font-medium text-gray-500">{helper}</p>
  </div>
);

export default async function WorkOrderDetailsPage({ params }: PageParams) {
  const { id } = await params;
  const apiClient = await createServerApiClient();

  const [workItemResponse, componentsResponse, employeesResponse] =
    await Promise.all([
      apiClient.get(`/work-items/${id}`),
      apiClient.get(`/components/work-item/${id}`),
      apiClient.get(`/work-items/${id}/employees`),
    ]);

  const workItem = workItemResponse.data as WorkItem | undefined;
  const components = (componentsResponse.data ?? []) as WorkItemComponent[];
  const employees = (employeesResponse.data ?? []) as Employee[];

  if (!workItem) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-[20px] font-extrabold text-[#1a2b3c] tracking-tight">
              Work Order Details
            </h1>
            <p className="text-[12px] text-gray-500 font-medium">
              The requested work order could not be found.
            </p>
          </div>
        </div>
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
          <CardContent className="p-8 text-center">
            <p className="text-[13px] font-medium text-gray-500">
              Please go back and select another work order.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const approvedComponents = components.filter(
    (component) => component.status === "APPROVED",
  ).length;

  const componentCompletion =
    components.length > 0
      ? Math.round((approvedComponents / components.length) * 100)
      : 0;
  const workProgress =
    Number(workItem.progress_percentage) || componentCompletion;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-[20px] font-extrabold text-[#1a2b3c] tracking-tight">
              Work Order Details
            </h1>
            <p className="text-[12px] text-gray-500 font-medium">
              Inspect the work item, component progress, contractor, and the
              assigned workforce.
            </p>
          </div>
        </div>

        <Link
          href={`/work-order/update/${id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#136FB6] px-4 py-2.5 text-[12px] font-bold text-white shadow-md shadow-[#136FB6]/20 transition-colors hover:bg-[#105E9A]"
        >
          Open Update Page
          <ArrowRight size={14} />
        </Link>
      </div>

      <Card className="overflow-hidden border-none bg-linear-to-br from-[#EFF8FF] via-white to-[#F4FBF8] shadow-[0_10px_40px_rgba(19,111,182,0.08)]">
        <CardContent className="p-0">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  className={`border px-3 py-1 ${getStatusClasses(workItem.status)}`}
                >
                  {workItem.status.replaceAll("_", " ")}
                </Badge>
                <span className="text-[12px] font-semibold text-gray-500">
                  Work Code: {formatValue(workItem.work_code)}
                </span>
              </div>

              <div>
                <h2 className="text-[28px] font-black tracking-tight text-[#1a2b3c]">
                  {formatValue(workItem.title)}
                </h2>
                <p className="mt-2 max-w-3xl text-[13px] leading-6 text-gray-600">
                  {formatValue(workItem.description)}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <DetailItem
                  label="District"
                  value={
                    workItem.district?.districtname || workItem.district_id
                  }
                />
                <DetailItem label="Block" value={workItem.block?.blockname} />
                <DetailItem
                  label="Panchayat"
                  value={workItem.panchayat?.panchayatname}
                />
                <DetailItem
                  label="Village"
                  value={workItem.village?.villagename}
                />
              </div>
            </div>

            <div className="grid gap-4">
              <StatCard
                icon={<ChartNoAxesCombined size={20} />}
                label="Work Progress"
                value={`${workProgress}%`}
                helper="Current work-item progress reported by the system."
              />
              <StatCard
                icon={<ClipboardList size={20} />}
                label="Component Completion"
                value={`${approvedComponents}/${components.length || 0}`}
                helper="Approved components out of the full component list."
              />
              <StatCard
                icon={<Users size={20} />}
                label="Employees Working"
                value={`${employees.length}`}
                helper="Employees currently associated with this work order."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#DFEEF9] p-2 text-[#136FB6]">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="text-[16px] font-extrabold text-[#1a2b3c]">
                  Work Order Information
                </h3>
                <p className="text-[12px] font-medium text-gray-500">
                  Location and approval details for the selected work item.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <DetailItem label="Scheme Type" value={workItem.schemetype} />
              <DetailItem label="No. of FHTC" value={workItem.nofhtc} />
              <DetailItem
                label="Amount Approved"
                value={workItem.amount_approved}
              />
              <DetailItem
                label="Payment Amount"
                value={workItem.payment_amount}
              />
              {/* <DetailItem label="Latitude" value={workItem.latitude} />
              <DetailItem label="Longitude" value={workItem.longitude} /> */}
              <DetailItem label="Serial No." value={workItem.serial_no} />
              <DetailItem
                label="Sub-division"
                value={
                  workItem.subdivision?.subdivisionname ||
                  workItem.subdivision_id
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#DFEEF9] p-2 text-[#136FB6]">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="text-[16px] font-extrabold text-[#1a2b3c]">
                  Contractor Details
                </h3>
                <p className="text-[12px] font-medium text-gray-500">
                  The contractor responsible for this work item.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <DetailItem label="Name" value={workItem.contractor?.name} />
              <DetailItem label="Code" value={workItem.contractor?.code} />
              <DetailItem label="Email" value={workItem.contractor?.email} />
              <DetailItem
                label="District ID"
                value={workItem.contractor?.district_id}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white rounded-3xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#DFEEF9] p-2 text-[#136FB6]">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-[16px] font-extrabold text-[#1a2b3c]">
                Employees Working
              </h3>
              <p className="text-[12px] font-medium text-gray-500">
                Team members currently assigned to this work order.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {employees.length > 0 ? (
              employees.map((employee) => (
                <div
                  key={employee.id}
                  className="rounded-3xl border border-gray-100 bg-linear-to-br from-white to-[#F8FBFF] p-5 shadow-sm"
                >
                  <p className="text-[15px] font-extrabold text-[#1a2b3c]">
                    {employee.name}
                  </p>
                  <p className="mt-1 text-[12px] font-medium text-gray-500">
                    Code: {employee.code}
                  </p>
                  <p className="mt-1 text-[12px] font-medium text-gray-500">
                    {employee.email}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-3xl border border-dashed border-gray-200 bg-gray-50/60 p-8 text-center">
                <p className="text-[13px] font-semibold text-gray-500">
                  No employees are assigned to this work order yet.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
