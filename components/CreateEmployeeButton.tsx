"use client";

import CreateEmployeeDialog from "@/components/CreateEmployeeDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function CreateEmployeeButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-[#136FB6] hover:bg-[#0d5a8f] text-white text-[13px] font-bold"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Employee
      </Button>

      <CreateEmployeeDialog isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
