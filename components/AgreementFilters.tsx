"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AgreementFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentYear = searchParams.get("agreementyear") || "all";

  const [search, setSearch] = useState(currentSearch);

  // Sync state with URL if URL changes
  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  // Debounced search input
  useEffect(() => {
    if (search === currentSearch) return;

    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
      params.set("page", "1"); // reset to page 1 on search
      router.push(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(handler);
  }, [search, currentSearch, router, pathname, searchParams]);

  const handleYearChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val && val !== "all") {
      params.set("agreementyear", val);
    } else {
      params.delete("agreementyear");
    }
    params.set("page", "1"); // reset to page 1 on filter
    router.push(`${pathname}?${params.toString()}`);
  };

  const years = [
    { label: "All Years", value: "all" },
    { label: "2020-2021", value: "2020-2021" },
    { label: "2021-2022", value: "2021-2022" },
    { label: "2022-2023", value: "2022-2023" },
    { label: "2023-2024", value: "2023-2024" },
    { label: "2024-2025", value: "2024-2025" },
    { label: "2025-2026", value: "2025-2026" },
    { label: "2026-2027", value: "2026-2027" },
    { label: "2027-2028", value: "2027-2028" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
      <Input
        type="text"
        placeholder="Search Agreement No..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:w-[220px] h-10 text-[12px] bg-[#F9FAFB] border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-[#136FB6]/30 focus:border-[#136FB6]/30 transition-colors"
      />
      <Select value={currentYear} onValueChange={handleYearChange}>
        <SelectTrigger className="w-full sm:w-[160px] h-10 text-[12px] bg-[#F9FAFB] border-gray-200 rounded-lg">
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y.value} value={y.value} className="text-[12px]">
              {y.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
