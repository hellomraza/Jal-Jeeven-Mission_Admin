"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  deselectTpiReferencePhoto,
  selectTpiReferencePhoto,
  TpiReferencePhoto,
} from "@/services/tpiPhotoService";
import { UserRole } from "@/types/usertypes";
import {
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  MapPinned,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface TpiReferencePhotoReviewProps {
  tpiPhotos: TpiReferencePhoto[];
  selectedPhotoId?: string | null;
  userRole?: string;
  componentId?: string;
}

export default function TpiReferencePhotoReview({
  tpiPhotos = [],
  selectedPhotoId,
  userRole,
  componentId,
}: TpiReferencePhotoReviewProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loadingPhotoId, setLoadingPhotoId] = useState<string | null>(null);

  const isTpiUser = userRole === UserRole.TPI || userRole === "TPI";
  const isDO = userRole === UserRole.DistrictOfficer || userRole === "DO";

  // HO should never see TPI photos (redacted)
  if (userRole === UserRole.HeadOfficer || userRole === "HO") {
    return null;
  }

  // DO should ONLY see the TPI selected photo; TPI sees all uploaded photos to manage/select
  const displayedPhotos = isDO
    ? tpiPhotos.filter(
        (photo) => selectedPhotoId === photo.id || photo.status === "SELECTED",
      )
    : tpiPhotos;

  const handleSelect = async (photoId: string) => {
    try {
      setLoadingPhotoId(photoId);
      await selectTpiReferencePhoto(photoId);
      toast({
        title: "Reference Photo Selected",
        description: "This photo is now set as the active reference for quality inspection.",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Selection Failed",
        description: error.message || "Failed to select reference photo.",
      });
    } finally {
      setLoadingPhotoId(null);
    }
  };

  const handleDeselect = async (photoId: string) => {
    try {
      setLoadingPhotoId(photoId);
      await deselectTpiReferencePhoto(photoId);
      toast({
        title: "Reference Photo Deselected",
        description: "Reference photo selection removed.",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deselection Failed",
        description: error.message || "Failed to deselect reference photo.",
      });
    } finally {
      setLoadingPhotoId(null);
    }
  };

  return (
    <div className="space-y-4 pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-[16px] font-extrabold text-[#1a2b3c]">
              TPI Agency Reference Evidence
            </h2>
            <p className="text-[12px] text-gray-500 font-medium">
              {isTpiUser
                ? "Manage and select your agency's verified reference photo for this component"
                : "Official reference photo uploaded by Third-Party Inspector (Read-only reference for DAO)"}
            </p>
          </div>
        </div>
      </div>

      {displayedPhotos.length === 0 ? (
        <Card className="border border-dashed border-gray-200 bg-gray-50/50 rounded-2xl">
          <CardContent className="p-8 text-center">
            <ImageIcon size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-[13px] font-bold text-gray-600">
              {isDO
                ? "No TPI reference photo selected yet"
                : "No TPI reference photos uploaded yet"}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isDO
                ? "The assigned TPI agency has not yet selected an active baseline reference photo for this component."
                : "TPI field staff upload baseline photos via the mobile app."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPhotos.map((photo) => {
            const isSelected = selectedPhotoId === photo.id || photo.status === "SELECTED";
            const isLoading = loadingPhotoId === photo.id;

            return (
              <Card
                key={photo.id}
                className={`overflow-hidden border transition-all rounded-2xl bg-white shadow-xs ${
                  isSelected
                    ? "border-purple-300 ring-2 ring-purple-100"
                    : "border-gray-100"
                }`}
              >
                <div className="relative aspect-4/3 w-full bg-gray-100">
                  {photo.image_url ? (
                    <Image
                      src={photo.image_url}
                      alt="TPI Reference Photo"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <ImageIcon size={32} />
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-600 text-white shadow-sm">
                        <CheckCircle2 size={12} /> Active Reference
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white/90 backdrop-blur text-gray-700 shadow-sm">
                        Uploaded
                      </span>
                    )}
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1 text-[11px] text-gray-500">
                    <p>
                      <span className="font-semibold text-gray-700">Uploaded by:</span>{" "}
                      {photo.employee?.name || "TPI Staff"}
                    </p>
                    {photo.timestamp && (
                      <p>
                        <span className="font-semibold text-gray-700">Captured:</span>{" "}
                        {new Date(photo.timestamp).toLocaleString()}
                      </p>
                    )}
                    {photo.latitude && photo.longitude && (
                      <p className="font-mono text-[10px] text-gray-400">
                        GPS: {photo.latitude.toFixed(5)}, {photo.longitude.toFixed(5)}
                      </p>
                    )}
                  </div>

                  {/* View Location Button (Always present for every photo) */}
                  {componentId && (
                    <Link
                      href={`/work-order/review-photos/${componentId}/location/${photo.id}`}
                      className="block w-full"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-9 rounded-lg text-[12px] font-bold border-[#136FB6]/20 text-[#136FB6] hover:bg-[#DFEEF9] hover:text-[#105E9A]"
                      >
                        <MapPinned size={15} className="mr-1.5" />
                        View Location
                      </Button>
                    </Link>
                  )}

                  {/* TPI Agency Selection Buttons */}
                  {isTpiUser && (
                    <div className="pt-2 border-t border-gray-50">
                      {isSelected ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full h-8 text-[11px] font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                          disabled={isLoading}
                          onClick={() => handleDeselect(photo.id)}
                        >
                          {isLoading ? (
                            <Loader2 size={13} className="animate-spin mr-1" />
                          ) : (
                            <XCircle size={13} className="mr-1" />
                          )}
                          Deselect Reference
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full h-8 text-[11px] font-bold bg-purple-600 hover:bg-purple-700 text-white"
                          disabled={isLoading}
                          onClick={() => handleSelect(photo.id)}
                        >
                          {isLoading ? (
                            <Loader2 size={13} className="animate-spin mr-1" />
                          ) : (
                            <CheckCircle2 size={13} className="mr-1" />
                          )}
                          Select as Reference
                        </Button>
                      )}
                    </div>
                  )}

                  {/* DO View Note: strictly read-only reference */}
                  {isDO && (
                    <div className="pt-1 border-t border-gray-50 text-center">
                      <p className="text-[11px] font-medium text-gray-400 italic">
                        Reference evidence (Read-only)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
