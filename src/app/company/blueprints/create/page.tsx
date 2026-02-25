"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  blueprintSchema,
  type BlueprintFormValues,
} from "@/core/validators/blueprint.validator";
import { useRoleStore } from "@/stores/roleStore";
import { useLevelStore } from "@/stores/levelStore";
import { DI } from "@/core/di/container";
import {
  Plus,
  Trash2,
  GripVertical,
  Clock,
  HelpCircle,
  Save,
  ArrowLeft,
  LayoutTemplate,
} from "lucide-react";

const CATEGORIES = [
  {
    id: "behavioral",
    label: "Behavioral / Soft Skills",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "technical",
    label: "Technical / Coding",
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "system_design",
    label: "System Design",
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: "experience",
    label: "Past Experience",
    color: "bg-emerald-100 text-emerald-700",
  },
];

export default function CreateBlueprintPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const { roles, fetchRoles } = useRoleStore();
  const { levels, fetchLevels } = useLevelStore();
  const COMPANY_ID = "demo-company-id";

  // FIX 1: Removed <BlueprintFormValues> generic.
  // We let zodResolver infer the types automatically to avoid the 'unknown vs number' conflict.
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(blueprintSchema),
    defaultValues: {
      name: "",
      description: "",
      roleId: "",
      levelId: "",
      structure: [
        {
          id: "init-1",
          title: "Introduction",
          category: "behavioral",
          questionCount: 2,
          durationMinutes: 10,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "structure",
  });

  const selectedRoleId = watch("roleId");

  useEffect(() => {
    fetchRoles(COMPANY_ID);
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      fetchLevels(COMPANY_ID, selectedRoleId);
      setValue("levelId", "");
    }
  }, [selectedRoleId]);

  const onSubmit = async (data: BlueprintFormValues) => {
    setIsSaving(true);
    try {
      await DI.blueprintService.createBlueprint({
        ...data,
        companyId: COMPANY_ID,
      });
      // Ensure this route exists or redirect to dashboard if not
      router.push("/company/blueprints");
    } catch (error) {
      console.error("Failed to save blueprint", error);
      alert("Failed to save. Check console.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="text-slate-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              New Interview Blueprint
            </h1>
            <p className="text-sm text-slate-500">
              Design the structure of your AI interview.
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSaving}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-hover disabled:opacity-50 shadow-sm shadow-primary/20"
        >
          {isSaving ? (
            <span className="animate-pulse">Saving...</span>
          ) : (
            <>
              <Save size={18} /> Save Blueprint
            </>
          )}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
        {/* LEFT COLUMN: FORM BUILDER */}
        <div className="col-span-7 overflow-y-auto pr-2 pb-10">
          <form className="space-y-6">
            {/* General Info */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <LayoutTemplate size={18} className="text-slate-400" />
                General Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">
                    Blueprint Name
                  </label>
                  <input
                    {...register("name")}
                    placeholder="e.g. Senior Frontend Developer Loop"
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-lg text-sm focus:border-primary outline-none"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">
                    Role
                  </label>
                  <select
                    {...register("roleId")}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-lg text-sm focus:border-primary outline-none bg-white"
                  >
                    <option value="">Select Role...</option>
                    {roles.map((r) => (
                      <option key={r.$id} value={r.$id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  {errors.roleId && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.roleId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">
                    Seniority Level
                  </label>
                  <select
                    {...register("levelId")}
                    disabled={!selectedRoleId}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-lg text-sm focus:border-primary outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">
                      {selectedRoleId ? "Select Level..." : "Select Role First"}
                    </option>
                    {levels.map((l) => (
                      <option key={l.$id} value={l.$id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                  {errors.levelId && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.levelId.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Structure Builder */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <HelpCircle size={18} className="text-slate-400" />
                  Interview Structure
                </h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  {fields.length} Sections
                </span>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="group relative bg-slate-50/50 border border-slate-200 rounded-lg p-4 hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="cursor-grab text-slate-300 hover:text-slate-500">
                          <GripVertical size={16} />
                        </div>
                        <div className="flex-1">
                          <input
                            {...register(`structure.${index}.title` as const)}
                            placeholder="Section Title"
                            className="bg-transparent font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none w-full"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-slate-300 hover:text-red-500 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">
                          Category
                        </label>
                        <select
                          {...register(`structure.${index}.category` as const)}
                          className="w-full mt-1 p-2 text-xs border border-slate-200 rounded bg-white"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">
                          Questions
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            {...register(
                              `structure.${index}.questionCount` as const,
                            )}
                            className="w-full p-2 text-xs border border-slate-200 rounded"
                          />
                          <span className="text-xs text-slate-400">Q</span>
                        </div>
                      </div>

                      <div className="col-span-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">
                          Duration
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={14} className="text-slate-400" />
                          <input
                            type="number"
                            {...register(
                              `structure.${index}.durationMinutes` as const,
                            )}
                            className="w-full p-2 text-xs border border-slate-200 rounded"
                          />
                          <span className="text-xs text-slate-400">min</span>
                        </div>
                      </div>
                    </div>

                    {/* Field Errors */}
                    {errors.structure?.[index] && (
                      <div className="mt-2 text-xs text-red-500">
                        {/* Safe check for error existence */}
                        {(errors.structure[index] as any)?.title?.message ||
                          (errors.structure[index] as any)?.questionCount
                            ?.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  append({
                    id: `sec-${Date.now()}`,
                    title: "",
                    category: "technical",
                    questionCount: 3,
                    durationMinutes: 15,
                  })
                }
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 text-sm font-medium hover:border-primary hover:text-primary hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Section
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="col-span-5">
          <div className="sticky top-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
              <h2 className="font-semibold text-lg mb-4">Blueprint Preview</h2>
              <div className="p-4 bg-white/10 rounded-xl border border-white/10 text-center">
                <p className="text-slate-400 text-sm">Live Preview Component</p>
                <p className="text-xs text-slate-500 mt-1">
                  Coming in Chunk C...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
