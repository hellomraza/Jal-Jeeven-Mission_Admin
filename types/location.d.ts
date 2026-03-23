type LocationType =
  | "districts"
  | "blocks"
  | "panchayats"
  | "villages"
  | "subdivisions"
  | "circles"
  | "zones";

type District = {
  districtid: number;
  districtname: string;
  districtcode: string;
};

type Block = {
  blockid: number;
  blockname: string;
  blockcode: string;
  district_id: number;
};

type Panchayat = {
  panchayatid: number;
  panchayatname: string;
  panchayat_code: string;
};

type Village = {
  villageid: number;
  villagename: string;
  village_code: string;
  district_id: number;
};

type Subdivision = {
  subdivisionid: number;
  subdivisionname: string;
  subdivision_code: string;
};

type Circle = {
  circleid: number;
  circlename: string;
  circle_code: string;
};

type Zone = {
  zoneid: number;
  zonename: string;
  zone_code: string;
};
