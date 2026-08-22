export type PaymentDetailStatus =
  | 'DETAILS_FILLED'
  | 'SEND_TO_DO'
  | 'DO_CHECKED'
  | 'SEND_TO_EE'
  | 'EE_CHECKED'
  | 'SEND_FOR_RELEASE_PAYMENT';

export interface VoucherFile {
  id: string;
  file_url: string;
  file_name?: string | null;
  file_size?: number | null;
  mime_type: string;
  uploaded_by_id: string;
  uploaded_by_role: string;
  created_at: string;
}

export interface PaymentDetailAudit {
  id: string;
  payment_detail_id: string;
  action: string;
  description?: string | null;
  performed_by_id: string;
  performed_by_name: string;
  performed_by_email: string;
  performed_by_role: string;
  previous_status?: string | null;
  new_status?: string | null;
  created_at: string;
}

export interface PaymentDetail {
  id: string;
  contractor_name: string;
  contractor_code: string;
  work_order_code: string;
  bank_name: string;
  bank_account_number: string;
  ifsc_code: string;
  branch: string;
  amount: number;
  voucher_number: string;
  voucher_file_url?: string | null;
  voucher_file_id?: string | null;
  voucherFile?: VoucherFile | null;
  cheque_number?: string | null;
  district_id: string;
  status: PaymentDetailStatus;
  is_deleted: boolean;
  deleted_by_id?: string | null;
  deleted_at?: string | null;
  created_by_id: string;
  created_by_role: string;
  audits?: PaymentDetailAudit[];
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentDetailInput {
  contractor_name: string;
  contractor_code: string;
  work_order_code: string;
  bank_name: string;
  bank_account_number: string;
  ifsc_code: string;
  branch: string;
  amount: number;
  voucher_number: string;
  voucher_file_url?: string;
  voucher_file_id?: string;
  file_name?: string;
  file_size?: number;
  cheque_number?: string;
}
