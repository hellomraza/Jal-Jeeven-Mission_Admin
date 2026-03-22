"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check } from "lucide-react";
import { useState } from "react";

// Initial data structure
const initialComponents = [
  "Supply & Installation Of Submersible Pump (In No.)",
  "2 Pumping Mains (In Mtr.)",
  "OHT (In No.)",
  "Chlorinator (In No.)",
  "Distribution Network (In Mtr.)",
  "FHTC (In No.)",
  "Electricity Charge For Power Connection (In No.)",
  "Boundary Wall (In Mtr.)",
  "Sump Well (In No.)",
  "Switch Room (In No.)",
  "Chlorinator Room (In No.)",
  "Survey And DPR",
].map((name, id) => ({
  id,
  name,
  quantity: "",
  remark: "",
  saved: id === 0, // Simulate the first one being saved initially based on the image
}));

export default function UpdatePage() {
  const [components, setComponents] = useState(initialComponents);

  const handleInputChange = (
    id: number,
    field: "quantity" | "remark",
    value: string,
  ) => {
    setComponents((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, [field]: value } : comp)),
    );
  };

  const handleSave = (id: number) => {
    setComponents((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, saved: true } : comp)),
    );
    // In a real application, you'd trigger an API call here.
  };

  const handleUpdateAll = () => {
    // Save all or perform grand update
    setComponents((prev) => prev.map((comp) => ({ ...comp, saved: true })));
    alert("Provisions updated securely!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4 px-2">
          <h2 className="text-[16px] font-bold text-[#1a2b3c] whitespace-nowrap">
            Update Provision
          </h2>
          <span className="text-[12px] font-medium text-[#136FB6]">
            Work Code W46722300236
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button className="bg-[#DFEEF9] hover:bg-[#D0E5F5] text-[#1a2b3c] h-9 px-6 rounded-lg text-[12px] font-bold shadow-sm">
            View Pictures
          </Button>
          <Button
            onClick={handleUpdateAll}
            className="bg-[#136FB6] hover:bg-[#105E9A] text-white h-9 px-8 rounded-lg text-[12px] font-medium shadow-md shadow-[#136FB6]/20"
          >
            Update
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden bg-white rounded-[16px]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#DFEEF9] hover:bg-[#DFEEF9] border-none">
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 w-[60px]">
                    S No.
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Component
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 w-[200px] bg-[#DFEEF9] opacity-80">
                    Quantity
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 w-[200px] bg-[#DFEEF9] opacity-80">
                    Remark
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center bg-[#DFEEF9] opacity-80 w-[120px]">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {components.map((component, index) => (
                  <TableRow
                    key={component.id}
                    className="border-b border-white hover:bg-transparent"
                  >
                    <TableCell className="text-[12px] text-gray-900 py-3 font-medium bg-[#FAFAFA]">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-[12px] text-gray-900 py-3 font-medium bg-[#FAFAFA]">
                      {component.name}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Input
                        value={component.quantity}
                        onChange={(e) =>
                          handleInputChange(
                            component.id,
                            "quantity",
                            e.target.value,
                          )
                        }
                        placeholder="Enter Qty"
                        className="h-8 w-full bg-[#FAFAFA] border-gray-200 text-[12px] rounded-md focus-visible:ring-1 focus-visible:ring-[#136FB6]"
                      />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Input
                        value={component.remark}
                        onChange={(e) =>
                          handleInputChange(
                            component.id,
                            "remark",
                            e.target.value,
                          )
                        }
                        placeholder="Remark..."
                        className="h-8 w-full bg-[#FAFAFA] border-gray-200 text-[12px] rounded-md focus-visible:ring-1 focus-visible:ring-[#136FB6]"
                      />
                    </TableCell>
                    <TableCell className="text-center py-2.5 px-3">
                      {component.saved ? (
                        <Button className="h-8 w-full bg-[#136FB6] hover:bg-[#105E9A] text-white transition-colors rounded-md flex items-center justify-center">
                          <Check size={16} />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleSave(component.id)}
                          variant="outline"
                          className="h-8 w-full bg-white text-[#136FB6] border-[#136FB6]/20 hover:bg-[#DFEEF9] transition-colors rounded-md text-[11px] font-bold"
                        >
                          Save
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
