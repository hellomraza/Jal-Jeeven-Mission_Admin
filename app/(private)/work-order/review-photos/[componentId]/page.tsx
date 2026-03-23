import BackButton from "@/components/BackButton";
import ReviewPhotosComponent from "@/components/ReviewPhotosComponent";
import { createServerApiClient } from "@/lib/server-api-client";

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

  const progress = photos[0]?.workItemComponent?.progress;
  const quantity = Number(photos[0]?.workItemComponent?.quantity);
  const progressPercentage =
    quantity && quantity > 0 ? (Number(progress) / Number(quantity)) * 100 : 0;

  const shouldShowApprovalDisclaimer = photos.some((photo: any) => {
    const quantity = Number(photo.workItemComponent?.quantity);
    const progress = Number(photo.workItemComponent?.progress);
    const isQuantityProgressMismatch =
      !Number.isFinite(quantity) ||
      !Number.isFinite(progress) ||
      quantity !== progress;

    return (
      photo.workItemComponent?.status === "APPROVED" ||
      isQuantityProgressMismatch
    );
  });

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
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
      </div>

      {shouldShowApprovalDisclaimer && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800">
          Approval is disabled because the component is not completed yet
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
