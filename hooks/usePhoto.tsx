import { getPhotoById } from "@/services/photoService";
import { useQuery } from "@tanstack/react-query";

export const usePhoto = (id: string) => {
  return useQuery({
    queryKey: ["photo", id],
    queryFn: () => getPhotoById(id),
    enabled: !!id, // Only run the query if id is provided
  });
};
