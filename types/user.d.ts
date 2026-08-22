type Employee = {
  code: string;
  created_at: string;
  email: string;
  id: string;
  name: string;
  role: "EM";
  updated_at: string;
  address: string;
  district_name: string;
  mobile: string;
};

type Contractor = {
  code: string;
  created_at: string;
  district_id: number;
  email: string;
  id: string;
  name: string;
  role: "CO";
  updated_at: string;
  address: string;
  district_name: string;
  mobile: string;
  pan_number: string;
  is_active?: boolean;
};
type DistrictOfficer = {
  code?: string;
  created_at: string;
  district_id: number | string;
  email: string;
  id: string;
  name: string;
  role: "DO";
  updated_at: string;
  mobile?: string;
  is_bulk_order_allowed: boolean;
  district?: District | null;
};

type ExecutiveEngineer = {
  code?: string;
  created_at: string;
  district_id: number | string;
  email: string;
  id: string;
  name: string;
  role: "EE";
  updated_at: string;
  mobile?: string;
  is_active?: boolean;
  district?: District | null;
};

type DOStaff = {
  id: string;
  code?: string;
  name: string;
  email: string;
  mobile?: string;
  role: "DO_STAFF";
  is_active: boolean;
  district_id?: number | string;
  created_at: string;
  updated_at: string;
};

type TpiAgency = {
  id: string;
  code: string;
  name: string;
  email: string;
  role: "TPI";
  mobile?: string;
  district_id: number | string;
  pan_number?: string;
  address?: string;
  is_active: boolean;
  district?: District | null;
  created_at: string;
  updated_at: string;
};

type TpiStaff = {
  id: string;
  name: string;
  email: string;
  role: "TPI_STAFF";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  code?: string;
  is_bulk_order_allowed?: boolean;
  district_id?: number | string;
  district?: {
    district_code: number | string;
    districtname: string;
  } | null;
};

