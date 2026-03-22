"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

const BackButton = () => {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => router.back()}
      className="rounded-full h-9 w-9 border-gray-100 shadow-sm"
    >
      <ArrowLeft size={18} className="text-gray-600" />
    </Button>
  );
};

export default BackButton;
