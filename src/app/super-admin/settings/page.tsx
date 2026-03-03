"use client";

import { useEffect, useState } from "react";
import { User, Save } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function SettingsPage() {
  const { fullName, updateFullName } = useUser();
  const [localFullName, setLocalFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setLocalFullName(fullName);
  }, [fullName]);

  const handleSaveChanges = async () => {
    if (!localFullName.trim()) {
      setSaveMessage({ type: "error", text: "Full name cannot be empty" });
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call to save profile to database
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock API response - in production, this would be a real API call
      const mockApiResponse = {
        success: true,
        data: {
          fullName: localFullName.trim(),
          email: "admin@hireai.com",
          updatedAt: new Date().toISOString(),
        },
      };

      // On successful API response, update the global UserContext
      if (mockApiResponse.success) {
        updateFullName(mockApiResponse.data.fullName);
        setSaveMessage({
          type: "success",
          text: "Profile updated successfully",
        });
        // Auto-clear message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (error) {
      setSaveMessage({ type: "error", text: "Failed to update profile" });
      // Auto-clear error message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Platform Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your admin profile and system preferences.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <User size={18} className="text-slate-500" />
          <h3 className="font-semibold text-slate-900">Admin Profile</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">
                Full Name
              </label>
              <input
                value={localFullName}
                onChange={(e) => setLocalFullName(e.target.value)}
                className="w-full mt-1 p-2.5 text-sm border border-slate-200 rounded-lg focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">
                Email Address
              </label>
              <input
                defaultValue="admin@hireai.com"
                disabled
                className="w-full mt-1 p-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
          <div className="pt-2 space-y-2">
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={16} /> {isSaving ? "Saving..." : "Save Changes"}
            </button>
            {saveMessage && (
              <p
                className={`text-sm ${saveMessage.type === "success" ? "text-emerald-600" : "text-red-600"}`}
              >
                {saveMessage.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
