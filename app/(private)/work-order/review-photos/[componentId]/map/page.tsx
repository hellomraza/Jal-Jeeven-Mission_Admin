"use client";

import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MarkerClusterGroup from "react-leaflet-cluster";

// Dynamic imports for Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface PhotoData {
  id: string;
  latitude: string | number;
  longitude: string | number;
  [key: string]: any;
}

async function fetchPhotos(componentId: string) {
  const response = await apiClient.get<PaginatedResponse<PhotoData>>(
    `/photos/component/${componentId}/review`,
  );
  const photosData = response.data;
  const photos = photosData?.data || [];
  return photos;
}

export default function PhotoMapPage() {
  const params = useParams();
  const router = useRouter();
  const componentId = params.componentId as string;
  const [L, setL] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    20.5937, 78.9629,
  ]); // India center

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  const {
    data: photos = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["photos", componentId],
    queryFn: () => fetchPhotos(componentId),
    enabled: !!componentId,
  });

  // Filter photos with valid coordinates and calculate map center
  const photosWithCoordinates = photos.filter((photo: PhotoData) => {
    const lat = parseFloat(photo.latitude as string);
    const lng = parseFloat(photo.longitude as string);
    return !isNaN(lat) && !isNaN(lng);
  });

  useEffect(() => {
    if (photosWithCoordinates.length > 0) {
      const latitudes = photosWithCoordinates.map((p) =>
        parseFloat(p.latitude as string),
      );
      const longitudes = photosWithCoordinates.map((p) =>
        parseFloat(p.longitude as string),
      );

      const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
      const avgLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;

      setMapCenter([avgLat, avgLng]);
    }
  }, [photosWithCoordinates]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-16 w-16 animate-spin text-[#136FB6]" />
        <p className="mt-4 text-gray-500 font-medium">Loading photos map...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-white rounded-[20px]">
        <MapPin className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-[14px] mb-6">
          Failed to load photo locations.
        </p>
        <Button
          onClick={() => router.back()}
          className="bg-black hover:bg-zinc-800 h-12 px-8 rounded-2xl font-bold"
        >
          <ArrowLeft className="mr-2" size={18} /> Go Back
        </Button>
      </div>
    );
  }

  if (photosWithCoordinates.length === 0) {
    return (
      <div className="space-y-6 max-w-300 mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-[20px] font-extrabold text-[#1a2b3c] tracking-tight">
                Photo Locations Map
              </h1>
              <p className="text-[12px] text-gray-500 font-medium">
                Component ID: {componentId}
              </p>
            </div>
          </div>
        </div>

        <div className="p-20 text-center bg-white rounded-[20px] shadow-sm">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-[14px] mb-6">
            No photos with location data found for this component.
          </p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="rounded-2xl"
          >
            Back to Photos
          </Button>
        </div>
      </div>
    );
  }

  // Create custom marker icon
  const blueIcon = L
    ? new L.Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
    : null;

  return (
    <div className="space-y-6 max-w-350 mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-[20px] font-extrabold text-[#1a2b3c] tracking-tight">
              Photo Locations Map
            </h1>
            <p className="text-[12px] text-gray-500 font-medium">
              Showing {photosWithCoordinates.length} photo location
              {photosWithCoordinates.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[20px] shadow-sm overflow-hidden border border-gray-100">
        {L && (
          <MapContainer
            center={mapCenter}
            zoom={13}
            maxZoom={30}
            scrollWheelZoom={true}
            style={{ height: "600px", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarkerClusterGroup chunkedLoading>
              {photosWithCoordinates.map((photo: PhotoData) => {
                const lat = parseFloat(photo.latitude as string);
                const lng = parseFloat(photo.longitude as string);

                return (
                  <Marker key={photo.id} position={[lat, lng]} icon={blueIcon}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900 mb-1">
                          Photo {photosWithCoordinates.indexOf(photo) + 1}
                        </p>
                        <p className="text-xs text-gray-600">
                          {lat.toFixed(6)}, {lng.toFixed(6)}
                        </p>
                        {photo.created_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(photo.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          </MapContainer>
        )}
      </div>

      <div className="bg-white rounded-[20px] shadow-sm p-6 border border-gray-100">
        <h2 className="text-[16px] font-bold text-[#1a2b3c] mb-4">
          Photo Locations ({photosWithCoordinates.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
          {photosWithCoordinates.map((photo: PhotoData, index: number) => (
            <div
              key={photo.id}
              className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-2">
                <div className="shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-gray-900 truncate">
                    Photo {index + 1}
                  </p>
                  <p className="text-[11px] text-gray-600 font-mono">
                    {parseFloat(photo.latitude as string).toFixed(6)}
                  </p>
                  <p className="text-[11px] text-gray-600 font-mono">
                    {parseFloat(photo.longitude as string).toFixed(6)}
                  </p>
                  {photo.created_at && (
                    <p className="text-[10px] text-gray-500 mt-1">
                      {new Date(photo.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
