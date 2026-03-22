"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getWorkItem } from "@/services/workService";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  MapPin,
  Navigation,
  Info,
  ExternalLink,
  Ruler,
} from "lucide-react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

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
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false },
);

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function MapContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  const {
    data: workItem,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["workItem", id],
    queryFn: () => getWorkItem(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-[#136FB6]" />
          <MapPin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-[#136FB6]" />
        </div>
        <p className="text-gray-500 font-bold mt-6 animate-pulse uppercase tracking-widest text-xs">
          Locating Project Site...
        </p>
      </div>
    );
  }

  if (isError || !workItem) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <div className="bg-red-50 p-6 rounded-3xl mb-6 shadow-sm">
          <MapPin size={48} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-3">
          Target Not Found
        </h2>
        <p className="text-gray-500 max-w-sm mb-8 font-medium">
          The requested work site coordinates are either missing or the record
          no longer exists.
        </p>
        <Button
          onClick={() => router.back()}
          className="bg-black hover:bg-zinc-800 h-12 px-8 rounded-2xl font-bold"
        >
          <ArrowLeft className="mr-2" size={18} /> Return to Dashboard
        </Button>
      </div>
    );
  }

  const workLat = parseFloat(workItem.latitude);
  const workLon = parseFloat(workItem.longitude);
  const hqLat = workLat + 0.02;
  const hqLon = workLon + 0.02;

  const distance = getDistance(hqLat, hqLon, workLat, workLon).toFixed(2);

  const greenIcon = L
    ? new L.Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
    : null;

  const redIcon = L
    ? new L.Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-2xl h-14 w-14 border-gray-100 hover:bg-[#136FB6] hover:text-white transition-all duration-300"
          >
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-[#1a2b3c] leading-tight">
              Project Navigation
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-[#136FB6]/10 text-[#136FB6] text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">
                Live Tracker
              </span>
              <p className="text-[12px] text-gray-400 font-bold tracking-tight">
                {workItem.work_code || "W-UNASSIGNED"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none bg-white p-2 rounded-2xl border border-gray-100 flex items-center gap-3">
            <div className="bg-[#DFEEF9] h-10 w-10 rounded-xl flex items-center justify-center text-[#136FB6]">
              <Ruler size={18} />
            </div>
            <div className="pr-4">
              <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">
                Transit Gap
              </p>
              <p className="text-[16px] font-black text-[#136FB6]">
                {distance} KM
              </p>
            </div>
          </div>
          <Button
            onClick={() =>
              window.open(
                `https://www.google.com/maps/dir/?api=1&origin=${hqLat},${hqLon}&destination=${workLat},${workLon}`,
                "_blank",
              )
            }
            className="flex-1 md:flex-none bg-[#136FB6] hover:bg-[#105E9A] text-white h-14 px-8 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#136FB6]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Navigation size={20} />
            Start Journey
          </Button>
        </div>
      </div>

      {/* Map Section */}
      <div className="relative group">
        <div className="h-[500px] rounded-[40px] overflow-hidden border-[12px] border-white shadow-2xl relative bg-slate-100 transition-transform duration-500 group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)]">
          {typeof window !== "undefined" && (
            <MapContainer
              center={[(workLat + hqLat) / 2, (workLon + hqLon) / 2]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              className="z-0"
              zoomControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />

              {greenIcon && (
                <Marker position={[hqLat, hqLon]} icon={greenIcon}>
                  <Popup className="custom-popup">
                    <b>Logistics Hub</b>
                    <br />
                    Primary Asset Deployment
                  </Popup>
                </Marker>
              )}
              {redIcon && (
                <Marker position={[workLat, workLon]} icon={redIcon}>
                  <Popup className="custom-popup">
                    <b>{workItem.title}</b>
                    <br />
                    Project Implementation Site
                  </Popup>
                </Marker>
              )}

              <Polyline
                positions={[
                  [hqLat, hqLon],
                  [workLat, workLon],
                ]}
                color="#ef4444"
                weight={6}
                opacity={0.4}
              />
              <Polyline
                positions={[
                  [hqLat, hqLon],
                  [workLat, workLon],
                ]}
                color="#136FB6"
                weight={3}
                dashArray="1, 12"
                dashOffset="0"
                opacity={1}
              />
            </MapContainer>
          )}

          <div className="absolute top-6 right-6 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-white/40 z-[400] hidden sm:block">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
              Map Legend
            </h4>
            <div className="space-y-3">
              <LegendItem color="bg-green-500" label="HQ Base" />
              <LegendItem color="bg-red-500" label="Target Site" />
              <div className="flex items-center gap-3">
                <div className="w-4 h-1 bg-[#136FB6] rounded-full" />
                <span className="text-[11px] font-extrabold text-[#1a2b3c]">
                  {distance} KM Path
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Connection Indicator - The 'Horizontal line connect' */}
        <div className="flex justify-center -mb-px">
          <div className="w-1 h-12 bg-gradient-to-b from-[#136FB6] to-transparent" />
        </div>

        <div className="bg-white rounded-[40px] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <MapPin size={120} />
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 bg-[#136FB6]/5 rounded-3xl flex items-center justify-center text-[#136FB6] shadow-inner shadow-[#136FB6]/5">
                <MapPin size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-[#1a2b3c] tracking-tighter">
                  Site Location
                </h2>
                <p className="text-gray-400 font-bold text-sm tracking-tight">
                  Geographic Address Details
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl">
              <ExternalLink size={16} className="text-gray-400" />
              <span className="text-[11px] font-black text-gray-800 uppercase">
                Address Registry
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
            <DataField
              label="Starting Point"
              value="Logistics Hub (District HQ)"
              highlight
            />
            <DataField
              label="Destination Site"
              value={workItem.title}
              highlight
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-3.5 h-3.5 rounded-full ${color} ring-4 ring-offset-2 ring-offset-white ${color === "bg-green-500" ? "ring-green-100" : "ring-red-100"}`}
      />
      <span className="text-[11px] font-extrabold text-[#1a2b3c]">{label}</span>
    </div>
  );
}

function DataField({
  label,
  value,
  highlight = false,
  isStatus = false,
}: {
  label: string;
  value: any;
  highlight?: boolean;
  isStatus?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
        {label}
      </span>
      {isStatus ? (
        <div className="mt-1">
          <span
            className={`px-4 py-1.5 rounded-xl text-[11px] font-black tracking-wide border ${
              value === "COMPLETED"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : value === "IN_PROGRESS"
                  ? "bg-amber-50 text-amber-700 border-amber-100"
                  : "bg-slate-50 text-slate-600 border-slate-100"
            }`}
          >
            {value || "PENDING"}
          </span>
        </div>
      ) : (
        <p
          className={`text-[17px] font-bold ${highlight ? "text-[#136FB6] font-black" : "text-[#1a2b3c]"} leading-snug`}
        >
          {value || "---"}
        </p>
      )}
    </div>
  );
}

export default function MapPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-[70vh]">
            <Loader2 className="h-12 w-12 animate-spin text-[#136FB6]" />
          </div>
        }
      >
        <MapContent />
      </Suspense>
    </DashboardLayout>
  );
}
