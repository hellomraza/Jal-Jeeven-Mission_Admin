import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Forbidden() {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center gap-4">
      <h2>Forbidden</h2>
      <p>You are not authorized to access this resource.</p>
      <Link href="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}
