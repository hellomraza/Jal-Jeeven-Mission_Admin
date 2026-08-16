"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import CreateTPIDialog from "./CreateTPIDialog";

export default function CreateTPIButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-[#136FB6] hover:bg-[#0f5a94] text-white flex items-center gap-2 text-[13px] font-semibold h-10 px-4 rounded-lg shadow-sm transition-colors"
      >
        <Plus size={18} />
        Create TPI Officer
      </Button>

      <CreateTPIDialog isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
