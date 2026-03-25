"use client";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/hooks/useUser";
import { getWorkItems } from "@/services/workService";
import { UserRole } from "@/types/usertypes";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, RefreshCw, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function WorkOrderPage() {
  const router = useRouter();
  const { data: userInfo } = useUser();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["workItems"],
    queryFn: () => getWorkItems(1, 100),
  });
  const [selectedDistrict, setSelectedDistrict] = React.useState<string | null>(
    null,
  );

  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setRole(localStorage.getItem("user_role"));
    }
  }, []);

  const resetFilters = () => {
    setSelectedDistrict(null);
  };

  const userRole = userInfo?.role || role;

  const workItems = data?.data;

  const filteredWorkItems = selectedDistrict
    ? workItems?.filter(
        (item) => item.district_id.toString() === selectedDistrict,
      )
    : workItems;

  let availableDistricts: {
    value: number;
    label: string;
  }[] = [];

  if (userRole === UserRole.HeadOfficer) {
    const districtsSet = new Set<string>();
    workItems?.forEach((item) => {
      if (item.district) {
        districtsSet.add(
          JSON.stringify({
            value: item.district_id,
            label: item.district.districtname,
          }),
        );
      }
    });
    availableDistricts = Array.from(districtsSet).map((str) => JSON.parse(str));
  }

  const handleExport = () => {
    if (!filteredWorkItems) return;
    const ws = XLSX.utils.json_to_sheet(filteredWorkItems);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Work_Orders");
    XLSX.writeFile(wb, "WorkOrders.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <h2 className="text-[16px] font-bold text-[#1a2b3c] whitespace-nowrap px-2">
            Work Code Details
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {userRole === UserRole.HeadOfficer && (
            <>
              <Select
                key={selectedDistrict}
                value={selectedDistrict || undefined}
                onValueChange={setSelectedDistrict}
              >
                <SelectTrigger className="w-40 bg-[#F9FAFB] border-gray-100 text-[12px] h-9">
                  <SelectValue placeholder="District Name" />
                </SelectTrigger>
                <SelectContent>
                  {availableDistricts.length > 0 ? (
                    availableDistricts.map((district) => (
                      <SelectItem
                        key={district.value}
                        value={district.value.toString()}
                      >
                        {district.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="all">No Districts Available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button onClick={resetFilters}>Reset Filters</Button>
            </>
          )}
          {userRole === UserRole.DistrictOfficer && (
            <Button
              onClick={() => router.push("/work-order/create")}
              className="bg-[#136FB6] hover:bg-[#105E9A] text-white h-9 px-4 rounded-lg text-[12px] font-medium shadow-md shadow-[#136FB6]/20"
            >
              <Plus size={14} className="mr-1" />
              Create Work Item
            </Button>
          )}
        </div>
      </div>

      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] py-0 overflow-hidden bg-white rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#DFEEF9] hover:bg-[#DFEEF9] border-none">
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    S No.
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Title
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Work Code
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    District Name
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 bg-[#DFEEF9] opacity-80">
                    Block Name
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 bg-[#DFEEF9] opacity-80">
                    Panchayat Name
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 bg-[#DFEEF9] opacity-80">
                    Village Name
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 bg-[#DFEEF9] opacity-80">
                    Scheme Type
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 bg-[#DFEEF9] opacity-80">
                    No FHTC
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 bg-[#DFEEF9] opacity-80">
                    A Amount (In Lakh)
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Progress (%)
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Status
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Description
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Contractor Code
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Latitude
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Longitude
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={17} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#136FB6]" />
                      <p className="mt-2 text-[12px] text-gray-500 font-medium">
                        Loading work items...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={17} className="h-24 text-center">
                      <p className="text-[12px] text-red-500 font-medium">
                        Failed to load work items.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        className="mt-2 h-8 text-[11px]"
                      >
                        <RefreshCw className="mr-2 h-3 w-3" /> Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : filteredWorkItems?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={17} className="h-24 text-center">
                      <p className="text-[12px] text-gray-500 font-medium">
                        No work items found.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWorkItems?.map((row, index: number) => (
                    <TableRow
                      key={row.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                      onClick={() =>
                        router.push(`/work-order/update/${row.id}`)
                      }
                    >
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium bg-[#DFEEF9]/50">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium bg-[#DFEEF9]/50">
                        {row.title || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium bg-[#DFEEF9]/50">
                        {row.work_code || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium bg-[#DFEEF9]/50">
                        {row.district?.districtname || row.district_id || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.block?.blockname || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.panchayat?.panchayatname || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.village?.villagename || "---"}
                      </TableCell>

                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.schemetype || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.nofhtc || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.amount_approved || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-[10px] font-bold">
                          {row.progress_percentage || "0"}%
                        </span>
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            row.status === "COMPLETED"
                              ? "bg-green-50 text-green-700"
                              : row.status === "IN_PROGRESS"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {row.status || "PENDING"}
                        </span>
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium min-w-37.5 max-w-sm truncate">
                        {row.description || "---"} Lorem ipsum dolor sit amet
                        consectetur adipisicing elit. Debitis molestiae
                        obcaecati eum tempore at! Obcaecati architecto, ipsum
                        enim ullam a sapiente blanditiis asperiores itaque eius
                        nulla nesciunt ipsa aliquid cum impedit sed natus harum
                        quasi deleniti doloribus magni saepe laborum dolore
                        quidem. Libero, ducimus iure. Quae accusamus aspernatur
                        id a dolore ipsam aliquam sapiente autem qui tempore
                        rerum et dignissimos rem perspiciatis omnis corporis
                        mollitia maxime, at hic pariatur sed officiis
                        cupiditate? Corrupti modi beatae, necessitatibus quaerat
                        dolore quasi, blanditiis minima fugit a qui quod ex
                        eaque id, soluta optio! Illo laborum accusamus maiores,
                        repudiandae corporis vitae quam dicta quaerat ratione!
                        Architecto quo quae nemo modi eos, suscipit dolorem aut
                        fuga repudiandae consectetur adipisci culpa repellat
                        facilis ex ea tempora sunt dolores eligendi nihil
                        accusantium, maxime placeat ipsa hic. Voluptatum iusto
                        sequi eligendi nam iure illum aspernatur distinctio ut
                        rem quod sint, quae unde deleniti corporis aut ea
                        dolores, ratione eveniet. Facilis amet placeat maxime
                        sapiente nesciunt odit atque dolorum, officiis natus sit
                        corporis ipsum rerum itaque libero nobis, eaque ducimus
                        reprehenderit minima. Sapiente culpa odit, nihil,
                        repudiandae rerum quo nobis debitis nulla vel pariatur
                        deserunt nostrum beatae quisquam sit laboriosam aliquam.
                        Quo recusandae corporis autem consectetur, nostrum
                        repellat asperiores tenetur ullam expedita molestias
                        eaque laboriosam doloremque. Ab aut iste, omnis quasi
                        fugiat reprehenderit! Minima neque voluptatem animi
                        ipsam sequi asperiores fugiat veritatis quas. Vitae vel
                        modi doloremque facilis possimus velit quisquam
                        molestiae adipisci quos non eveniet veritatis fugiat
                        nesciunt libero iure, repudiandae impedit sequi nobis.
                        Distinctio enim laborum ipsa facere ratione qui, autem
                        vel! Est molestias sint excepturi expedita rem obcaecati
                        esse asperiores velit amet harum dicta, architecto illum
                        sed rerum tenetur necessitatibus laboriosam praesentium
                        neque ex eum nostrum eos. Excepturi distinctio, rerum
                        fugiat qui ut sed quam fugit reiciendis dignissimos
                        animi. Perspiciatis iusto magnam, itaque voluptates
                        nulla ipsa quis, nisi nam pariatur, fuga id architecto
                        debitis dignissimos animi nostrum eum incidunt. Aperiam
                        molestias officiis ut doloribus quod itaque rerum!
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.contractor?.code || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.latitude || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.longitude || "---"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleExport}
          className="bg-[#DFEEF9] hover:bg-[#D0E5F5] text-[#1a2b3c] font-bold text-[12px] h-10 px-6 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Upload size={14} className="stroke-[2.5]" />
          Export
        </Button>
      </div>
    </div>
  );
}
