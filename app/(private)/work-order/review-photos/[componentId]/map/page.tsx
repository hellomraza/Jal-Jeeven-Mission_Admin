"use server";

import BackButton from "@/components/BackButton";
import PhotoMapClient from "@/components/PhotoMapClient";
import { Button } from "@/components/ui/button";
import { createServerApiClient } from "@/lib/server-api-client";
import {
  PhotoStatusRecord,
  PhotoStatusState,
} from "@/services/photoStatusService";
import { UserRole } from "@/types/usertypes";
import { MapPin } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function PhotoMapPage({
  params,
}: {
  params: Promise<{ componentId: string }>;
}) {
  const { componentId } = await params;
  const apiClient = await createServerApiClient();

  const response = await apiClient.get<PaginatedResponse<PhotoStatusRecord>>(
    `/photo-status/component/${componentId}?page=1&limit=500`,
  );

  const photoStatuses = response?.data?.data || [];

  const componentResponse = await apiClient.get(`/components/${componentId}`);
  const componentDetails = componentResponse?.data;

  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value as UserRole | undefined;

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
    visiblePhotoStatuses = photoStatuses;
  }

  // Map to simple points for client map
  const photosWithCoordinates = visiblePhotoStatuses
    .map((s: any) => ({
      id: s.id,
      latitude: s.photo.latitude !== null ? Number(s.photo.latitude) : NaN,
      longitude: s.photo.longitude !== null ? Number(s.photo.longitude) : NaN,
      created_at: s.photo.timestamp ?? s.created_at ?? null,
      status: s.status,
    }))
    .filter(
      (p: any) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude),
    );

  return (
    <div className="space-y-6 max-w-350 mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-[20px] font-extrabold text-[#1a2b3c] tracking-tight">
              Photo Locations Map
            </h1>
            <p className="text-[12px] text-gray-500 font-medium">
              Component: {componentDetails?.component?.name}
            </p>
            <p className="text-[12px] text-gray-500 font-medium">
              Showing {photosWithCoordinates.length} photo location
              {photosWithCoordinates.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {photosWithCoordinates.length === 0 ? (
        <div className="p-20 text-center bg-white rounded-[20px] shadow-sm">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-[14px] mb-6">
            No photos with location data found for this component.
          </p>
          <Link href={`/work-order/review-photos/${componentId}`}>
            <Button variant="outline" className="rounded-2xl">
              Back to Photos
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <PhotoMapClient photos={photosWithCoordinates} />
        </>
      )}
    </div>
  );
}
