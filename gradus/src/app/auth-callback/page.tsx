"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

function Page() {
  const router = useRouter(); // Get the router object from Next.js

  const searchParams = useSearchParams(); // Get the search params from Next.js
  const origin = searchParams.get("origin"); // Get the origin query parameter

  const { data, error, status } = trpc.authCallback.useQuery();

  useEffect(() => {
    if (status === "success") {
      const { success } = data;
      if (success) {
        // User is synced to the database
        router.push(origin ? `/${origin}` : "/dashboard");
      }
    } else if (status === "error") {
      if (error?.data?.code === "UNAUTHORIZED") {
        // User is not logged in
        router.push("/sign-in");
      }
    }
  }, [status, data, error, origin, router]);

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
}

export default Page;
