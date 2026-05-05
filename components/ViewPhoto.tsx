"use client";
import { UserRole } from "@/types/usertypes";
import Link from "next/link";
import { Button } from "./ui/button";

const ViewPhoto = ({ component, role }: { component: any; role: string }) => {
  const status = component?.status;

  const isDO = role === UserRole.DistrictOfficer || role === "DO";
  const isHO = role === UserRole.HeadOfficer || role === "HO";
  const isCO = role === UserRole.Contractor || role === "CO";

  const doEnabled = status === "SUBMITTED" || status === "APPROVED";
  const hoEnabled = status === "APPROVED";

  // CO can always view uploaded photos; selection is enforced elsewhere when component is complete.
  if (isCO) {
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
  }

  if (isDO) {
    if (doEnabled) {
      return (
        <Link href={`/work-order/review-photos/${component.id}`}>
          <div className="flex justify-center">
            <Button
              variant="default"
              size="sm"
              className="rounded-lg hover:bg-emerald-50"
              title="Review selected photos"
            >
              View Photos
            </Button>
          </div>
        </Link>
      );
    }

    return (
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg cursor-not-allowed bg-gray-100 text-gray-400 border-gray-300 hover:bg-gray-100"
          title="View enabled when component is submitted or approved"
          disabled
        >
          View Photos
        </Button>
      </div>
    );
  }

  if (isHO) {
    if (hoEnabled) {
      return (
        <Link href={`/work-order/review-photos/${component.id}`}>
          <div className="flex justify-center">
            <Button
              variant="default"
              size="sm"
              className="rounded-lg hover:bg-emerald-50"
              title="Review approved photos"
            >
              View Photos
            </Button>
          </div>
        </Link>
      );
    }

    return (
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg cursor-not-allowed bg-gray-100 text-gray-400 border-gray-300 hover:bg-gray-100"
          title="Photo will be available once DO approves"
          disabled
        >
          View Photos
        </Button>
      </div>
    );
  }

  // Default: allow navigation to review page
  return (
    <Link href={`/work-order/review-photos/${component.id}`}>
      <div className="flex justify-center">
        <Button
          variant="default"
          size="sm"
          className="rounded-lg hover:bg-emerald-50"
          title="View Photos"
        >
          View Photos
        </Button>
      </div>
    </Link>
  );
};

export default ViewPhoto;
