"use client";

import { User, Lock, Bell, Shield, Save } from "lucide-react";

export default function SettingsPage() {
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

      <div className="grid gap-8">
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
                  defaultValue="Sarah Jenkins"
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
            <div className="pt-2">
              <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <Shield size={18} className="text-slate-500" />
            <h3 className="font-semibold text-slate-900">Security & Access</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-900">
                  Two-Factor Authentication
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Add an extra layer of security to your account.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <h4 className="text-sm font-medium text-slate-900">
                  New Company Registration
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Allow new companies to sign up for the platform.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
