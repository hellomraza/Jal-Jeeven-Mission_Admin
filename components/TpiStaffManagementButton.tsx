"use client";

import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";
import Link from "next/link";

interface TpiStaffManagementButtonProps {
  workItemId: string;
}

export default function TpiStaffManagementButton({
  workItemId,
}: TpiStaffManagementButtonProps) {
  return (
    <Link href={`/work-order/update/${workItemId}/staff`}>
      <Button
        variant="outline"
        className="border-gray-200 text-[13px] font-bold text-[#1a2b3c] hover:bg-gray-50 flex items-center gap-2"
      >
        <UserCheck className="h-4 w-4 text-[#136FB6]" />
        Staff
      </Button>
    </Link>
  );
}
