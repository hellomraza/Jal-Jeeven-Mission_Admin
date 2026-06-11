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
import * as React from "react";

import AgreementFileDialog from "@/components/AgreementFileDialog";

type Props = {
  fileUrl?: string | null;
  fileName?: string | null;
  children?: React.ReactNode;
  agreementId?: string;
  file?: {
    file_url: string;
    file_name: string;
    mime_type: string;
  } | null;
  showEdit?: boolean;
};

export default function AgreementFileViewerModal({
  fileUrl,
  fileName,
  children,
  agreementId,
  file,
  showEdit = false,
}: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? <DialogTrigger>{children}</DialogTrigger> : null}
      <DialogContent className="max-w-4xl w-[min(96vw,1200px)]">
        <DialogHeader>
          <DialogTitle>{fileName ?? "Agreement file"}</DialogTitle>
          <DialogDescription>
            Preview and download attached agreement PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {fileUrl ? (
            <iframe
              src={fileUrl}
              width="100%"
              height={340}
              className="border-none rounded-lg"
            >
              <p>
                PDF preview not available. You can{" "}
                <a href={fileUrl} target="_blank" rel="noreferrer">
                  open the file in a new tab
                </a>
                .
              </p>
            </iframe>
          ) : (
            <div className="min-h-48 flex items-center justify-center text-sm text-muted-foreground">
              Preview not available, use Download
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex gap-2">
            {showEdit && agreementId && (
              <AgreementFileDialog
                agreementId={agreementId}
                mode="edit"
                currentFile={
                  file
                    ? {
                      fileUrl: file.file_url,
                      fileName: file.file_name,
                      mimeType: file.mime_type,
                    }
                    : null
                }
                onAttachSuccess={() => setOpen(false)}
              >
                <Button size="sm">Edit File</Button>
              </AgreementFileDialog>
            )}
            {fileUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={fileUrl} target="_blank" rel="noreferrer" download>
                  Download
                </a>
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
