"use client";

import EditEmployeeDialog from "@/components/EditEmployeeDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil } from "lucide-react";
import { useState } from "react";

interface EmployeeManagementTableProps {
  employees: Employee[];
  canEdit?: boolean;
}

export default function EmployeeManagementTable({
  employees,
  canEdit = true,
}: EmployeeManagementTableProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) {
      setSelectedEmployee(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white py-0">
          <CardContent className="p-0">
            {employees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-[14px] text-gray-500 font-medium">
                  No employees created yet
                </p>
                <p className="text-[12px] text-gray-400 mt-1">
                  Click "Create Employee" to add a new employee
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 hover:bg-transparent">
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Name
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Email
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      District
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Mobile
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Address
                    </TableHead>

                    {canEdit && (
                      <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow
                      key={employee.id}
                      className="border-gray-100 hover:bg-gray-50"
                    >
                      <TableCell className="text-[13px] font-medium text-[#1a2b3c]">
                        {employee.name}
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600">
                        {employee.email}
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600">
                        {employee.district_name}
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600">
                        {employee.mobile}
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600 max-w-30 truncate">
                        {employee.address}
                      </TableCell>
                      {canEdit && (
                        <TableCell>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-gray-200 text-[12px] font-semibold text-[#1a2b3c] hover:bg-gray-50"
                            onClick={() => handleEditClick(employee)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <EditEmployeeDialog
        employee={selectedEmployee}
        isOpen={isEditOpen}
        onOpenChange={handleOpenChange}
      />
    </>
  );
}
