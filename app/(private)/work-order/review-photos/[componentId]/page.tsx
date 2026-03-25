import BackButton from "@/components/BackButton";
import ReviewPhotosComponent from "@/components/ReviewPhotosComponent";
import { Button } from "@/components/ui/button";
import { createServerApiClient } from "@/lib/server-api-client";
import { WorkItemComponentStatus } from "@/types/usertypes";
import { Map } from "lucide-react";
import Link from "next/link";

const ReviewPhotos = async ({
  params,
}: {
  params: Promise<{ componentId: string }>;
}) => {
  const { componentId } = await params; // Await the params to get the componentId
  const apiClient = await createServerApiClient();

  const response = await apiClient.get<PaginatedResponse<Photo>>(
    `/photos/component/${componentId}/review`,
  );
  const photosData = response.data;
  const photos = photosData?.data || [];

  const progress = Number(photos[0]?.workItemComponent?.progress);
  const quantity = Number(photos[0]?.workItemComponent?.quantity);
  const progressPercentage =
    quantity && quantity > 0 ? (Number(progress) / Number(quantity)) * 100 : 0;

  const approveButtonDisabledReason = () => {
    if (
      photos?.some(
        (photo) =>
          photo.workItemComponent?.status === WorkItemComponentStatus.APPROVED,
      )
    ) {
      return "This component has already been approved.";
    }
    if (
      photos?.some(
        (photo) =>
          photo.workItemComponent?.status === WorkItemComponentStatus.SUBMITTED,
      )
    ) {
      return "This component has already been submitted for approval.";
    }
    if (isNaN(quantity) || isNaN(progress)) {
      return "Quantity or progress is not a valid number.";
    }
    if (quantity !== progress) {
      return (
        "Component is not completed yet" +
        ` (Progress: ${progressPercentage.toFixed(2)}%)`
      );
    }

    return "";
  };

  // Filter photos that have coordinates
  const photosWithCoordinates = photos.filter(
    (photo: any) => photo.latitude && photo.longitude,
  );
  const hasMapData = photosWithCoordinates.length > 0;

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
              Component ID: {componentId}
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

      {approveButtonDisabledReason() && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800">
          {approveButtonDisabledReason()}
        </div>
      )}
      {photos.length === 0 ? (
        <div className="p-20 text-center bg-white rounded-[20px] shadow-sm">
          <p className="text-gray-500 text-[14px]">
            No photos uploaded for this component yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo: any) => (
            <ReviewPhotosComponent
              key={photo.id}
              photo={photo}
              componentId={componentId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewPhotos;
