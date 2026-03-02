"use client";

import { useRoles } from "@/modules/roles/hooks/useRoles";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

// Mock data based on PRD requirements (Role, Level, Section/Category, Difficulty)
const mockQuestions = [
  {
    id: "Q-001",
    text: "Explain the difference between a `StatefulWidget` and a `StatelessWidget` in Flutter. When would you use one over the other?",
    role: "Flutter Developer",
    level: "Junior",
    section: "Technical Basics",
    difficulty: "Easy",
  },
  {
    id: "Q-002",
    text: "What is the purpose of the `transient` keyword in Java serialization? How does it affect the object's state during persistence?",
    role: "Backend Developer",
    level: "Senior",
    section: "Advanced Java",
    difficulty: "Hard",
  },
  {
    id: "Q-003",
    text: "Describe the concept of 'prop drilling' in React. What are two common ways to avoid it in a large application?",
    role: "React Developer",
    level: "Mid-Level",
    section: "State Management",
    difficulty: "Medium",
  },
];

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
        <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm font-medium">
          <Plus size={18} />
          Add Question
        </button>
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
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative min-w-[160px]">
            <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-3 pr-9 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer">
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
            <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-3 pr-9 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer">
              <option value="">All Levels</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid-Level</option>
              <option value="senior">Senior</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={16}
            />
          </div>
          <div className="relative min-w-[160px]">
            <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-3 pr-9 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer">
              <option value="">All Sections</option>
              <option value="technical">Technical Basics</option>
              <option value="algorithm">Algorithms</option>
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
        {mockQuestions.map((q) => (
          <div
            key={q.id}
            className="group flex flex-col bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start gap-4">
              {/* Replacing the big bubbly circle with a clean, subtle ID tag */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-medium text-slate-400">
                    {q.id}
                  </span>
                </div>

                <h3 className="text-[15px] text-slate-900 font-medium leading-relaxed max-w-4xl">
                  {/* Parsing simple markdown backticks to code blocks for real-world formatting */}
                  {q.text.split("`").map((part, index) =>
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
                {q.role}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                {q.level}
              </span>

              <span className="text-slate-300 mx-1">•</span>

              <span className="text-xs text-slate-500 font-medium">
                {q.section}
              </span>

              <div className="flex-1"></div>

              <span
                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getDifficultyStyles(q.difficulty)}`}
              >
                {q.difficulty}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Pagination */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-900">1</span> to{" "}
          <span className="font-medium text-slate-900">3</span> of{" "}
          <span className="font-medium text-slate-900">48</span> results
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
    </div>
  );
};
