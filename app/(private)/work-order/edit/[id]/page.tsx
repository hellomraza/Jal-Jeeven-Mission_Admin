import { createServerApiClient } from "@/lib/server-api-client";
import { UserRole } from "@/types/usertypes";
import { cookies } from "next/headers";
import { forbidden } from "next/navigation";
import EditWorkOrder from "./EditWorkOrder";

type LocationOption = {
  id: number;
  code: string;
  name: string;
  district_id?: number;
};

const LOCATION_META: Record<
  string,
  { idKey: string; nameKey: string; parentDistrictKey?: string }
> = {
  districts: { idKey: "districtid", nameKey: "districtname" },
  blocks: {
    idKey: "blockid",
    nameKey: "blockname",
    parentDistrictKey: "district_id",
  },
  panchayats: {
    idKey: "panchayatid",
    nameKey: "panchayatname",
    parentDistrictKey: "district_id",
  },
};


const LOCATION_TYPES = ["districts", "blocks", "panchayats"] as const;

const mapLocationOptions = (
  type: string,
  records: any[] = [],
): LocationOption[] => {
  const meta = LOCATION_META[type];
  if (!meta) return [];

  return records.reduce<LocationOption[]>((acc, item) => {
    const id = Number(item?.[meta.idKey]);
    const name = String(item?.[meta.nameKey] || "").trim();
    const districtId = meta.parentDistrictKey
      ? Number(item?.[meta.parentDistrictKey])
      : undefined;

    let code = "";
    if (type === "districts") {
      code = item?.district_code || item?.districtcode || "";
    } else if (type === "blocks") {
      code = item?.block_code || item?.blockcode || "";
    } else if (type === "panchayats") {
      code = item?.panchayat_code || item?.panchayatcode || "";
    }

    if (!Number.isFinite(id) || !name) return acc;

    acc.push({
      id,
      code,
      name,
      district_id: Number.isFinite(districtId as number)
        ? districtId
        : undefined,
    });

    return acc;
  }, []);
};

export default async function EditWorkOrderPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookiesStore = await cookies()
  const userRole = cookiesStore.get('admin_role')?.value as UserRole

  if (userRole === UserRole.Contractor) {
    return forbidden()
  }

  const apiClient = await createServerApiClient()

  const [
    workItemResponse,
    agreementResponse,
    districtsResponse,
    blocksResponse,
    panchayatsResponse,
  ] = await Promise.all([
    apiClient.get(`/work-items/${id}`),
    apiClient.get<PaginatedResponse<Agreement>>(`/agreements?page=${1}&limit=${999}`),
    apiClient.get(`/locations/districts?page=1&limit=1000`),
    apiClient.get(`/locations/blocks?page=1&limit=1000`),
    apiClient.get(`/locations/panchayats?page=1&limit=1000`),
  ])

  const workItem = workItemResponse.data;
  const agreements = agreementResponse.data?.data;
  const assignedAgreement = agreements.find((ag: any) => ag.id === workItem.agreement_id) || null;
  const districts = districtsResponse.data?.data;
  const blocks = blocksResponse.data?.data;
  const panchayats = panchayatsResponse.data?.data;

  const locationDataByType = {
    districts: mapLocationOptions("districts", districts),
    blocks: mapLocationOptions("blocks", blocks),
    panchayats: mapLocationOptions("panchayats", panchayats),
  }



  return <EditWorkOrder workItem={workItem} userRole={userRole} agreements={agreements} assignedAgreement={assignedAgreement} locationDataByType={locationDataByType} />
}