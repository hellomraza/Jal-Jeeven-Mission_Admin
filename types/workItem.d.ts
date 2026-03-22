type WorkItem = {
  amount_approved: number;
  block_id: number;
  circle_id: number;
  contractor_id: string;
  created_at: string;
  description: string;
  district_id: string;
  id: string;
  latitude: string;
  longitude: string;
  nofhtc: string;
  panchayat_id: number;
  payment_amount: number;
  progress_percentage: string;
  schemetype: string;
  serial_no: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  subdivision_id: number;
  title: string;
  updated_at: string;
  village_id: number;
  work_code: string;
  zone_id: number;
};

type WorkItemComponent = {
  approved_photo_id: string | null;
  component_id: string;
  created_at: string;
  id: string;
  progress: string;
  quantity: string;
  remarks: null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "IN_PROGRESS" | "SUBMITTED";
  updated_at: string;
  work_item_id: string;
};
