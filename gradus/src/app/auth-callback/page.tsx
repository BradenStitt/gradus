"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";
/* 
[React Query issue] As React Query 5 has just been released and the current version of tRPC (v10) still depends on React Query 4, the installation cmd of tRPC would be: 
npm i @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query@^4.18.0  zod
And this would be updated in tRPC v11.
*/
function page() {
  const router = useRouter(); // Get the router object from Next.js

  const searchParams = useSearchParams(); // Get the search params from Next.js
  const origin = searchParams.get("origin"); // Get the origin query parameter

  trpc.authCallback.useQuery(undefined, {
    onSuccess: ({ success }) => {
      if (success) {
        //user is synced to db
        router.push(origin ? `/${origin}` : "/dashboard");
      }
    },
    onError: (err) => {
      if (err.data?.code === "UNAUTHORIZED") {
        // user is not logged in
        router.push("/sign-in");
      }
    },
    retry: true,
    retryDelay: 500,
  });

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

export default page;
