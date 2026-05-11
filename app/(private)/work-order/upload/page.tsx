"use client";
import BackButton from "@/components/BackButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  WorkItemImport,
  bulkImportWorkItems,
  uploadWorkItemFile,
} from "@/services/workService";
import { AlertCircle, CheckCircle, FileUp, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";

export default function UploadWorkItemPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState<WorkItemImport[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".xlsx")) {
        toast.error("Only .xlsx files are supported.");
        return;
      }
      setSelectedFile(file);
      setParsedData([]);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      toast.error("Please choose an Excel file to upload.");
      return;
    }

    try {
      setUploading(true);
      const data = await uploadWorkItemFile(selectedFile);
      setParsedData((data.workItemTable || []) as WorkItemImport[]);
      setShowPreview(true);
      toast.success("File parsed successfully. Please verify the data.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload workitem file",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      await bulkImportWorkItems(parsedData);
      toast.success("Workitems imported successfully.");
      router.push("/work-order");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to import data",
      );
    } finally {
      setConfirming(false);
    }
  };

  if (showPreview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-2xl font-bold text-[#1a2b3c]">
            Verify Workitems
          </h1>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            {parsedData.length} record(s) found. Please verify before importing.
          </AlertDescription>
        </Alert>

        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden bg-white rounded-2xl py-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#DFEEF9] hover:bg-[#DFEEF9] border-none">
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      S No.
                    </TableHead>
                    {parsedData.length > 0 &&
                      Object.keys(parsedData[0]).map((key) => (
                        <TableHead
                          key={key}
                          className="font-bold text-[#1a2b3c] text-[12px] h-12"
                        >
                          {key}
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-10 text-gray-500"
                      >
                        No data to preview.
                      </TableCell>
                    </TableRow>
                  ) : (
                    parsedData.map((row, index) => (
                      <TableRow
                        key={index}
                        className="border-b border-gray-50 hover:bg-gray-50/50"
                      >
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {index + 1}
                        </TableCell>
                        {Object.values(row).map((value, idx) => (
                          <TableCell
                            key={idx}
                            className="text-[12px] text-gray-900 py-4 font-medium max-w-xs truncate"
                            title={String(value)}
                          >
                            {String(value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowPreview(false);
              setParsedData([]);
              setSelectedFile(null);
            }}
            disabled={confirming}
          >
            Back to Upload
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={confirming || parsedData.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {confirming ? "Importing..." : "Confirm & Import"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-2xl font-bold text-[#1a2b3c]">Upload Workitems</h1>
      </div>

      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-[18px] text-[#1a2b3c]">
            Upload Excel File
          </CardTitle>
          <CardDescription>
            Select an .xlsx file to upload. It will be parsed for preview before
            import.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleUpload}>
            <div className="space-y-3">
              <Label
                htmlFor="workitem-file"
                className="text-[14px] font-medium"
              >
                Excel File (.xlsx)
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                <Input
                  id="workitem-file"
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                  disabled={uploading}
                />
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-800">
                    Selected file:{" "}
                    <span className="font-medium">{selectedFile.name}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  router.back();
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading || !selectedFile}>
                {uploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload & Parse
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-900">
          The file will be validated and parsed on the server. Any errors will
          be reported after upload.
        </AlertDescription>
      </Alert>
    </div>
  );
}
