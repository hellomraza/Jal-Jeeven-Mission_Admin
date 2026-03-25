"use client";

import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import Link from "next/link";

interface EmployeeManagementSheetProps {
  workItemId: string;
}

export default function EmployeeManagementSheet({
  workItemId,
}: EmployeeManagementSheetProps) {
  return (
    <Link href={`/work-order/update/${workItemId}/employees`}>
      <Button
        variant="outline"
        className="border-gray-200 text-[13px] font-bold text-[#1a2b3c] hover:bg-gray-50"
      >
        <Users className="mr-2 h-4 w-4" />
        Employees
      </Button>
    </Link>
  );
}
