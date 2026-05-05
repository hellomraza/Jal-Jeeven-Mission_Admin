"use client";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Expand } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type ApprovedPhotoViewerProps = {
  imageUrl: string;
  alt: string;
};

export default function ApprovedPhotoViewer({
  imageUrl,
  alt,
}: ApprovedPhotoViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative group">
        <div className="relative aspect-video bg-gray-100">
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 420px"
          />
        </div>
        <DialogTrigger asChild>
          <button
            type="button"
            className="absolute right-3 bottom-3 rounded-full bg-black/60 hover:bg-black/80 text-white p-2 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="View image in full screen"
          >
            <Expand size={16} />
          </button>
        </DialogTrigger>
      </div>

      <DialogContent
        showCloseButton
        className="max-w-[96vw] max-h-[92vh] bg-black/95 border-0 p-0 flex items-center justify-center"
      >
        <img
          src={imageUrl}
          alt={alt}
          className="max-h-[92vh] max-w-[96vw] object-contain"
        />
      </DialogContent>
    </Dialog>
  );
}
