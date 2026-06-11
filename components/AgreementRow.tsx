"use client";

import { useRouter } from "next/navigation";
import { TableRow } from "@/components/ui/table";
import React from "react";

type Props = {
  id: string;
  children: React.ReactNode;
};

export default function AgreementRow({ id, children }: Props) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    const target = e.target as HTMLElement;
    // Check if the click target is a button, link, interactive role, or marked as no-navigate
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("[role='button']") ||
      target.closest("[role='dialog']") ||
      target.closest(".no-navigate")
    ) {
      return;
    }
    router.push(`/agreement/details/${id}`);
  };

  return (
    <TableRow
      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
      onClick={handleClick}
    >
      {children}
    </TableRow>
  );
}
