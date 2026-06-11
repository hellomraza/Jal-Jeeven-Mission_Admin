type Agreement = {
  id: string;
  agreementno: string;
  agreementyear: string;
  contractor_id: string;
  work_id?: string; // Optional/Deprecated
  created_at: string;
  division_code: string;
  security_deposit?: number;
  agrid?: string;
  sr?: string;
  workorderno?: string;
  workorderdate?: string;
  unitag?: string;
};

type AgreementFile = {
  id: string;
  file_url: string;
  file_name: string;
  mime_type: string;
  uploaded_by_user_id: string;
  uploaded_by_role: string;
};

type AgreementWorkItem = {
  id: string;
  work_code: string;
  district_id?: string | null;
  schemetype: string;
  contractor_id: string;
  latitude: number;
  longitude: number;
  progress_percentage: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  created_at: Date;
  updated_at: Date;
};

type AgreementContractor = {
  id: string;
  name: string;
  code: string;
  email: string;
  role: string;
  district_id?: string | null;
};
type AgreementResponse = Agreement & {
  contractor: AgreementContractor;
  workItems: AgreementWorkItem[];
  files: AgreementFile[];
};
