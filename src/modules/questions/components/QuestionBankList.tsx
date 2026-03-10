"use client";

import { useState } from "react";
import { useRoles } from "@/modules/roles/hooks/useRoles";
import { useQuestions } from "@/modules/questions/hooks/useQuestions";
import { useLevels } from "@/modules/levels/hooks/useLevels";
import { AddQuestionModal } from "./AddQuestionModal";
import { BulkQuestionUpload } from "./BulkQuestionUpload";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  Upload,
} from "lucide-react";

const getDifficultyStyles = (difficulty: string) => {
  switch (difficulty) {
    case "Easy":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Hard":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

export const QuestionBankList = () => {
  // Pull relational data for the dropdowns
  const { roles } = useRoles();
  const { questions, deleteQuestion, isLoading } = useQuestions();
  const { levels } = useLevels();

  // Filter and modal state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  // Filter questions based on all active filters
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      searchQuery === "" ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.$id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === "" || q.roleId === selectedRole;
    const matchesLevel =
      selectedLevel === "" || q.experienceLevelId === selectedLevel;
    const matchesSection =
      selectedSection === "" || q.category === selectedSection;

    return matchesSearch && matchesRole && matchesLevel && matchesSection;
  });

  // Helper function to get role name by roleId
  const getRoleName = (roleId: string) => {
    return roles.find((r) => r.$id === roleId)?.name || "Unknown Role";
  };

  // Helper function to get level title by levelId
  const getLevelTitle = (levelId: string) => {
    return levels.find((l) => l.$id === levelId)?.title || "Unknown Level";
  };

  // Handle delete with confirmation
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      await deleteQuestion(id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Question Bank
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and organize interview questions for candidate assessments.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsBulkUploadOpen(true)}
            className="inline-flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm font-medium"
          >
            <Upload size={18} />
            Bulk Import
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm font-medium"
          >
            <Plus size={18} />
            Add Question
          </button>
        </div>
      </div>

      {/* Clean, un-boxed filter row */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative min-w-[160px]">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-3 pr-9 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
            >
              <option value="">All Roles</option>
              {roles.map((r) => (
                <option key={r.$id} value={r.$id}>
                  {r.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={16}
            />
          </div>
          <div className="relative min-w-[140px]">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-3 pr-9 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
            >
              <option value="">All Levels</option>
              {levels.map((level) => (
                <option key={level.$id} value={level.$id}>
                  {level.title}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={16}
            />
          </div>
          <div className="relative min-w-[160px]">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-3 pr-9 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {Array.from(new Set(questions.map((q) => q.category))).map(
                (category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ),
              )}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={16}
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-slate-500">Loading questions...</div>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-slate-900 font-medium">No Questions Found</h3>
            <p className="text-sm text-slate-500 max-w-xs mt-1">
              {questions.length === 0
                ? "Create your first question to get started."
                : "No questions match your current filters."}
            </p>
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <div
              key={q.$id}
              className="group flex flex-col bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start gap-4">
                {/* Question Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-medium text-slate-400">
                      {q.$id}
                    </span>
                  </div>

                  <h3 className="text-[15px] text-slate-900 font-medium leading-relaxed max-w-4xl">
                    {/* Parsing simple markdown backticks to code blocks for real-world formatting */}
                    {q.question.split("`").map((part, index) =>
                      index % 2 === 1 ? (
                        <code
                          key={index}
                          className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[13px] font-mono border border-slate-200"
                        >
                          {part}
                        </code>
                      ) : (
                        part
                      ),
                    )}
                  </h3>
                </div>

                {/* Hover Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(q.$id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Tags Footer - Flattened and minimal */}
              <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-4 border-t border-slate-100">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  {getRoleName(q.roleId)}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  {getLevelTitle(q.experienceLevelId)}
                </span>

                <span className="text-slate-300 mx-1">•</span>

                <span className="text-xs text-slate-500 font-medium">
                  {q.category}
                </span>

                <div className="flex-1"></div>

                <span
                  className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getDifficultyStyles(q.difficulty)}`}
                >
                  {q.difficulty}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modern Pagination */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-900">1</span> to{" "}
          <span className="font-medium text-slate-900">
            {Math.min(filteredQuestions.length, 3)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-900">
            {filteredQuestions.length}
          </span>{" "}
          results
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled
          >
            Previous
          </button>
          <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Next
          </button>
        </div>
      </div>

      {/* Add Question Modal */}
      {isAddModalOpen && (
        <AddQuestionModal onClose={() => setIsAddModalOpen(false)} />
      )}

      {/* Bulk Upload Modal */}
      <BulkQuestionUpload
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onSuccess={() => {
          // Refresh questions list after successful upload
          window.location.reload();
        }}
      />
    </div>
  );
};
