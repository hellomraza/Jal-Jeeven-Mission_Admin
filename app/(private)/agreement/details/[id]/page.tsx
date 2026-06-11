import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createServerApiClient } from "@/lib/server-api-client";
import { UserRole } from "@/types/usertypes";
import {
  Building2,
  FileText,
  ShieldCheck,
  Wrench,
  Edit,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import AgreementFileDialog from "@/components/AgreementFileDialog";
import AgreementFileViewerModal from "@/components/AgreementFileViewer";
import SecurityDepositDialog from "@/components/SecurityDepositDialog";
import { Button } from "@/components/ui/button";

type PageParams = {
  params: Promise<{ id: string }>;
};

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "---";
  }
  return String(value);
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

export default async function AgreementDetailsPage({ params }: PageParams) {
  const { id } = await params;
  const apiClient = await createServerApiClient();

  const cookieStore = await cookies();
  const userRole = cookieStore.get("admin_role")?.value || null;

  let agreement: AgreementResponse | null = null;
  try {
    const response = await apiClient.get<AgreementResponse>(`/agreements/${id}`);
    agreement = response.data;
  } catch (err) {
    console.error("Error fetching agreement details:", err);
  }

  if (!agreement) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-[20px] font-extrabold text-[#1a2b3c] tracking-tight">
              Agreement Details
            </h1>
            <p className="text-[12px] text-gray-500 font-medium">
              The requested agreement could not be found.
            </p>
          </div>
        </div>
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
          <CardContent className="p-8 text-center">
            <p className="text-[13px] font-medium text-gray-500">
              Please go back and select another agreement.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const contractorName = agreement.contractor?.name?.toLowerCase() || "";
  const isTemporaryContractor = contractorName.includes("temporary");
  const file = agreement.files?.[0];
  const fileUrl = file?.file_url ?? null;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-[20px] font-extrabold text-[#1a2b3c] tracking-tight">
              Agreement Details
            </h1>
            <p className="text-[12px] text-gray-500 font-medium">
              Inspect agreement parameters, contractor details, and linked work orders.
            </p>
          </div>
        </div>

        {(userRole === UserRole.HeadOfficer || userRole === UserRole.DistrictOfficer) && (
          <Link
            href={`/agreement/edit/${id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#136FB6] px-4 py-2.5 text-[12px] font-bold text-white shadow-md shadow-[#136FB6]/20 transition-colors hover:bg-[#105E9A]"
          >
            <Edit size={14} />
            Edit Agreement
          </Link>
        )}
      </div>

      {/* Main Info Card */}
      <Card className="overflow-hidden border-none bg-linear-to-br from-[#EFF8FF] via-white to-[#F4FBF8] shadow-[0_10px_40px_rgba(19,111,182,0.08)]">
        <CardContent className="p-6">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-400">AGREEMENT NUMBER</p>
              <h2 className="text-[28px] font-black tracking-tight text-[#1a2b3c] mt-1">
                {agreement.agreementno}
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              <DetailItem label="Agreement Year" value={agreement.agreementyear} />
              <DetailItem label="Division Code" value={agreement.division_code} />
              <DetailItem label="AGRID Ref ID" value={agreement.agrid} />
              <DetailItem label="SR Number" value={agreement.sr} />
              <DetailItem label="Work Order No" value={agreement.workorderno} />
              <DetailItem
                label="Work Order Date"
                value={
                  agreement.workorderdate
                    ? new Date(agreement.workorderdate).toLocaleDateString()
                    : "---"
                }
              />
              <DetailItem label="Uni-Tag" value={agreement.unitag} />
              <DetailItem
                label="Created At"
                value={
                  agreement.created_at
                    ? new Date(agreement.created_at).toLocaleDateString()
                    : "---"
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Deposit & File Attachments */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white rounded-3xl">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#DFEEF9] p-2 text-[#136FB6]">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-[16px] font-extrabold text-[#1a2b3c]">
                  Security Deposit
                </h3>
                <p className="text-[12px] font-medium text-gray-500">
                  Financial security configurations for this agreement.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                  Security Deposit Amount
                </p>
                <p className="mt-1 text-xl font-extrabold text-[#1a2b3c]">
                  {agreement.security_deposit !== undefined && agreement.security_deposit !== null
                    ? `₹${agreement.security_deposit}`
                    : "—"}
                </p>
              </div>

              {(agreement.security_deposit === undefined || agreement.security_deposit === null) &&
                userRole === UserRole.HeadOfficer && (
                  <SecurityDepositDialog
                    agreementId={agreement.id}
                    agreementNo={agreement.agreementno}
                    contractorName={
                      agreement.contractor?.name?.toLowerCase().includes("temporary")
                        ? "---"
                        : agreement.contractor?.name || "N/A"
                    }
                    contractorCode={agreement.contractor?.code || "N/A"}
                  />
                )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white rounded-3xl">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#DFEEF9] p-2 text-[#136FB6]">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-[16px] font-extrabold text-[#1a2b3c]">
                  Agreement Document
                </h3>
                <p className="text-[12px] font-medium text-gray-500">
                  Attached file / PDF copy of the signed agreement.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
              <div className="truncate max-w-[250px]">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                  Filename
                </p>
                <p className="mt-1 text-[13px] font-semibold text-[#1a2b3c] truncate">
                  {fileUrl ? file?.file_name || "agreement_file.pdf" : "No file attached"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {fileUrl && (
                  <AgreementFileViewerModal
                    fileUrl={fileUrl}
                    fileName={file?.file_name || agreement.agreementno}
                  >
                    <Button size="sm" variant="outline">
                      View File
                    </Button>
                  </AgreementFileViewerModal>
                )}

                {userRole === UserRole.HeadOfficer && (
                  <AgreementFileDialog
                    agreementId={agreement.id}
                    mode={fileUrl ? "edit" : "add"}
                    currentFile={
                      file
                        ? {
                            fileUrl: file.file_url,
                            fileName: file.file_name,
                            mimeType: file.mime_type,
                          }
                        : null
                    }
                  >
                    <Button size="sm">
                      {fileUrl ? "Edit File" : "Add File"}
                    </Button>
                  </AgreementFileDialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contractor & Linked Work Items */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white rounded-3xl xl:col-span-1">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#DFEEF9] p-2 text-[#136FB6]">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="text-[16px] font-extrabold text-[#1a2b3c]">
                  Contractor Details
                </h3>
                <p className="text-[12px] font-medium text-gray-500">
                  The primary contractor assigned to this agreement.
                </p>
              </div>
            </div>

            {isTemporaryContractor ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/70 p-6 text-center">
                <p className="text-[14px] font-extrabold text-gray-700">
                  Contractor does not exist
                </p>
                <p className="mt-1 text-[12px] font-medium text-gray-500">
                  This agreement is linked to a temporary contractor.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                <DetailItem label="Name" value={agreement.contractor?.name} />
                <DetailItem label="Code" value={agreement.contractor?.code} />
                <DetailItem label="Email" value={agreement.contractor?.email} />
                <DetailItem label="District ID" value={agreement.contractor?.district_id} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white rounded-3xl xl:col-span-2">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#DFEEF9] p-2 text-[#136FB6]">
                <Wrench size={18} />
              </div>
              <div>
                <h3 className="text-[16px] font-extrabold text-[#1a2b3c]">
                  Linked Work Items
                </h3>
                <p className="text-[12px] font-medium text-gray-500">
                  Select a work item below to view its details and progress.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {agreement.workItems && agreement.workItems.length > 0 ? (
                agreement.workItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/work-order/details/${item.id}`}
                    className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-linear-to-br from-white to-[#F8FBFF] shadow-sm hover:border-[#136FB6]/20 hover:bg-[#DFEEF9]/10 transition-all group"
                  >
                    <div>
                      <p className="text-[14px] font-extrabold text-[#1a2b3c] flex items-center gap-2">
                        {item.work_code}
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 rounded-md ${
                            item.status === "COMPLETED"
                              ? "bg-green-50 text-green-700 border-green-100"
                              : item.status === "IN_PROGRESS"
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : "bg-gray-50 text-gray-600 border-gray-100"
                          }`}
                        >
                          {item.status.replaceAll("_", " ")}
                        </Badge>
                      </p>
                      <p className="text-[12px] text-gray-500 mt-1">
                        Scheme Type: {formatValue(item.schemetype)} · Progress:{" "}
                        <span className="font-semibold text-gray-700">
                          {item.progress_percentage}%
                        </span>
                      </p>
                    </div>

                    <div className="rounded-full bg-gray-50 p-2 text-gray-400 group-hover:bg-[#DFEEF9] group-hover:text-[#136FB6] transition-colors">
                      <ArrowRight size={16} />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/60 p-8 text-center">
                  <p className="text-[13px] font-semibold text-gray-500">
                    No work items are linked to this agreement.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
