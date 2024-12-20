import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.userId) {
    redirect("/sign-in?redirect_url=/dashboard/preferences");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>{children}</main>
    </div>
  );
} 