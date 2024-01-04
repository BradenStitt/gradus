import Dashboard from "@/components/Dashboard";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

// Your Next.js page component
async function Page() {
  // Get the getUser function from the Kinde server session
  const { getUser } = getKindeServerSession();

  // Call getUser to retrieve user information
  const user = await getUser();

  // If the user is not authenticated, redirect to the auth callback page
  if (!user || !user.id) {
    redirect("/auth-callback?origin=dashboard");
  }

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  // If the user is not synced to the database, redirect to the auth callback page
  if (!dbUser) {
    redirect("/auth-callback?origin=dashboard");
  }

  return <Dashboard />;
}

// Export your page component
export default Page;
