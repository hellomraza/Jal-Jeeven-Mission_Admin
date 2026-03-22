"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { selectComponentPhoto } from "@/services/workService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

type PhotoCompentProps = {
  photosData: PaginatedResponse<Photo[]>;
};
export default function PhotoCompent({ photosData }: PhotoCompentProps) {
  const { componentId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: (photoId: string) =>
      selectComponentPhoto(componentId as string, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["componentPhotos", componentId],
      });
      toast.success("Photo selected and submitted for approval");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to select photo");
    },
  });

  const photos = photosData?.data || [];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full h-9 w-9 border-gray-100 shadow-sm"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </Button>
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

      {photos.length === 0 ? (
        <div className="p-20 text-center bg-white rounded-[20px] shadow-sm">
          <p className="text-gray-500 text-[14px]">
            No photos uploaded for this component yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo: any) => (
            <Card
              key={photo.id}
              className="overflow-hidden border-none shadow-sm rounded-[20px] bg-white group"
            >
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                <img
                  src={photo.image_url}
                  alt="Component Record"
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
                {photo.is_selected && (
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">
                    SELECTED
                  </div>
                )}
                {photo.is_forwarded_to_do && (
                  <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">
                    SUBMITTED
                  </div>
                )}
              </div>
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="space-y-0.5">
                      <p className="text-gray-400 font-bold uppercase tracking-wider">
                        Progress
                      </p>
                      <p className="text-[#1a2b3c] font-black">
                        {photo.progress || 0}%
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-gray-400 font-bold uppercase tracking-wider">
                        Uploader
                      </p>
                      <p className="text-[#1a2b3c] font-black truncate">
                        {photo.employee?.name || "Anonymous"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2 w-full">
                    {photo.workItemComponent?.status === "APPROVED" ? (
                      /* Component is approved: only show "Approved" for the specific photo that was chosen */
                      (photo.id ===
                        photo.workItemComponent?.approved_photo_id ||
                        photo.is_forwarded_to_do) && (
                        <Button
                          disabled
                          className="flex-1 bg-green-600 text-white h-10 rounded-xl text-[12px] font-bold shadow-md"
                        >
                          Approved
                        </Button>
                      )
                    ) : (
                      /* Component is not yet approved: allow selection of any photo */
                      <>
                        <Button
                          onClick={() => submitMutation.mutate(photo.id)}
                          disabled={submitMutation.isPending}
                          className={`flex-1 ${photo.is_selected ? "bg-green-600" : "bg-[#136FB6]"} hover:bg-[#105E9A] text-white h-10 rounded-xl text-[12px] font-bold shadow-md shadow-[#136FB6]/10`}
                        >
                          {submitMutation.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            "Approve"
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-10 px-4 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 text-[12px] font-bold"
                          onClick={() =>
                            toast.info("Reject functionality to be implemented")
                          }
                        >
                          <XCircle size={18} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
