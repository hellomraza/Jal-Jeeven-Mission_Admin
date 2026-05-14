"use client";

import {
  attachAgreementFile,
  uploadAgreementPdfAction,
} from "@/actions/agreementAction";
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
import { useToast } from "@/hooks/use-toast";
import * as React from "react";
import { useActionState } from "react";

type AgreementFile = {
  fileUrl?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  uploadedAt?: string | null;
};

type Props = {
  agreementId: string;
  mode?: "add" | "edit";
  currentFile?: AgreementFile | null;
  children?: React.ReactNode;
};

export default function AgreementFileDialog({
  agreementId,
  mode = "add",
  currentFile = null,
  children,
}: Props) {
  const { toast } = useToast();
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [uploadState, uploadAction, uploadPending] = useActionState(
    uploadAgreementPdfAction,
    { success: "", error: "", uploadedFile: null },
  );
  const [error, setError] = React.useState<string | null>(null);
  const [attaching, setAttaching] = React.useState(false);
  const [attached, setAttached] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const uploadResult = uploadState.uploadedFile;

  React.useEffect(() => {
    if (uploadState.error) {
      setError(uploadState.error);
      toast({
        title: "Upload failed",
        description: uploadState.error,
        variant: "destructive",
      });
    }
  }, [toast, uploadState.error]);

  React.useEffect(() => {
    if (uploadState.success) {
      setError(null);
      setAttached(false);
    }
  }, [uploadState.success]);

  React.useEffect(() => {
    if (uploadState.success) {
      setError(null);
      setAttached(false);
      toast({
        title: uploadState.success,
        description: "The PDF is ready to attach.",
      });
    }
  }, [toast, uploadState.success]);

  async function handleAttach() {
    if (!uploadResult?.fileUrl) {
      setError("No uploaded file to attach");
      return;
    }

    setError(null);
    setAttaching(true);
    try {
      const payload = {
        fileUrl: uploadResult.fileUrl,
        fileName: uploadResult.fileName || file?.name,
        mimeType: uploadResult.mimeType || "application/pdf",
        fileSize: uploadResult.fileSize || file?.size,
      };

      const attachedResponse = await attachAgreementFile(agreementId, payload);
      setAttached(true);
      toast({
        title: "File attached successfully",
        description: "The agreement row will refresh with the new file.",
      });
      // close dialog after successful attach
      setOpen(false);
    } catch (err: any) {
      const message = err?.message || "Failed to attach file";
      setError(message);
      toast({
        title: "Attach failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setAttaching(false);
    }
  }

  const resetDialogState = () => {
    setFile(null);
    setError(null);
    setAttaching(false);
    setAttached(false);
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch (err) {
        console.error(err);
      }
    }
    setPreviewUrl(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          resetDialogState();
        }
      }}
    >
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm">
            {mode === "edit" ? "Edit File" : "Add File"}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Agreement File" : "Add Agreement File"}
          </DialogTitle>
          <DialogDescription>
            Upload a single PDF and attach it to this agreement.
          </DialogDescription>
        </DialogHeader>

        <form
          id="agreement-upload-form"
          action={uploadAction}
          className="contents"
        >
          <input type="hidden" name="agreementId" value={agreementId} />

          <div className="mt-4 flex flex-col gap-5">
            {currentFile?.fileUrl && (
              <section className="rounded-lg border bg-muted/30 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Current File</p>
                    <p className="text-xs text-muted-foreground">
                      Existing attached PDF
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={currentFile.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View File
                    </a>
                  </Button>
                </div>
                <object
                  data={currentFile.fileUrl}
                  type="application/pdf"
                  width="100%"
                  height={220}
                >
                  <p className="text-sm text-muted-foreground">
                    Preview not available, use Download
                  </p>
                </object>
                <div className="mt-3 text-sm text-muted-foreground">
                  {currentFile.fileName || "Unnamed file"}
                  {currentFile.fileSize
                    ? ` · ${(currentFile.fileSize / 1024).toFixed(1)} KB`
                    : ""}
                </div>
              </section>
            )}

            <section className="rounded-lg border p-4">
              <div className="mb-3">
                <p className="text-sm font-semibold">New Upload</p>
                <p className="text-xs text-muted-foreground">
                  Select a PDF to upload to Cloudinary
                </p>
              </div>

              <input
                name="file"
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] ?? null;
                  setError(null);
                  setAttached(false);
                  if (selectedFile && selectedFile.type !== "application/pdf") {
                    const message = "Only PDF files are allowed";
                    setFile(null);
                    setPreviewUrl((prev) => {
                      try {
                        if (prev) URL.revokeObjectURL(prev);
                      } catch (err) {}
                      return null;
                    });
                    setError(message);
                    toast({
                      title: "Invalid file",
                      description: message,
                      variant: "destructive",
                    });
                    return;
                  }
                  if (selectedFile && selectedFile.size > 15 * 1024 * 1024) {
                    const message = "PDF must be 15 MB or smaller";
                    setFile(null);
                    setPreviewUrl((prev) => {
                      try {
                        if (prev) URL.revokeObjectURL(prev);
                      } catch (err) {}
                      return null;
                    });
                    setError(message);
                    toast({
                      title: "File too large",
                      description: message,
                      variant: "destructive",
                    });
                    return;
                  }

                  // revoke previous preview if any and create new preview
                  setPreviewUrl((prev) => {
                    try {
                      if (prev) URL.revokeObjectURL(prev);
                    } catch (err) {}
                    return selectedFile
                      ? URL.createObjectURL(selectedFile)
                      : null;
                  });
                  setFile(selectedFile);
                }}
              />

              {previewUrl && !uploadResult?.fileUrl && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium">Selected File Preview</p>
                  <object
                    data={previewUrl}
                    type="application/pdf"
                    width="100%"
                    height={260}
                  >
                    <p className="text-sm text-muted-foreground">
                      Preview not available, use Download
                    </p>
                  </object>
                  <div className="text-sm text-muted-foreground">
                    {file?.name}
                    {file?.size ? ` · ${(file.size / 1024).toFixed(1)} KB` : ""}
                  </div>
                </div>
              )}

              {uploadPending && (
                <div className="mt-3 text-sm text-muted-foreground">
                  Uploading to Cloudinary...
                </div>
              )}

              {uploadResult?.fileUrl && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-emerald-700">
                    Uploaded to Cloudinary
                  </p>
                  <object
                    data={uploadResult.fileUrl}
                    type="application/pdf"
                    width="100%"
                    height={260}
                  >
                    <p className="text-sm text-muted-foreground">
                      Preview not available, use Download
                    </p>
                  </object>
                  <div className="text-sm text-muted-foreground">
                    {uploadResult.fileName || file?.name || "PDF"}
                    {uploadResult.fileSize
                      ? ` · ${(uploadResult.fileSize / 1024).toFixed(1)} KB`
                      : ""}
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-3 text-sm text-destructive">{error}</div>
              )}
            </section>

            {attached && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                File attached successfully
              </div>
            )}
          </div>
        </form>

        <DialogFooter>
          <div className="flex gap-2">
            {!uploadResult?.fileUrl && (
              <Button
                form="agreement-upload-form"
                variant="outline"
                size="sm"
                type="submit"
                disabled={!file || uploadPending}
              >
                {uploadPending ? "Uploading..." : "Upload PDF"}
              </Button>
            )}
            {uploadResult?.fileUrl && (
              <Button size="sm" onClick={handleAttach} disabled={attaching}>
                {attaching ? "Attaching..." : "Attach File"}
              </Button>
            )}
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
