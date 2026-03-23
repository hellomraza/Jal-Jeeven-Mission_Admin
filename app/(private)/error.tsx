"use client"; // Error boundaries must be Client Components

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col justify-center items-center gap-4">
      <h2>Something went wrong!</h2>
      <Button
        onClick={
          // Attempt to recover by re-fetching and re-rendering the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  );
}
