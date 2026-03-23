"use client";
import { usePhoto } from "@/hooks/usePhoto";
import { UserRole } from "@/types/usertypes";
import Link from "next/link";
import PhotoDetailsDialog from "./PhotoDetailsDialog";
import { Button } from "./ui/button";

const ViewPhoto = ({ component, role }: { component: any; role: string }) => {
  const { data: photoData, isLoading } = usePhoto(component?.approved_photo_id);

  if (role === UserRole.DistrictOfficer && component?.approved_photo_id) {
    return (
      <PhotoDetailsDialog
        component={component}
        isLoading={isLoading}
        photoData={photoData}
        role={role}
      />
    );
  } else if (
    role === "HO" &&
    component?.status === "APPROVED" &&
    component?.approved_photo_id
  ) {
    return (
      <PhotoDetailsDialog
        component={component}
        isLoading={isLoading}
        photoData={photoData}
        role={role}
      />
    );
  } else if (role === "HO" && component?.status !== "APPROVED") {
    return (
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg cursor-not-allowed bg-gray-100 text-gray-400 border-gray-300 hover:bg-gray-100"
          title="Photo will be available once approved"
          disabled
        >
          View Photo
        </Button>
      </div>
    );
  } else if (role === "DO" && !component?.approved_photo_id) {
    return (
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg cursor-not-allowed bg-gray-100 text-gray-400 border-gray-300 hover:bg-gray-100"
          title="No approved photo available"
          disabled
        >
          View Photo
        </Button>
      </div>
    );
  }
  return (
    <Link href={`/work-order/review-photos/${component.id}`}>
      <div className="flex justify-center">
        <Button
          variant="default"
          size="sm"
          className="rounded-lg hover:bg-emerald-50"
          title="Review Photos"
        >
          View Photos
        </Button>
      </div>
    </Link>
  );
};

export default ViewPhoto;
