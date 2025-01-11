import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PreferencesForm from "../../../components/forms/preferences-form";

export default async function AlertActionPage({
  params,
  searchParams,
}: {
  params: { action: string };
  searchParams: { id?: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const isEdit = params.action === 'edit';
  const alertId = searchParams.id;

  // If trying to edit without an ID, redirect to create
  if (isEdit && !alertId) {
    redirect("/alert-management/create");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Alert' : 'Create New Alert'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEdit 
              ? 'Modify your existing alert settings'
              : 'Set up a new alert to track deals matching your criteria'
            }
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-8">
          <PreferencesForm />
        </div>
      </div>
    </div>
  );
} 