import { ChangePasswordForm } from "@/modules/settings/components/ChangePasswordForm";
import { UpdateEmailForm } from "@/modules/settings/components/UpdateEmailForm";
import { GoogleDriveConnect } from "@/modules/settings/components/GoogleDriveConnect";

export const metadata = {
  title: "Settings | HireAI Admin",
  description: "Manage your account security and preferences",
};

export default function SettingsPage() {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your account security and preferences.
        </p>
      </div>

      {/* Forms */}
      <ChangePasswordForm />
      <UpdateEmailForm />
      <GoogleDriveConnect />

      <div className="rounded-xl border border-red-200 bg-red-50/30 overflow-hidden mt-4">
        <div className="px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-red-700">
              Delete Account
            </h3>
            <p className="text-sm text-red-600/80 mt-1 max-w-md">
              Once you delete your account, there is no going back. All your
              company data, interviews, and candidates will be permanently
              wiped.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
