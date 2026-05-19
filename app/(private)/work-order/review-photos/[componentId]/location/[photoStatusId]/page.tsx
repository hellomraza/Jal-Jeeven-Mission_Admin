"use server";

import BackButton from "@/components/BackButton";
import PhotoMapClient from "@/components/PhotoMapClient";
import { Button } from "@/components/ui/button";
import { createServerApiClient } from "@/lib/server-api-client";
import { PhotoStatusRecord } from "@/services/photoStatusService";
import { UserRole, WorkItemComponentStatus } from "@/types/usertypes";
import { Clock3, MapPinned, ShieldCheck, User } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

type PhotoLocationPageProps = {
  params: Promise<{ componentId: string; photoStatusId: string }>;
};

const getStatusBadge = (status: string, progress: number, quantity: number) => {
  switch (status) {
    case WorkItemComponentStatus.APPROVED:
      return "Approved";
    case WorkItemComponentStatus.IN_PROGRESS: {
      if (progress === quantity && quantity > 0) {
        return "Completed";
      } else if (progress > 0) {
        return "In Progress";
      }
    }
    case WorkItemComponentStatus.SUBMITTED:
      return "Submitted";
    case WorkItemComponentStatus.REJECTED:
      return "Rejected";
    default:
      return "Pending";
  }
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "N/A";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString("en-IN");
};

export default async function PhotoLocationPage({
  params,
}: PhotoLocationPageProps) {
  const { componentId, photoStatusId } = await params;
  const apiClient = await createServerApiClient();
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value as UserRole | undefined;

  const [photoResponse] = await Promise.all([
    apiClient.get<PhotoStatusRecord>(`/photo-status/${photoStatusId}`),
  ]);
  const photo = photoResponse?.data;

  const componentDetails = photo?.workItemComponent;

  if (!photo) {
    notFound();
  }

  const latitude =
    photo.photo.latitude !== null ? Number(photo.photo.latitude) : null;
  const longitude =
    photo.photo.longitude !== null ? Number(photo.photo.longitude) : null;
  const hasCoordinates =
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  const mapPhotos = hasCoordinates
    ? [
        {
          id: photo.id,
          latitude: latitude as number,
          longitude: longitude as number,
          status: photo.status,
        },
      ]
    : [];

  const photoStatusLabel = photo.status.toLowerCase();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-[20px] font-extrabold text-[#1a2b3c] tracking-tight">
              Photo Location Details
            </h1>
            <p className="text-[12px] text-gray-500 font-medium">
              Component: {componentDetails?.component?.name || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/work-order/review-photos/${componentId}`}>
            <Button
              variant="outline"
              className="rounded-lg border-[#136FB6]/20 text-[#136FB6] hover:bg-[#DFEEF9] hover:text-[#105E9A]"
            >
              Back to Photos
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          {hasCoordinates ? (
            <PhotoMapClient photos={mapPhotos} />
          ) : (
            <div className="rounded-[20px] border border-gray-100 bg-white p-10 text-center shadow-sm">
              <MapPinned className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h2 className="text-[16px] font-bold text-[#1a2b3c]">
                Location data unavailable
              </h2>
              <p className="mt-2 text-[14px] text-gray-500">
                This photo does not have latitude and longitude data, so a map
                marker cannot be shown.
              </p>
            </div>
          )}

          <div className="overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm">
            <img
              src={photo.photo.image_url}
              alt="Selected component photo"
              className="h-90 w-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[#136FB6]">
              <ShieldCheck size={18} />
              <span className="text-[12px] font-bold uppercase tracking-widest">
                {photoStatusLabel}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 text-[12px]">
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-wider">
                  Latitude
                </p>
                <p className="font-semibold text-[#1a2b3c]">
                  {latitude !== null ? latitude.toFixed(6) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-wider">
                  Longitude
                </p>
                <p className="font-semibold text-[#1a2b3c]">
                  {longitude !== null ? longitude.toFixed(6) : "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-[12px]">
              <div className="flex items-start gap-2 text-gray-600">
                <User size={16} className="mt-0.5 shrink-0" />
                <p>Submitted by {photo.photo.employee?.name || "Unknown"}</p>
              </div>
              <div className="flex items-start gap-2 text-gray-600">
                <Clock3 size={16} className="mt-0.5 shrink-0" />
                <p>Uploaded at {formatDateTime(photo.photo.timestamp)}</p>
              </div>
              {photo.selectedByUser?.name ? (
                <>
                  <div className="flex items-start gap-2 text-gray-600">
                    <User size={16} className="mt-0.5 shrink-0" />
                    <p>Selected by {photo.selectedByUser?.name || "Unknown"}</p>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <Clock3 size={16} className="mt-0.5 shrink-0" />
                    <p>Selected at {formatDateTime(photo.selected_at)}</p>
                  </div>
                </>
              ) : null}
              {photo.approvedByUser && (
                <>
                  <div className="flex items-start gap-2 text-gray-600">
                    <User size={16} className="mt-0.5 shrink-0" />
                    <p>Approved by {photo.approvedByUser.name || "Unknown"}</p>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <Clock3 size={16} className="mt-0.5 shrink-0" />
                    <p>Approved at {formatDateTime(photo.approved_at)}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-[16px] font-bold text-[#1a2b3c]">
              Record Metadata
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 text-[12px] md:grid-cols-2">
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-wider">
                  Component
                </p>
                <p className="font-semibold text-[#1a2b3c]">
                  {componentDetails?.component?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-wider">
                  District
                </p>
                <p className="font-semibold text-[#1a2b3c] break-all">
                  {photo.workItem?.district?.districtname || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-wider">
                  Work Item ID
                </p>
                <p className="font-semibold text-[#1a2b3c] break-all">
                  {photo.workItem?.work_code}
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-wider">
                  Component Status
                </p>
                <p className="font-semibold text-[#1a2b3c]">
                  {getStatusBadge(
                    componentDetails?.status || "",
                    Number(componentDetails?.progress) || 0,
                    Number(componentDetails?.quantity) || 0,
                  ) || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
