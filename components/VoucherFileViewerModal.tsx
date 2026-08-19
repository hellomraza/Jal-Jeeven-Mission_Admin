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
import { Download, ExternalLink } from "lucide-react";
import * as React from "react";

type Props = {
  fileUrl?: string | null;
  fileName?: string | null;
  voucherNumber?: string | null;
  children?: React.ReactNode;
};

export default function VoucherFileViewerModal({
  fileUrl,
  fileName,
  voucherNumber,
  children,
}: Props) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="text-xs">
            View PDF
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl w-[min(96vw,1200px)]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#1a2b3c]">
            {voucherNumber ? `Voucher: ${voucherNumber}` : (fileName ?? "Voucher PDF Document")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Preview, download, or open the attached voucher PDF document.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
          {fileUrl ? (
            <object
              data={fileUrl}
              type="application/pdf"
              width="100%"
              height={580}
              className="rounded-lg shadow-inner"
            >
              <div className="p-8 text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Inline PDF preview is not supported directly in this browser frame.
                </p>
                <Button asChild size="sm" className="bg-[#136FB6] text-white">
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} className="mr-1.5" />
                    Open PDF in New Window
                  </a>
                </Button>
              </div>
            </object>
          ) : (
            <div className="min-h-48 flex items-center justify-center text-sm text-muted-foreground">
              No PDF file available to preview
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex sm:justify-between items-center gap-2">
          <div className="text-xs text-gray-400 truncate max-w-sm">
            {fileName || (fileUrl ? fileUrl.split("/").pop() : "")}
          </div>
          <div className="flex gap-2">
            {fileUrl && (
              <>
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <ExternalLink size={13} />
                    Open Tab
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-1"
                  >
                    <Download size={13} />
                    Download
                  </a>
                </Button>
              </>
            )}
            <DialogClose asChild>
              <Button variant="secondary" size="sm" className="text-xs">
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
