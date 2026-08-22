"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentDetail } from "@/types/payment";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  FileCheck,
  History,
  Mail,
  PlusCircle,
  Send,
  Trash2,
  User,
} from "lucide-react";

interface PaymentAuditHistoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  payment: PaymentDetail | null;
}

export default function PaymentAuditHistoryModal({
  isOpen,
  onOpenChange,
  payment,
}: PaymentAuditHistoryModalProps) {
  if (!payment) return null;

  const audits = payment.audits || [];

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATED":
        return <PlusCircle size={14} className="text-emerald-600" />;
      case "EDITED":
        return <Edit3 size={14} className="text-amber-600" />;
      case "SEND_TO_DO":
        return <Send size={14} className="text-blue-600" />;
      case "DO_CHECKED":
        return <CheckCircle2 size={14} className="text-indigo-600" />;
      case "SEND_TO_EE":
        return <Send size={14} className="text-purple-600" />;
      case "EE_CHECKED":
        return <FileCheck size={14} className="text-emerald-600" />;
      case "SOFT_DELETED":
        return <Trash2 size={14} className="text-red-600" />;
      default:
        return <History size={14} className="text-gray-600" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "CREATED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "EDITED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "SEND_TO_DO":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "DO_CHECKED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "SEND_TO_EE":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "EE_CHECKED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SOFT_DELETED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#136FB6] flex items-center justify-center">
                <History size={18} />
              </div>
              <div>
                <DialogTitle className="text-[17px] font-bold text-[#1a2b3c]">
                  Payment Detail Audit Trail
                </DialogTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Voucher No: <strong className="font-mono text-[#1a2b3c]">{payment.voucher_number}</strong> | Contractor: <strong className="text-[#1a2b3c]">{payment.contractor_name}</strong>
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Timeline */}
        <div className="py-4">
          {audits.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              No audit logs recorded for this payment record.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {audits.map((audit, index) => {
                const date = new Date(audit.created_at);
                const formattedDate = date.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                const formattedTime = date.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                });

                return (
                  <div key={audit.id || index} className="relative group">
                    {/* Dot on line */}
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-[#136FB6] flex items-center justify-center shadow-sm">
                      {getActionIcon(audit.action)}
                    </div>

                    <div className="bg-gray-50/70 hover:bg-gray-50 rounded-xl p-3.5 border border-gray-100 transition-colors">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getActionBadgeColor(
                            audit.action,
                          )}`}
                        >
                          {audit.action.replace(/_/g, " ")}
                        </span>

                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                          <Calendar size={12} className="text-gray-400" />
                          <span>{formattedDate}</span>
                          <Clock size={12} className="ml-1 text-gray-400" />
                          <span>{formattedTime}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-700 font-medium leading-relaxed mb-2">
                        {audit.description || "Action executed"}
                      </p>

                      <div className="flex items-center gap-3 pt-2 border-t border-gray-200/50 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <User size={12} className="text-gray-400" />
                          <strong className="text-gray-700">{audit.performed_by_name}</strong> ({audit.performed_by_role})
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail size={12} className="text-gray-400" />
                          <span>{audit.performed_by_email}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
