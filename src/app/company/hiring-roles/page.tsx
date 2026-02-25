"use client";

import { useEffect } from "react";
import { useRoleStore } from "@/stores/roleStore";
import { useLevelStore } from "@/stores/levelStore";
import { useAuthStore } from "@/stores/authStore";
import { RolesList } from "@/modules/roles/components/RolesList";
import { LevelsList } from "@/modules/levels/components/LevelsList";

export default function HiringRolesPage() {
  const { fetchRoles, roles, selectedRoleId } = useRoleStore();
  const { fetchLevels } = useLevelStore();
  const { companyId } = useAuthStore();

  useEffect(() => {
    if (companyId) {
      fetchRoles(companyId);
    }
  }, [companyId]);

  useEffect(() => {
    if (selectedRoleId && companyId) {
      fetchLevels(companyId, selectedRoleId);
    }
  }, [selectedRoleId, companyId]);

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex gap-6">
      <div className="w-1/3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-900">Hiring Roles</h2>
          <p className="text-xs text-slate-500">Select a role to view levels</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <RolesList />
        </div>
      </div>

      <div className="w-2/3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {selectedRoleId ? (
          <>
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-slate-900">Seniority Levels</h2>
                <p className="text-xs text-slate-500">
                  For:{" "}
                  <span className="font-medium text-primary">
                    {roles.find((r) => r.$id === selectedRoleId)?.name}
                  </span>
                </p>
              </div>
              <button className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-colors">
                + Add Level
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <LevelsList />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <p>Select a role from the left to manage its levels.</p>
          </div>
        )}
      </div>
    </div>
  );
}
