"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  approveTpiComponent,
  getTpiReviewPhotos,
} from "@/services/workOrderTpiService";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ImageIcon,
  Loader2,
  MapPin,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface DualPhotoReviewDialogProps {
  workOrderTpiId: string;
  component: any | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onApproved?: () => void;
  canApprove?: boolean;
}

export default function DualPhotoReviewDialog({
  workOrderTpiId,
  component,
  isOpen,
  onOpenChange,
  onApproved,
  canApprove = true,
}: DualPhotoReviewDialogProps) {
  const [remarks, setRemarks] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  const reviewQuery = useQuery({
    queryKey: ["tpi-review-photos", workOrderTpiId, component?.id],
    queryFn: async () => {
      if (!workOrderTpiId || !component?.id) return null;
      return getTpiReviewPhotos(workOrderTpiId, component.id);
    },
    enabled: isOpen && Boolean(workOrderTpiId && component?.id),
  });

  const reviewData = reviewQuery.data;
  const isLoading = reviewQuery.isLoading;

  const contractorPhoto = reviewData?.contractorSelectedPhoto;
  const tpiPhoto = reviewData?.tpiPhoto;

  const handleApprove = async () => {
    if (!workOrderTpiId || !component?.id) return;
    setIsApproving(true);
    try {
      await approveTpiComponent(workOrderTpiId, component.id, remarks);
      toast.success(`Component "${component.name}" approved successfully.`);
      onOpenChange(false);
      onApproved?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve component");
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[860px] p-0 border-0 rounded-2xl overflow-hidden bg-white shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                  Milestone #{component?.order_number}
                </span>
                <DialogTitle className="text-[18px] font-bold text-[#1a2b3c]">
                  {component?.name || "Component Inspection"}
                </DialogTitle>
              </div>
              <p className="text-[12px] text-gray-500 font-medium mt-1">
                Dual Photo Verification — Contractor Selected vs TPI Reference Photo
              </p>
            </div>
            {component?.status === "APPROVED" && (
              <Badge className="bg-emerald-100 text-emerald-800 text-[12px] px-3 py-1 font-bold">
                ✓ Component Approved
              </Badge>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#136FB6]" />
            <p className="text-[13px] text-gray-500 font-medium">
              Loading inspection photos...
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Contractor Selected Photo */}
              <div className="border border-blue-200 bg-blue-50/20 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-bold text-[#136FB6] flex items-center gap-1.5">
                      <ImageIcon size={16} />
                      Contractor Field Photo
                    </span>
                    <Badge className="bg-blue-100 text-blue-800 text-[11px] font-bold">
                      Primary for Approval
                    </Badge>
                  </div>

                  {contractorPhoto?.image_url ? (
                    <div className="space-y-3">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black/5 border border-gray-200 group">
                        <img
                          src={contractorPhoto.image_url}
                          alt="Contractor selected"
                          className="w-full h-full object-cover"
                        />
                        <a
                          href={contractorPhoto.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>

                      <div className="bg-white border border-gray-100 rounded-xl p-3 text-[12px] space-y-1.5 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <UserIcon size={14} className="text-gray-400" />
                          <span>
                            Worker: <strong>{contractorPhoto.uploader?.name || "Employee"}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={14} className="text-gray-400" />
                          <span>
                            {contractorPhoto.timestamp
                              ? new Date(contractorPhoto.timestamp).toLocaleString()
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin size={14} className="text-gray-400" />
                          <span>
                            {contractorPhoto.latitude}, {contractorPhoto.longitude}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl border border-dashed border-gray-300 bg-white flex flex-col items-center justify-center p-6 text-center text-gray-400">
                      <AlertCircle size={32} className="text-gray-300 mb-2" />
                      <p className="text-[13px] font-semibold text-gray-600">
                        No Photo Selected Yet
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Contractor must review employee uploads and select a photo first.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: TPI Reference Photo */}
              <div className="border border-purple-200 bg-purple-50/20 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-bold text-purple-700 flex items-center gap-1.5">
                      <ShieldCheck size={16} />
                      TPI Inspector Photo
                    </span>
                    <Badge className="bg-purple-100 text-purple-800 text-[11px] font-bold">
                      Independent Reference
                    </Badge>
                  </div>

                  {tpiPhoto?.image_url ? (
                    <div className="space-y-3">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black/5 border border-gray-200 group">
                        <img
                          src={tpiPhoto.image_url}
                          alt="TPI inspector"
                          className="w-full h-full object-cover"
                        />
                        <a
                          href={tpiPhoto.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>

                      <div className="bg-white border border-gray-100 rounded-xl p-3 text-[12px] space-y-1.5 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <UserIcon size={14} className="text-gray-400" />
                          <span>
                            Inspector: <strong>{tpiPhoto.uploader?.name || "TPI Officer"}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={14} className="text-gray-400" />
                          <span>
                            {tpiPhoto.timestamp
                              ? new Date(tpiPhoto.timestamp).toLocaleString()
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin size={14} className="text-gray-400" />
                          <span>
                            {tpiPhoto.latitude}, {tpiPhoto.longitude}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl border border-dashed border-gray-300 bg-white flex flex-col items-center justify-center p-6 text-center text-gray-400">
                      <ShieldCheck size={32} className="text-purple-300 mb-2" />
                      <p className="text-[13px] font-semibold text-gray-600">
                        TPI Photo Pending
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        TPI officer has not uploaded a reference photo yet (optional).
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {canApprove && component?.status !== "APPROVED" && (
              <div className="pt-2">
                <Input
                  placeholder="Optional approval remarks (e.g. Verified and approved on site)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="h-10 border-gray-200 text-[13px]"
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 text-[13px] font-semibold border-gray-200"
          >
            Close
          </Button>

          {canApprove && component?.status !== "APPROVED" && (
            <Button
              type="button"
              disabled={isApproving || !contractorPhoto}
              onClick={handleApprove}
              className="h-10 text-[13px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
            >
              {isApproving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Approve Component
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
