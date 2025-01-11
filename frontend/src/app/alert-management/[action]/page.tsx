import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PreferencesForm from "@/components/forms/preferences-form";

interface PageProps {
  params: Promise<{ action: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AlertActionPage(props: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { action } = await props.params;
  const id = props.searchParams.id as string | undefined;

  if (action === 'create') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Alert</h1>
          <p className="mt-2 text-sm text-gray-600">
            Set up criteria for deals you want to track
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-8">
          <PreferencesForm />
        </div>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-8">
          <PreferencesForm />
        </div>
      </div>
    );
  }

  redirect('/alert-management');
} 