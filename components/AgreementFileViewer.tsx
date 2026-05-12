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

type Props = {
  fileUrl?: string | null;
  fileName?: string | null;
  children?: React.ReactNode;
};

export default function AgreementFileViewer({
  fileUrl,
  fileName,
  children,
}: Props) {
  return (
    <Dialog>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="max-w-4xl w-[min(96vw,1200px)]">
        <DialogHeader>
          <DialogTitle>{fileName ?? "Agreement file"}</DialogTitle>
          <DialogDescription>
            Preview and download attached agreement PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {fileUrl ? (
            <object
              data={fileUrl}
              type="application/pdf"
              width="100%"
              height={640}
            >
              <p>
                PDF preview not available. You can{" "}
                <a href={fileUrl} target="_blank" rel="noreferrer">
                  open the file in a new tab
                </a>
                .
              </p>
            </object>
          ) : (
            <div className="min-h-48 flex items-center justify-center text-sm text-muted-foreground">
              No file attached for this agreement.
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex gap-2">
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
