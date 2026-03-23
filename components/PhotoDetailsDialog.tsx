"use client";
import { userDOInfoByWorkItem } from "@/hooks/useUser";
import apiClient from "@/lib/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Loader2, MapPin, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const PhotoDetailsDialog = ({
  component,
  photoData,
  isLoading,
  role = "DO",
}: {
  component: any;
  photoData: any;
  isLoading: boolean;
  role?: string;
}) => {
  const [confirmAction, setConfirmAction] = useState<
    "approve" | "reject" | null
  >(null);
  const queryClient = useQueryClient();

  const { data: doInfo } = userDOInfoByWorkItem(component?.work_item_id);
  console.log("DO Info for work item:", doInfo);

  const approveMutation = useMutation({
    mutationFn: (componentId: string) =>
      apiClient.post(`/components/${componentId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workitem"] });
      toast.success("Component approved successfully");
      setConfirmAction(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to approve component");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (componentId: string) =>
      apiClient.post(`/components/${componentId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workitem"] });
      toast.success("Component rejected successfully");
      setConfirmAction(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reject component");
    },
  });
  const handleApprove = () => {
    approveMutation.mutate(component.id);
  };

  const handleReject = () => {
    rejectMutation.mutate(component.id);
  };

  return (
    <div className="flex justify-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="rounded-lg hover:bg-emerald-50"
            title="Review Photos"
          >
            View Photo
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4 pr-4">
              <DialogTitle className="text-lg font-semibold">
                {component?.component?.name}
              </DialogTitle>
              <div className="shrink-0">
                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                    component?.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : component?.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {component?.status || "PENDING"}
                </span>
              </div>
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-blue-600" size={24} />
              <span className="ml-2 text-gray-600">Loading photo...</span>
            </div>
          ) : photoData ? (
            <>
              <div className="space-y-6">
                {/* Photo Image */}
                <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={photoData.image_url}
                    alt="Photo"
                    width={500}
                    height={400}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>

                {/* Photo Metadata */}
                <div className="space-y-3">
                  {/* Uploaded By Section */}
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2 shrink-0">
                      <User size={16} className="text-gray-600" />
                      <p className="text-xs font-semibold text-gray-700">
                        UPLOADED BY:
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {photoData.employee?.name ||
                          photoData.employee_id ||
                          "Unknown"}
                      </p>
                      {photoData.employee?.email && (
                        <p className="text-xs text-gray-600">
                          {photoData.employee.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* When Submitted */}
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2 shrink-0">
                      <Clock size={16} className="text-gray-600" />
                      <p className="text-xs font-semibold text-gray-700">
                        WHEN SUBMITTED:
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {photoData.timestamp
                          ? new Date(photoData.timestamp).toLocaleString(
                              "en-IN",
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Submitted Where */}
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2 shrink-0">
                      <MapPin size={16} className="text-gray-600" />
                      <p className="text-xs font-semibold text-gray-700">
                        SUBMITTED WHERE:
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {photoData.latitude && photoData.longitude
                          ? `${Number(photoData.latitude).toFixed(6)}, ${Number(photoData.longitude).toFixed(6)}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Selected By (Contractor) */}
                  {photoData.is_selected && photoData.selectedByUser && (
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-2 shrink-0">
                        <User size={16} className="text-gray-600" />
                        <p className="text-xs font-semibold text-gray-700">
                          SELECTED BY:
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {photoData.selectedByUser.name || "Unknown"}
                        </p>
                        {photoData.selectedByUser.email && (
                          <p className="text-xs text-gray-600">
                            {photoData.selectedByUser.email}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* When Selected */}
                  {photoData.is_selected && photoData.selected_at && (
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-2 shrink-0">
                        <Clock size={16} className="text-gray-600" />
                        <p className="text-xs font-semibold text-gray-700">
                          WHEN SELECTED:
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(
                            photoData.selected_at as string,
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Approved By (DO) - Show for HO when component is approved */}
                  {role === "HO" &&
                    component?.status === "APPROVED" &&
                    doInfo && (
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-2 shrink-0">
                          <User size={16} className="text-gray-600" />
                          <p className="text-xs font-semibold text-gray-700">
                            APPROVED BY (DO):
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {doInfo.name || "Unknown"}
                          </p>
                          {doInfo.email && (
                            <p className="text-xs text-gray-600">
                              {doInfo.email}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Action Buttons - Only show for DO role when not approved */}
              {role === "DO" && component?.status !== "APPROVED" && (
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmAction("reject")}
                    disabled={rejectMutation.isPending}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setConfirmAction("approve")}
                    disabled={approveMutation.isPending}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Failed to load photo details
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "approve"
                ? "Approve Component"
                : "Reject Component"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "approve"
                ? "Are you sure you want to approve this component? This action will mark the photo as officially approved."
                : "Are you sure you want to reject this component? The contractor will be able to select another photo."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={
                confirmAction === "approve" ? handleApprove : handleReject
              }
              className={
                confirmAction === "reject"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {confirmAction === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PhotoDetailsDialog;
