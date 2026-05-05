"use client";

import "leaflet/dist/leaflet.css";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamic imports for react-leaflet components (client only)
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
const MarkerClusterGroup = dynamic(
  () => import("react-leaflet-cluster").then((m) => m.default),
  { ssr: false },
);

type PhotoPoint = {
  id: string;
  latitude: number;
  longitude: number;
  created_at?: string | null;
  status?: "UPLOADED" | "SELECTED" | "APPROVED" | "REJECTED";
};

export default function PhotoMapClient({ photos }: { photos: PhotoPoint[] }) {
  const [L, setL] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    20.5937, 78.9629,
  ]);

  useEffect(() => {
    import("leaflet").then((leaflet) => setL(leaflet));
  }, []);

  useEffect(() => {
    if (!photos || photos.length === 0) return;
    const latitudes = photos.map((p) => p.latitude);
    const longitudes = photos.map((p) => p.longitude);
    const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
    const avgLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;
    setMapCenter([avgLat, avgLng]);
  }, [photos]);

  if (!L) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-16 w-16 animate-spin text-[#136FB6]" />
        <p className="mt-4 text-gray-500 font-medium">Loading map...</p>
      </div>
    );
  }

  const blueIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div>
      <div className="bg-white rounded-[20px] shadow-sm overflow-hidden border border-gray-100">
        <MapContainer
          center={mapCenter}
          zoom={13}
          maxZoom={50}
          scrollWheelZoom
          style={{ height: "600px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerClusterGroup chunkedLoading>
            {photos.map((photo) => (
              <Marker
                key={photo.id}
                position={[photo.latitude, photo.longitude]}
                icon={blueIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900 mb-1">Photo</p>
                    <p className="text-xs text-gray-600">
                      {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
                    </p>
                    {photo.created_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(photo.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
}
