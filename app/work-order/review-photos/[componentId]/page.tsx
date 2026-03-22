import PhotoCompent from "@/components/PhotoCompent";
import { createServerApiClient } from "@/lib/server-api-client";

const ReviewPhotos = async ({
  params,
}: {
  params: Promise<{ componentId: string }>;
}) => {
  const { componentId } = await params; // Await the params to get the componentId
  const apiClient = await createServerApiClient();

  const response = await apiClient.get<PaginatedResponse<Photo[]>>(
    `/photos/component/${componentId}/review`,
  );
  const photosData = response.data;

  return <PhotoCompent photosData={photosData} />;
};

export default ReviewPhotos;
