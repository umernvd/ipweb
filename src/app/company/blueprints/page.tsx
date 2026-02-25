"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DI } from "@/core/di/container";
import { Blueprint } from "@/core/entities/blueprint";
import { Plus, FileText, Loader2, Calendar } from "lucide-react";

export default function BlueprintsListPage() {
  const router = useRouter();
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const COMPANY_ID = "demo-company-id";

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await DI.blueprintService.getCompanyBlueprints(COMPANY_ID);
        setBlueprints(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Interview Blueprints
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your AI interview templates.
          </p>
        </div>
        <button
          onClick={() => router.push("/company/blueprints/create")}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus size={16} /> Create Blueprint
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-slate-400" />
        </div>
      ) : blueprints.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="text-slate-300" />
          </div>
          <h3 className="text-slate-900 font-medium">No blueprints yet</h3>
          <p className="text-slate-500 text-sm mt-1 mb-4">
            Create your first interview template to get started.
          </p>
          <button
            onClick={() => router.push("/company/blueprints/create")}
            className="text-primary text-sm font-medium hover:underline"
          >
            Create one now &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blueprints.map((bp) => (
            <div
              key={bp.$id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FileText size={20} />
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {bp.structure.length} Sections
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                {bp.name}
              </h3>
              <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(bp.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
