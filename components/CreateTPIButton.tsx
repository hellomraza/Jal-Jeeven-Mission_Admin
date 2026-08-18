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
        className="bg-[#1a2b3c] hover:bg-[#1a2b3c]/90 text-white font-bold text-[12px] h-10 px-6 rounded-lg flex items-center gap-2 shadow-sm"
      >
        <Plus size={16} className="stroke-[2.5]" />
        Create TPI Agency
      </Button>
      <CreateTPIDialog isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
