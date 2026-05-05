"use server";
import BackButton from "@/components/BackButton";
import ReviewPhotosComponent from "@/components/ReviewPhotosComponent";
import { Button } from "@/components/ui/button";
import { createServerApiClient } from "@/lib/server-api-client";
import {
  PhotoStatusRecord,
  PhotoStatusState,
} from "@/services/photoStatusService";
import { UserRole } from "@/types/usertypes";
import { Map } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";

const ReviewPhotos = async ({
  params,
}: {
  params: Promise<{ componentId: string }>;
}) => {
  const { componentId } = await params; // Await the params to get the componentId
  const apiClient = await createServerApiClient();

  const response = await apiClient.get<PaginatedResponse<PhotoStatusRecord>>(
    `/photo-status/component/${componentId}?page=1&limit=100`,
  );

  const photoStatuses = response?.data?.data || [];
  // fetch component details (quantity, progress, status) to enforce CO selection rules
  const componentResponse = await apiClient.get<Component>(
    `/components/${componentId}`,
  );
  const componentDetails = componentResponse?.data;
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value as UserRole | undefined;

  // Filter visible photos per role
  let visiblePhotoStatuses = photoStatuses;
  if (role === UserRole.DistrictOfficer) {
    visiblePhotoStatuses = photoStatuses.filter((p: any) =>
      [
        PhotoStatusState.SELECTED,
        PhotoStatusState.APPROVED,
        PhotoStatusState.REJECTED,
      ].includes(p.status),
    );
  } else if (role === UserRole.HeadOfficer) {
    visiblePhotoStatuses = photoStatuses.filter(
      (p: any) => p.status === PhotoStatusState.APPROVED,
    );
  } else if (role === UserRole.Contractor) {
    visiblePhotoStatuses = photoStatuses; // CO sees all uploaded/selected
  }
  const hasMapData = photoStatuses.some(
    (photoStatus) =>
      photoStatus.photo.latitude !== null &&
      photoStatus.photo.longitude !== null,
  );

  return (
    <div className="space-y-6 max-w-300 mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-[20px] font-extrabold text-[#1a2b3c] tracking-tight">
              Review Component Photos
            </h1>
            <p className="text-[12px] text-gray-500 font-medium">
              Component: {componentDetails?.component?.name} (
              {(componentDetails as any)?.progress ?? "0"} /{" "}
              {(componentDetails as any)?.quantity ?? "0"} completed)
            </p>
          </div>
        </div>
        {hasMapData && (
          <Link href={`/work-order/review-photos/${componentId}/map`}>
            <Button className="flex items-center gap-2 bg-[#136FB6] hover:bg-[#0d5a99]">
              <Map size={18} />
              View Map
            </Button>
          </Link>
        )}
      </div>

      {visiblePhotoStatuses.length === 0 ? (
        <div className="p-20 text-center bg-white rounded-[20px] shadow-sm">
          <p className="text-gray-500 text-[14px]">
            No photos uploaded for this component yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePhotoStatuses.map((photoStatus: any) => (
            <ReviewPhotosComponent
              key={photoStatus.id}
              photo={photoStatus}
              componentId={componentId}
              userRole={role ?? UserRole.Contractor}
              componentDetails={componentDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewPhotos;
