"use client";

import { useState } from "react";
import { useRoles } from "@/modules/roles/hooks/useRoles";
import { useRoleStore } from "@/stores/roleStore";
import { Briefcase, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Skeleton, ConfirmDialog } from "@/shared/components/ui";
import {
  roleSchema,
  type RoleFormValues,
} from "@/core/validators/config.validator";

export const RolesList = () => {
  const { roles, isLoading, isMutating, createRole, deleteRole } = useRoles();
  const { selectedRoleId, setSelectedRole } = useRoleStore();
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
  });

  const onSubmit = async (data: RoleFormValues) => {
    const success = await createRole(data.name, data.description, data.icon);
    if (success) {
      reset();
      setIsAdding(false);
    }
  };

  if (isLoading && roles.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="w-5 h-5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* List Area */}
      <div className="flex-1 overflow-y-auto">
        {roles.map((role) => (
          <div
            key={role.$id}
            onClick={() => setSelectedRole(role.$id)}
            className={`group flex items-center justify-between p-4 border-b border-slate-50 cursor-pointer transition-all ${
              selectedRoleId === role.$id
                ? "bg-blue-50/60 border-l-4 border-l-primary"
                : "hover:bg-slate-50 border-l-4 border-l-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${selectedRoleId === role.$id ? "bg-blue-100 text-primary" : "bg-slate-100 text-slate-500"}`}
              >
                <Briefcase size={18} />
              </div>
              <div>
                <h3
                  className={`text-sm font-semibold ${selectedRoleId === role.$id ? "text-primary" : "text-slate-700"}`}
                >
                  {role.name}
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-[140px]">
                  {role.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete({ id: role.$id, name: role.name });
                }}
                disabled={isMutating}
                className="p-1.5 text-slate-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
              <ChevronRight
                size={16}
                className={`transition-colors ${selectedRoleId === role.$id ? "text-primary" : "text-slate-300"}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add Role Section (Fixed at bottom) */}
      <div className="p-4 border-t border-slate-100 bg-slate-50">
        {isAdding ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-2"
          >
            <div>
              <input
                {...register("name")}
                placeholder="Role Name (e.g. Product Manager)"
                className="w-full text-sm border-b border-slate-200 pb-1 focus:border-primary outline-none"
                autoFocus
              />
              {errors.name && (
                <span className="text-[10px] text-red-500">
                  {errors.name.message}
                </span>
              )}
            </div>
            <div>
              <input
                {...register("description")}
                placeholder="Short description..."
                className="w-full text-xs text-slate-500 border-b border-slate-200 pb-1 focus:border-primary outline-none"
              />
              {errors.description && (
                <span className="text-[10px] text-red-500">
                  {errors.description.message}
                </span>
              )}
            </div>
            <div className="flex gap-2 justify-end mt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-slate-500 px-2 py-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-medium hover:bg-primary-hover"
              >
                {isSubmitting ? "Saving..." : "Save Role"}
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-primary hover:text-primary transition-colors bg-white"
          >
            <Plus size={16} />
            Create New Role
          </button>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Role"
        description={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
        onConfirm={() => {
          if (confirmDelete) {
            deleteRole(confirmDelete.id);
            setConfirmDelete(null);
          }
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};
