import ApprovedPhotoViewer from "@/components/ApprovedPhotoViewer";
import BackButton from "@/components/BackButton";
import { createServerApiClient } from "@/lib/server-api-client";
import { MapPin, ShieldCheck } from "lucide-react";

function buildGoogleMapsUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

function buildGoogleMapsEmbedUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`;
}

export default async function ApprovedPhotoPage({
  params,
}: {
  params: Promise<{ componentId: string }>;
}) {
  const { componentId } = await params;
  const apiClient = await createServerApiClient();

  const response = await apiClient.get<PaginatedResponse<Photo>>(
    `/photos/component/${componentId}/review`,
  );

  const photos = response.data?.data || [];
  const approvedPhotoId = photos[0]?.workItemComponent?.approved_photo_id;
  const approvedPhoto = approvedPhotoId
    ? photos.find((photo) => photo.id === approvedPhotoId)
    : null;

  const canShowMap =
    !!approvedPhoto &&
    approvedPhoto.latitude !== null &&
    approvedPhoto.longitude !== null;

  if (!approvedPhoto) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-[20px] font-extrabold text-[#1a2b3c] tracking-tight">
                Approved Photo
              </h1>
              <p className="text-[12px] text-gray-500 font-medium">
                Component ID: {componentId}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-6 py-10 text-center text-amber-900 shadow-sm">
          <ShieldCheck className="mx-auto mb-3 h-12 w-12 text-amber-500" />
          <p className="text-[14px] font-semibold">
            This component does not have an approved photo yet.
          </p>
          <p className="mt-2 text-[12px] text-amber-700">
            The approved photo map becomes available only after the component is
            approved.
          </p>
        </div>
      </div>
    );
  }

  const latitude = Number(approvedPhoto.latitude);
  const longitude = Number(approvedPhoto.longitude);
  const mapEmbedUrl = canShowMap
    ? buildGoogleMapsEmbedUrl(latitude, longitude)
    : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/70 backdrop-blur-xl p-5 rounded-[28px] border border-white/50 shadow-sm">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-[20px] font-extrabold text-[#1a2b3c] tracking-tight">
              Approved Photo Map
            </h1>
            <p className="text-[12px] text-gray-500 font-medium">
              Showing the approved photo only for this component
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
          <ApprovedPhotoViewer
            imageUrl={approvedPhoto.image_url}
            alt="Approved component photo"
          />
          <div className="space-y-3 p-5">
            <div className="flex items-center gap-2 text-[#136FB6]">
              <ShieldCheck size={18} />
              <span className="text-[12px] font-bold uppercase tracking-widest">
                Approved Photo
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-wider">
                  Latitude
                </p>
                <p className="font-semibold text-[#1a2b3c]">
                  {latitude.toFixed(6)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-wider">
                  Longitude
                </p>
                <p className="font-semibold text-[#1a2b3c]">
                  {longitude.toFixed(6)}
                </p>
              </div>
            </div>
            {approvedPhoto.timestamp && (
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-wider text-[12px]">
                  Submitted At
                </p>
                <p className="font-semibold text-[#1a2b3c] text-[12px]">
                  {new Date(approvedPhoto.timestamp).toLocaleString("en-IN")}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-[16px] font-bold text-[#1a2b3c]">
                Approved Location
              </h2>
              <p className="text-[12px] text-gray-500">
                Marker pinned to the approved photo location
              </p>
            </div>
            <MapPin className="text-[#136FB6]" size={22} />
          </div>
          <div className="min-h-105 bg-slate-100">
            {mapEmbedUrl && (
              <iframe
                title="Approved photo map"
                src={mapEmbedUrl}
                className="h-full min-h-105 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
