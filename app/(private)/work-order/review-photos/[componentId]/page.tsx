import BackButton from "@/components/BackButton";
import ReviewPhotosComponent from "@/components/ReviewPhotosComponent";
import TpiReferencePhotoReview from "@/components/TpiReferencePhotoReview";
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
  const { componentId } = await params;
  const apiClient = await createServerApiClient();
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value as UserRole | undefined;

  const [response, componentResponse] = await Promise.all([
    apiClient.get<PaginatedResponse<PhotoStatusRecord>>(
      `/photo-status/component/${componentId}?page=1&limit=100`,
    ),
    apiClient.get<any>(`/components/${componentId}`),
  ]);

  const photoStatuses = response?.data?.data || [];
  const componentDetails = componentResponse?.data;

  // If component is Bulk Village and role is not HO, fetch TPI reference photos
  let tpiPhotos: any[] = [];
  let tpiStatus: any = null;
  const isBulkVillage =
    componentDetails?.workItem?.work_order_type === "BULK_VILLAGE" ||
    componentDetails?.work_order?.work_order_type === "BULK_VILLAGE" ||
    componentDetails?.workOrderType === "BULK_VILLAGE" ||
    componentDetails?.component?.work_order_type === "BULK_VILLAGE" ||
    Boolean(componentDetails?.workItem?.tpi_id);

  const isTpi =
    role === UserRole.TPI ||
    role === "TPI" ||
    role === UserRole.TPI_STAFF ||
    role === "TPI_STAFF";
  const isContractor = role === UserRole.Contractor || role === "CO";
  const isHO = role === UserRole.HeadOfficer || role === "HO";

  const showContractorEvidence = !isTpi;
  const showTpiEvidence = isBulkVillage && !isContractor && !isHO;

  if (showTpiEvidence) {
    try {
      const [tpiPhotosRes, tpiStatusRes] = await Promise.all([
        apiClient
          .get(`/components/${componentId}/tpi-reference-photos`)
          .catch((err) => {
            console.error(
              "Error fetching tpi reference photos:",
              err?.response?.data || err?.message,
            );
            return { data: [] };
          }),
        apiClient
          .get(`/tpi-photo-status/component/${componentId}`)
          .catch(() => ({ data: null })),
      ]);
      tpiPhotos = tpiPhotosRes.data || [];
      tpiStatus = tpiStatusRes.data;
    } catch (e) {
      console.error("Error fetching TPI reference data:", e);
    }
  }

  // Filter visible contractor photos per role
  let visiblePhotoStatuses = photoStatuses;
  if (role === UserRole.DistrictOfficer || role === "DO") {
    visiblePhotoStatuses = photoStatuses.filter((p: any) =>
      [
        PhotoStatusState.SELECTED,
        PhotoStatusState.APPROVED,
        PhotoStatusState.REJECTED,
      ].includes(p.status),
    );
  } else if (role === UserRole.HeadOfficer || role === "HO") {
    visiblePhotoStatuses = photoStatuses.filter(
      (p: any) => p.status === PhotoStatusState.APPROVED,
    );
  } else if (role === UserRole.Contractor || role === "CO") {
    visiblePhotoStatuses = photoStatuses;
  }

  const hasMapData = photoStatuses.some(
    (photoStatus) =>
      photoStatus.photo.latitude !== null &&
      photoStatus.photo.longitude !== null,
  );

  return (
    <div className="space-y-8 max-w-300 mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-[20px] font-extrabold text-[#1a2b3c] tracking-tight">
              Review Component Photos
            </h1>
            <p className="text-[12px] text-gray-500 font-medium">
              Component: {componentDetails?.component?.name || "Component"} (
              {componentDetails?.progress ?? "0"} /{" "}
              {componentDetails?.quantity ?? "0"} completed)
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

      {/* Group 1: Contractor Evidence Photos (Visible to Contractor, DO, HO, EM - NOT TPI) */}
      {showContractorEvidence && (
        <div className="space-y-4">
          <div>
            <h2 className="text-[16px] font-extrabold text-[#1a2b3c]">
              Contractor Execution Evidence
            </h2>
            <p className="text-[12px] text-gray-500 font-medium">
              Photos submitted by contractor for approval
            </p>
          </div>

          {visiblePhotoStatuses.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl shadow-xs border border-gray-100">
              <p className="text-gray-500 text-[14px]">
                No contractor execution photos uploaded for this component yet.
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
      )}

      {/* Group 2: TPI Reference Evidence (Visible to TPI Agency, TPI Staff, DO - NOT Contractor or HO) */}
      {showTpiEvidence && (
        <TpiReferencePhotoReview
          tpiPhotos={tpiPhotos}
          selectedPhotoId={tpiStatus?.photo_id}
          userRole={role}
        />
      )}
    </div>
  );
};

export default ReviewPhotos;

