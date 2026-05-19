"use client";
import { Card, CardContent } from "@/components/ui/card";
import {
  approvePhotoStatus,
  deselectPhotoStatus,
  PhotoStatusState,
  rejectPhotoStatus,
  selectPhotoStatus,
  type PhotoStatusRecord,
} from "@/services/photoStatusService";
import { UserRole } from "@/types/usertypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Expand, Loader2, MapPinned, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "./ui/button";

type ReviewPhotosComponentProps = {
  photo: PhotoStatusRecord;
  componentId: string;
  userRole?: string;
  componentDetails?: any;
};

const ReviewPhotosComponent = ({
  photo,
  componentId,
  userRole,
  componentDetails,
}: ReviewPhotosComponentProps) => {
  const router = useRouter();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!isPreviewOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsPreviewOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewOpen]);

  const parsedDate = photo.photo.timestamp
    ? new Date(photo.photo.timestamp)
    : null;
  const isValidDate = parsedDate && !Number.isNaN(parsedDate.getTime());
  const formattedDateTime = isValidDate
    ? parsedDate!.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "N/A";

  const queryClient = useQueryClient();
  const selectMutation = useMutation({
    mutationFn: (photoId: string) => selectPhotoStatus(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["componentPhotoStatuses", componentId],
      });
      router.refresh();
      toast.success("Photo selected for approval");
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to select photo"),
  });

  const deselectMutation = useMutation({
    mutationFn: (photoId: string) => deselectPhotoStatus(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["componentPhotoStatuses", componentId],
      });
      router.refresh();
      toast.success("Photo deselected");
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to deselect photo"),
  });

  const approveMutation = useMutation({
    mutationFn: (photoId: string) => approvePhotoStatus(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["componentPhotoStatuses", componentId],
      });
      router.refresh();
      toast.success("Photo approved");
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to approve photo"),
  });

  const rejectMutation = useMutation({
    mutationFn: (photoId: string) => rejectPhotoStatus(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["componentPhotoStatuses", componentId],
      });
      router.refresh();
      toast.success("Photo reverted to selected");
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to reject photo"),
  });

  const isSelected = photo.status === PhotoStatusState.SELECTED;
  const isApproved = photo.status === PhotoStatusState.APPROVED;
  const isRejected = photo.status === PhotoStatusState.REJECTED;
  const canModify =
    !isApproved &&
    !isRejected &&
    (userRole === UserRole.Contractor || userRole === "CO");

  const quantityValue = Number(
    componentDetails?.quantity ??
      (photo as any)?.workItemComponent?.quantity ??
      NaN,
  );
  const progressValue = Number(
    componentDetails?.progress ??
      (photo as any)?.workItemComponent?.progress ??
      NaN,
  );
  const componentComplete =
    Number.isFinite(quantityValue) &&
    Number.isFinite(progressValue) &&
    quantityValue === progressValue;

  const formatTimestamp = (ts: string | null) => {
    if (!ts) return "N/A";
    try {
      const d = new Date(ts);
      return `${d.toLocaleDateString("en-IN")} ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return "N/A";
    }
  };

  const hasRejectedMetadata = Boolean(
    photo.rejected_at || photo.rejected_by || photo.rejectedByUser,
  );

  return (
    <>
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-100 bg-black/90 flex items-center justify-center p-4"
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
              src={photo.photo.image_url}
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
            src={photo.photo.image_url}
            alt="Component Record"
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute right-3 bottom-3 rounded-full bg-black/60 text-white p-2">
            <Expand size={14} />
          </div>
          {isSelected && (
            <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">
              Waiting for Approval
            </div>
          )}
          {isApproved && (
            <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">
              APPROVED
            </div>
          )}
          {isRejected && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">
              REJECTED
            </div>
          )}
        </button>

        <CardContent className="px-5 pb-5 flex-1">
          <div className="space-y-3 h-full flex flex-col justify-between ">
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="space-y-0.5">
                <p className="text-gray-400 font-bold uppercase tracking-wider">
                  Uploader
                </p>
                <p className="text-[#1a2b3c] font-black truncate">
                  {photo.photo.employee?.name || "Anonymous"}
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="text-gray-400 font-bold uppercase tracking-wider">
                  Uploaded Date
                </p>
                <p className="text-[#1a2b3c] font-black">{formattedDateTime}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-gray-400 font-bold uppercase tracking-wider">
                  Longitude
                </p>
                <p className="text-[#1a2b3c] font-black truncate">
                  {photo.photo.longitude || "N/A"}
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="text-gray-400 font-bold uppercase tracking-wider">
                  Latitude
                </p>
                <p className="text-[#1a2b3c] font-black truncate">
                  {photo.photo.latitude || "N/A"}
                </p>
              </div>

              {/* Selected, approved, and rejected metadata: layout side-by-side when present */}
              {(photo.selected_at ||
                photo.approved_at ||
                hasRejectedMetadata) && (
                <div className="col-span-2 pt-2 border-t border-gray-200">
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
                    {photo.selected_at && (
                      <div>
                        <div className="space-y-1">
                          <p className="text-gray-400 font-bold uppercase tracking-wider">
                            Selected By
                          </p>
                          <p className="text-[#1a2b3c] font-black">
                            {photo.selectedByUser?.name ||
                              photo.selected_by ||
                              "N/A"}
                            <span className="block font-light">
                              ({photo?.selectedByUser?.code})
                            </span>
                          </p>
                          <p className="text-gray-400 font-bold uppercase tracking-wider mt-2">
                            Selected At
                          </p>
                          <p className="text-[#1a2b3c] font-black">
                            {formatTimestamp(photo.selected_at)}
                          </p>
                        </div>
                      </div>
                    )}

                    {photo.approved_at && (
                      <div>
                        <div className="space-y-1">
                          <p className="text-gray-400 font-bold uppercase tracking-wider">
                            Approved By
                          </p>
                          <p className="text-[#1a2b3c] font-black">
                            {photo.approvedByUser?.name ||
                              photo.approved_by ||
                              "N/A"}
                            <span className="block font-light">
                              ({photo?.approvedByUser?.district?.districtname})
                            </span>
                          </p>
                          <p className="text-gray-400 font-bold uppercase tracking-wider mt-2">
                            Approved At
                          </p>
                          <p className="text-[#1a2b3c] font-black">
                            {formatTimestamp(photo.approved_at)}
                          </p>
                        </div>
                      </div>
                    )}

                    {hasRejectedMetadata && (
                      <div>
                        <div className="space-y-1">
                          <p className="text-gray-400 font-bold uppercase tracking-wider">
                            Rejected By
                          </p>
                          <p className="text-[#1a2b3c] font-black">
                            {photo.rejectedByUser?.name ||
                              photo.rejected_by ||
                              "N/A"}
                            <span className="block font-light">
                              ({photo?.rejectedByUser?.code})
                            </span>
                          </p>
                          <p className="text-gray-400 font-bold uppercase tracking-wider mt-2">
                            Rejected At
                          </p>
                          <p className="text-[#1a2b3c] font-black">
                            {formatTimestamp(photo.rejected_at ?? null)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-2 w-full">
              <Link
                href={`/work-order/review-photos/${componentId}/location/${photo.id}`}
                className="flex-1"
              >
                <Button
                  variant="outline"
                  className="w-full h-10 rounded-lg text-[12px] font-bold border-[#136FB6]/20 text-[#136FB6] hover:bg-[#DFEEF9] hover:text-[#105E9A]"
                >
                  <MapPinned size={16} className="mr-1.5" />
                  View Location
                </Button>
              </Link>
              {userRole === UserRole.DistrictOfficer || userRole === "DO" ? (
                isApproved ? (
                  <Button
                    disabled
                    className="flex-1 bg-green-600 text-white h-10 rounded-lg text-[12px] font-bold shadow-md"
                  >
                    Approved
                  </Button>
                ) : isRejected ? (
                  <div className="grid flex-1 grid-cols-2 gap-2">
                    <Button
                      disabled
                      className="flex-1 bg-red-600 text-white h-10 rounded-lg text-[12px] font-bold shadow-md"
                    >
                      Rejected
                    </Button>
                    <Button
                      onClick={() => approveMutation.mutate(photo.photo.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white h-10 rounded-lg text-[12px] font-bold shadow-md shadow-green-600/10"
                    >
                      {approveMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        "Approve"
                      )}
                    </Button>
                  </div>
                ) : isSelected || isRejected ? (
                  <div className="grid flex-1 grid-cols-2 gap-2">
                    <Button
                      onClick={() => approveMutation.mutate(photo.photo.id)}
                      disabled={approveMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white h-10 rounded-lg text-[12px] font-bold shadow-md shadow-green-600/10"
                    >
                      {approveMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        "Approve"
                      )}
                    </Button>
                    <Button
                      onClick={() => rejectMutation.mutate(photo.photo.id)}
                      disabled={rejectMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white h-10 rounded-lg text-[12px] font-bold shadow-md shadow-red-600/10"
                    >
                      {rejectMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        "Reject"
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    disabled
                    className="flex-1 bg-gray-100 text-gray-400 h-10 rounded-lg text-[12px] font-bold"
                  >
                    Not selected
                  </Button>
                )
              ) : userRole === UserRole.Contractor || userRole === "CO" ? (
                isApproved ? (
                  <Button
                    disabled
                    className="flex-1 bg-green-600 text-white h-10 rounded-lg text-[12px] font-bold shadow-md"
                  >
                    Approved
                  </Button>
                ) : isRejected ? (
                  <Button
                    disabled
                    className="flex-1 bg-red-600 text-white h-10 rounded-lg text-[12px] font-bold shadow-md"
                  >
                    Rejected
                  </Button>
                ) : isSelected ? (
                  <Button
                    onClick={() => deselectMutation.mutate(photo.photo.id)}
                    disabled={deselectMutation.isPending || !canModify}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white h-10 rounded-lg text-[12px] font-bold shadow-md shadow-amber-500/10"
                  >
                    {deselectMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Deselect"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => selectMutation.mutate(photo.photo.id)}
                    disabled={
                      selectMutation.isPending ||
                      !canModify ||
                      !componentComplete
                    }
                    title={
                      !componentComplete
                        ? "CO can select only when component progress equals quantity"
                        : undefined
                    }
                    className="flex-1 bg-[#136FB6] hover:bg-[#105E9A] text-white h-10 rounded-lg text-[12px] font-bold shadow-md shadow-[#136FB6]/10"
                  >
                    {selectMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Send for Approval"
                    )}
                  </Button>
                )
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ReviewPhotosComponent;
