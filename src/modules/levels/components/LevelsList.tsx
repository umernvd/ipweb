"use client";

import { useState } from "react";
import { useLevelStore } from "@/stores/levelStore";
import { useRoleStore } from "@/stores/roleStore";
import { useAuthStore } from "@/stores/authStore";
import { Plus, Trash2, X as XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Skeleton, ConfirmDialog } from "@/shared/components/ui";
import {
  levelSchema,
  type LevelFormValues,
} from "@/core/validators/config.validator";

export const LevelsList = () => {
  const { levels, isLoading, error, addLevel, removeLevel, clearError } =
    useLevelStore();
  const { selectedRoleId } = useRoleStore();
  const { companyId } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      title: "",
      description: "",
      sortOrder: levels.length + 1,
      roleId: selectedRoleId || "",
    },
  });

  const onSubmit = async (data: LevelFormValues) => {
    if (!selectedRoleId || !companyId) return;

    await addLevel({
      title: data.title,
      description: data.description || "",
      sortOrder: data.sortOrder,
      roleIds: [selectedRoleId], // Convert roleId to roleIds array
      companyId: companyId,
    });

    reset({
      title: "",
      description: "",
      sortOrder: levels.length + 2,
      roleId: selectedRoleId,
    });
    setIsAdding(false);
  };

  if (!selectedRoleId) return null;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg">
            <Skeleton className="w-8 h-6 rounded" />
            <Skeleton className="flex-1 h-5 w-32" />
            <Skeleton className="flex-1 h-4 w-48" />
            <Skeleton className="w-8 h-8 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (levels.length === 0 && !isAdding) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
          <div className="h-6 w-6 text-slate-300 border-2 border-slate-300 rounded-sm" />
        </div>
        <h3 className="text-slate-900 font-medium">No Levels Defined</h3>
        <p className="text-sm text-slate-700 max-w-xs mt-1 mb-4">
          Create seniority levels (e.g. Junior, Senior) for this role to start
          assigning questions.
        </p>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover shadow-sm"
        >
          Add First Level
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Error Message Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            <XIcon size={16} />
          </button>
        </div>
      )}

      {/* Levels Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 uppercase tracking-wide">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-4">Level Name</div>
        <div className="col-span-6">Description</div>
        <div className="col-span-1"></div>
      </div>

      {/* Levels Rows */}
      <div className="flex flex-col gap-2">
        {levels.map((level) => (
          <div
            key={level.$id}
            className="group relative grid grid-cols-12 gap-4 items-center p-3 bg-white border border-slate-200 rounded-lg hover:shadow-sm hover:border-slate-300 transition-all"
          >
            <div className="col-span-1 flex justify-center text-slate-300 cursor-grab active:cursor-grabbing">
              <span className="font-mono text-xs font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                L{level.sortOrder}
              </span>
            </div>

            <div className="col-span-4 font-semibold text-slate-900">
              {level.title}
            </div>

            <div className="col-span-6 text-sm text-slate-700 truncate">
              {level.description || "No description"}
            </div>

            <div className="col-span-1 flex justify-end">
              <button
                onClick={() => setConfirmDelete(level.$id)}
                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {/* Add New Level Inline Form */}
        {isAdding && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-12 gap-4 items-start p-3 bg-blue-50/50 border border-blue-200 border-dashed rounded-lg animate-in fade-in"
          >
            <div className="col-span-1 flex justify-center pt-2">
              <span className="text-xs font-bold text-blue-400">NEW</span>
            </div>

            <div className="col-span-4">
              <input
                {...register("title")}
                placeholder="Level Title (e.g. Senior)"
                className="w-full text-sm px-2 py-1.5 rounded border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                autoFocus
              />
              {errors.title && (
                <p className="text-[10px] text-red-500 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="col-span-5">
              <input
                {...register("description")}
                placeholder="Description (e.g. 5+ years exp)"
                className="w-full text-sm px-2 py-1.5 rounded border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="col-span-2 flex items-center gap-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="p-1.5 bg-primary text-white rounded hover:bg-primary-hover shadow-sm disabled:opacity-50"
              >
                <Plus size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="p-1.5 bg-white border border-slate-200 text-slate-700 rounded hover:bg-slate-50"
              >
                <XIcon size={16} />
              </button>
            </div>

            <input
              type="hidden"
              {...register("roleId")}
              value={selectedRoleId}
            />
            <input type="hidden" {...register("sortOrder")} />
          </form>
        )}

        {!isAdding && levels.length > 0 && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 py-2 mt-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-700 hover:border-primary hover:text-primary hover:bg-slate-50 transition-all"
          >
            <Plus size={16} />
            Add Another Level
          </button>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Level"
        description="Are you sure you want to delete this level? This action cannot be undone."
        variant="danger"
        confirmText="Delete"
        onConfirm={() => {
          if (confirmDelete) {
            removeLevel(confirmDelete);
            setConfirmDelete(null);
          }
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};
