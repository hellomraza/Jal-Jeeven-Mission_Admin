"use server";

import ApprovedPhotoViewer from "@/components/ApprovedPhotoViewer";
import BackButton from "@/components/BackButton";
import PhotoMapClient from "@/components/PhotoMapClient";
import { createServerApiClient } from "@/lib/server-api-client";
import {
  PhotoStatusRecord,
  PhotoStatusState,
} from "@/services/photoStatusService";
import { UserRole } from "@/types/usertypes";
import { Clock3, ShieldCheck, User } from "lucide-react";
import { cookies } from "next/headers";

type ApprovedPhotoPageStatus = {
  id: string;
  status: "UPLOADED" | "SELECTED" | "APPROVED" | "REJECTED";
  selectedByUser?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  selected_at: string | null;
  approvedByUser?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  approved_at: string | null;
  photo: {
    id: string;
    image_url: string;
    latitude: string | number | null;
    longitude: string | number | null;
    timestamp: string | null;
    employee?: {
      id: string;
      name: string | null;
      email: string | null;
    } | null;
  };
};

export default async function ApprovedPhotoPage({
  params,
}: {
  params: Promise<{ componentId: string }>;
}) {
  const { componentId } = await params;
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value;
  const apiClient = await createServerApiClient();
  const response = await apiClient.get<PaginatedResponse<PhotoStatusRecord>>(
    `/photo-status/component/${componentId}?page=1&limit=100`,
  );
  const photoStatuses = response.data?.data || [];
  const approvedPhotos = photoStatuses.filter(
    (photoStatus: ApprovedPhotoPageStatus) => photoStatus.status === "APPROVED",
  );

  let visiblePhotoStatuses = approvedPhotos;

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
  }
  // Map approved photos to coordinates for the client map
  const approvedPhotosWithCoordinates = visiblePhotoStatuses
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
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-[20px] font-extrabold text-[#1a2b3c] tracking-tight">
            Approved Photos Map
          </h1>
          <p className="text-[12px] text-gray-500 font-medium">
            Showing {approvedPhotosWithCoordinates.length} approved photo
            location
            {approvedPhotosWithCoordinates.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {approvedPhotosWithCoordinates.length === 0 ? (
        <div className="p-20 text-center bg-white rounded-[20px] shadow-sm">
          <ShieldCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-[14px] mb-6">
            No approved photos with location data found for this component.
          </p>
        </div>
      ) : (
        <>
          <PhotoMapClient photos={approvedPhotosWithCoordinates} />

          <div className="bg-white rounded-[20px] shadow-sm p-6 border border-gray-100">
            <h2 className="text-[16px] font-bold text-[#1a2b3c] mb-4">
              Approved Photos List ({approvedPhotosWithCoordinates.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visiblePhotoStatuses.map(
                (approvedPhoto: ApprovedPhotoPageStatus) => {
                  const photoLatitude = approvedPhoto.photo.latitude;
                  const photoLongitude = approvedPhoto.photo.longitude;

                  return (
                    <div
                      key={approvedPhoto.id}
                      className="overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm"
                    >
                      <ApprovedPhotoViewer
                        imageUrl={approvedPhoto.photo.image_url}
                        alt="Approved component photo"
                      />
                      <div className="space-y-3 p-5">
                        <div className="flex items-center gap-2 text-[#136FB6]">
                          <ShieldCheck size={18} />
                          <span className="text-[12px] font-bold uppercase tracking-widest">
                            Approved Photo
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-[12px]">
                          <div>
                            <p className="text-gray-400 font-bold uppercase tracking-wider">
                              Latitude
                            </p>
                            <p className="font-semibold text-[#1a2b3c]">
                              {photoLatitude !== null
                                ? Number(photoLatitude).toFixed(6)
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-bold uppercase tracking-wider">
                              Longitude
                            </p>
                            <p className="font-semibold text-[#1a2b3c]">
                              {photoLongitude !== null
                                ? Number(photoLongitude).toFixed(6)
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2 text-[12px]">
                          {approvedPhoto.photo.employee && (
                            <div className="flex items-start gap-2 text-gray-600">
                              <User size={16} className="mt-0.5 shrink-0" />
                              <p>
                                Submitted by{" "}
                                {approvedPhoto.photo.employee.name || "Unknown"}
                              </p>
                            </div>
                          )}
                          {approvedPhoto.photo.timestamp && (
                            <div className="flex items-start gap-2 text-gray-600">
                              <Clock3 size={16} className="mt-0.5 shrink-0" />
                              <p>
                                Uploaded at{" "}
                                {new Date(
                                  approvedPhoto.photo.timestamp,
                                ).toLocaleString("en-IN")}
                              </p>
                            </div>
                          )}
                          {approvedPhoto.approvedByUser && (
                            <div className="flex items-start gap-2 text-gray-600">
                              <User size={16} className="mt-0.5 shrink-0" />
                              <p>
                                Approved by{" "}
                                {approvedPhoto.approvedByUser.name || "Unknown"}
                              </p>
                            </div>
                          )}
                          {approvedPhoto.approved_at && (
                            <div className="flex items-start gap-2 text-gray-600">
                              <Clock3 size={16} className="mt-0.5 shrink-0" />
                              <p>
                                Approved at{" "}
                                {new Date(
                                  approvedPhoto.approved_at,
                                ).toLocaleString("en-IN")}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
