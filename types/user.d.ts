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
};
