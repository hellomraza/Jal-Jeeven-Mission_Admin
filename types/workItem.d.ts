type WorkItem = {
  amount_approved: number;
  block_id: number;
  circle_id: number;
  contractor_id: string;
  contractor: Contractor | null;
  workItems: WorkItemComponent[];
  created_at: string;
  description: string;
  district_id: string;
  district: District | null;
  id: string;
  latitude: string;
  longitude: string;
  nofhtc: string;
  panchayat_id: number;
  panchayat: Panchayat | null;
  village_id: number;
  village: Village | null;
  block_id: number;
  block: Block | null;
  zone_id: number;
  zone: Zone | null;
  circle_id: number;
  circle: Circle | null;
  subdivision_id: number;
  subdivision: Subdivision | null;
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
  workcodeid: string;
  excel?: string;
  agreement_id?: string;
  work_order_type?: "SVS" | "BULK_VILLAGE";
  tpi_id?: string | null;
  tpi?: TpiAgency | null;
  tpi_assigned_by_id?: string | null;
  tpi_assigned_at?: string | null;
  tpiStaffAssignments?: {
    id: string;
    staff_id: string;
    staff?: TpiStaff;
    created_at: string;
  }[];
};

type WorkItemComponent = {
  component_id: string;
  component: Component | null;
  created_at: string;
  id: string;
  progress: string;
  quantity: string;
  remarks: null | string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "IN_PROGRESS" | "SUBMITTED";
  updated_at: string;
  work_item_id: string;
  tpiReferencePhotoStatus?: {
    id: string;
    photo_id: string;
    status: "UPLOADED" | "SELECTED";
    selected_by?: string | null;
    selected_at?: string | null;
    photo?: {
      id: string;
      image_url?: string;
      latitude?: number;
      longitude?: number;
      timestamp?: string;
    };
  } | null;
};

type Component = {
  id: string;
  name: string;
  unit: string;
  order_number: number;
  work_order_type?: "SVS" | "BULK_VILLAGE";
  created_at: string;
  updated_at: string;
};

