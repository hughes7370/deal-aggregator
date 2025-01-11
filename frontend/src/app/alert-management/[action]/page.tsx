import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    action: string;
  };
  searchParams: {
    id?: string;
  };
}

export default async function AlertActionPage({ params, searchParams }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { action } = params;
  const { id } = searchParams;

  if (action === 'create') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Alert</h1>
          <p className="mt-2 text-sm text-gray-600">
            Set up criteria for deals you want to track
          </p>
        </div>
        {/* Alert form will go here */}
      </div>
    );
  }

  if (action === 'edit' && id) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Alert</h1>
          <p className="mt-2 text-sm text-gray-600">
            Update your alert criteria
          </p>
        </div>
        {/* Alert form with existing data will go here */}
      </div>
    );
  }

  redirect('/alert-management');
} 