"use client";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";

const ExportAgreement = ({ agreements }: { agreements: any[] }) => {
  const handleExport = () => {
    const exportData = agreements.map((row, index) => ({
      "S No.": index + 1,
      "Work Code": row.workItem?.work_code || "N/A",
      "Name Of Contractor": row.contractor?.name || "N/A",
      "Contractor Code": row.contractor?.code || "N/A",
      "Work Order No.": row.agreementno || "N/A",
      "Work Order Date": row.created_at
        ? new Date(row.created_at).toLocaleDateString()
        : "N/A",
      Division: row.workItem?.district_id || "N/A",
      "Agreement No.": row.agreementno || "N/A",
      "Agreement Year": row.agreementyear || "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Agreements");
    XLSX.writeFile(wb, "Agreements.xlsx");
  };
  return (
    <Button
      onClick={handleExport}
      disabled={agreements.length === 0}
      className="bg-[#DFEEF9] hover:bg-[#D0E5F5] text-[#1a2b3c] font-bold text-[12px] h-10 px-6 rounded-lg flex items-center gap-2 shadow-sm disabled:opacity-50"
    >
      <Upload size={14} className="stroke-[2.5]" />
      Export
    </Button>
  );
};

export default ExportAgreement;
