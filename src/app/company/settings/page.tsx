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
    </div>
  );
}
