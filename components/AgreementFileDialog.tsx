"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { attachAgreementFile } from "@/services/agreementService";
import * as React from "react";

type Props = {
  agreementId: string;
  children?: React.ReactNode;
  onAttached?: (data: any) => void;
};

export default function AgreementFileDialog({
  agreementId,
  children,
  onAttached,
}: Props) {
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadResult, setUploadResult] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [attaching, setAttaching] = React.useState(false);

  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
    process.env.CLOUDINARY_UPLOAD_PRESET;

  async function handleUpload() {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      // try signed upload: ask server for signature
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: `agreements/${agreementId}` }),
      });

      let url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
      const fd = new FormData();
      fd.append("file", file);

      if (signRes.ok) {
        const signJson = await signRes.json();
        if (signJson.signature && signJson.timestamp && signJson.apiKey) {
          // signed upload
          fd.append("api_key", signJson.apiKey);
          fd.append("timestamp", String(signJson.timestamp));
          fd.append("signature", signJson.signature);
          fd.append("folder", `agreements/${agreementId}`);
        } else if (uploadPreset) {
          // fallback to unsigned
          fd.append("upload_preset", uploadPreset);
        } else {
          throw new Error("No Cloudinary upload configuration available");
        }
      } else {
        // fallback to unsigned if preset available
        if (!uploadPreset) throw new Error("Cloudinary not configured");
        fd.append("upload_preset", uploadPreset);
      }

      const res = await fetch(url, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setUploadResult(data);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleAttach() {
    if (!uploadResult?.secure_url) {
      setError("No uploaded file to attach");
      return;
    }

    setError(null);
    setAttaching(true);
    try {
      const payload = {
        fileUrl: uploadResult.secure_url,
        fileName: uploadResult.original_filename || file?.name,
        mimeType:
          uploadResult.resource_type === "raw"
            ? "application/pdf"
            : uploadResult.format,
        fileSize: uploadResult.bytes,
      };

      const attached = await attachAgreementFile(agreementId, payload);
      if (onAttached) onAttached(attached);
      // keep dialog open so user sees success; consumer may close.
    } catch (err: any) {
      setError(err.message || "Failed to attach file");
    } finally {
      setAttaching(false);
    }
  }

  return (
    <Dialog>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm">Attach File</Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Attach Agreement File</DialogTitle>
          <DialogDescription>
            Upload a single PDF and attach it to this agreement.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-3">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          {file && (
            <div className="text-sm text-muted-foreground">
              Selected: {file.name} — {(file.size / 1024).toFixed(1)} KB
            </div>
          )}

          {uploadResult && (
            <div className="text-sm text-muted-foreground">
              Uploaded:{" "}
              <a
                href={uploadResult.secure_url}
                target="_blank"
                rel="noreferrer"
              >
                Open
              </a>
            </div>
          )}

          {error && <div className="text-sm text-destructive">{error}</div>}
        </div>

        <DialogFooter>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? "Uploading..." : "Upload to Cloudinary"}
            </Button>
            <Button
              size="sm"
              onClick={handleAttach}
              disabled={!uploadResult || attaching}
            >
              {attaching ? "Attaching..." : "Attach File"}
            </Button>
            <DialogClose asChild>
              <Button variant="secondary" size="sm">
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
