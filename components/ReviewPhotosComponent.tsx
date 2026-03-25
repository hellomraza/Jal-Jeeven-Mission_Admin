"use client";
import { Card, CardContent } from "@/components/ui/card";
import { selectComponentPhoto } from "@/services/workService";
import { WorkItemComponentStatus } from "@/types/usertypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Expand, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "./ui/button";

type ReviewPhotosComponentProps = {
  photo: Photo;
  componentId: string;
};
const ReviewPhotosComponent = ({
  photo,
  componentId,
}: ReviewPhotosComponentProps) => {
  const router = useRouter();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!isPreviewOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPreviewOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewOpen]);

  const parsedDate = photo.timestamp ? new Date(photo.timestamp) : null;
  const isValidDate = parsedDate && !Number.isNaN(parsedDate.getTime());
  const formattedDate = isValidDate
    ? parsedDate.toLocaleDateString("en-IN")
    : "N/A";
  const formattedTime = isValidDate
    ? parsedDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  const quantityValue = Number(photo.workItemComponent?.quantity);
  const progressValue = Number(photo.workItemComponent?.progress);

  const isQuantityProgressMismatch =
    !Number.isFinite(quantityValue) ||
    !Number.isFinite(progressValue) ||
    quantityValue !== progressValue;
  const shouldDisableApprove =
    photo.workItemComponent?.status === WorkItemComponentStatus.APPROVED ||
    photo.workItemComponent?.status === WorkItemComponentStatus.SUBMITTED ||
    isQuantityProgressMismatch;

  const queryClient = useQueryClient();
  const submitMutation = useMutation({
    mutationFn: (photoId: string) =>
      selectComponentPhoto(componentId as string, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["componentPhotos", componentId],
      });
      router.refresh();
      toast.success("Photo selected and submitted for approval");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to select photo");
    },
  });

  return (
    <>
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsPreviewOpen(false)}
            className="absolute top-5 right-5 rounded-full bg-white/10 hover:bg-white/20 text-white p-2"
            aria-label="Close image preview"
          >
            <X size={20} />
          </button>
          <div
            className="max-h-[92vh] max-w-[96vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photo.image_url}
              alt="Full Screen Component Record"
              className="max-h-[92vh] max-w-[96vw] object-contain"
            />
          </div>
        </div>
      )}

      <Card
        key={photo.id}
        className="overflow-hidden border-none shadow-sm rounded-[20px] bg-white group py-0"
      >
        <button
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          className="aspect-video relative overflow-hidden bg-gray-100 w-full text-left"
        >
          <img
            src={photo.image_url}
            alt="Component Record"
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute right-3 bottom-3 rounded-full bg-black/60 text-white p-2">
            <Expand size={14} />
          </div>

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
        </button>

        <CardContent className="px-5 pb-5">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="space-y-0.5">
                <p className="text-gray-400 font-bold uppercase tracking-wider">
                  Uploader
                </p>
                <p className="text-[#1a2b3c] font-black truncate">
                  {photo.employee?.name || "Anonymous"}
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="text-gray-400 font-bold uppercase tracking-wider">
                  Date
                </p>
                <p className="text-[#1a2b3c] font-black">{formattedDate}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-gray-400 font-bold uppercase tracking-wider">
                  Time
                </p>
                <p className="text-[#1a2b3c] font-black">{formattedTime}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-gray-400 font-bold uppercase tracking-wider">
                  Latitude
                </p>
                <p className="text-[#1a2b3c] font-black truncate">
                  {photo.latitude || "N/A"}
                </p>
              </div>

              <div className="col-span-2 space-y-0.5">
                <p className="text-gray-400 font-bold uppercase tracking-wider">
                  Longitude
                </p>
                <p className="text-[#1a2b3c] font-black truncate">
                  {photo.longitude || "N/A"}
                </p>
              </div>
            </div>

            <div className="pt-2 flex gap-2 w-full">
              {photo.workItemComponent?.status === "APPROVED" ? (
                /* Component is approved: only show "Approved" for the specific photo that was chosen */
                (photo.id === photo.workItemComponent?.approved_photo_id ||
                  photo.is_forwarded_to_do) && (
                  <Button
                    disabled
                    className="flex-1 bg-green-600 text-white h-10 rounded-lg text-[12px] font-bold shadow-md"
                  >
                    Approved
                  </Button>
                )
              ) : (
                /* Component is not yet approved: allow selection of any photo */
                <>
                  <Button
                    onClick={() => submitMutation.mutate(photo.id)}
                    disabled={submitMutation.isPending || shouldDisableApprove}
                    className={`flex-1 ${photo.is_selected ? "bg-green-600" : "bg-[#136FB6]"} hover:bg-[#105E9A] text-white h-10 rounded-lg text-[12px] font-bold shadow-md shadow-[#136FB6]/10`}
                  >
                    {submitMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Approve"
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ReviewPhotosComponent;
