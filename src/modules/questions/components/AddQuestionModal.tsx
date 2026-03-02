"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  questionSchema,
  QuestionFormValues,
} from "@/core/validators/question.validator";
import { useRoles } from "@/modules/roles/hooks/useRoles";
import { useLevels } from "@/modules/levels/hooks/useLevels";
import { useQuestions } from "@/modules/questions/hooks/useQuestions";

interface AddQuestionModalProps {
  onClose: () => void;
}

export function AddQuestionModal({ onClose }: AddQuestionModalProps) {
  const { createQuestion, isMutating } = useQuestions();
  const { roles } = useRoles();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      difficulty: "Medium",
    },
  });

  // 🧠 THE MAGIC TRICK: Watch the roleId to dynamically fetch the correct levels!
  const selectedRoleId = watch("roleId");
  const { levels, isLoading: isLoadingLevels } = useLevels(selectedRoleId);

  const onSubmit = async (data: QuestionFormValues) => {
    const success = await createQuestion(
      data.questionText,
      data.roleId,
      data.levelId,
      data.section,
      data.difficulty,
    );

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">
            Add New Question
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* QUESTION TEXT */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Question Text
            </label>
            <textarea
              {...register("questionText")}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="e.g., Explain the difference between StatefulWidget and StatelessWidget..."
            />
            {errors.questionText && (
              <p className="text-red-500 text-xs mt-1">
                {errors.questionText.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* ROLE DROPDOWN */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Role
              </label>
              <select
                {...register("roleId")}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="">Select a Role...</option>
                {roles.map((r) => (
                  <option key={r.$id} value={r.$id}>
                    {r.name}
                  </option>
                ))}
              </select>
              {errors.roleId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.roleId.message}
                </p>
              )}
            </div>

            {/* DYNAMIC LEVEL DROPDOWN */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Level
              </label>
              <select
                {...register("levelId")}
                className="w-full px-3 py-2 border rounded-lg bg-white disabled:bg-slate-50"
                disabled={!selectedRoleId || isLoadingLevels}
              >
                <option value="">
                  {isLoadingLevels ? "Loading..." : "Select a Level..."}
                </option>
                {levels.map((l) => (
                  <option key={l.$id} value={l.$id}>
                    {l.title}
                  </option>
                ))}
              </select>
              {errors.levelId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.levelId.message}
                </p>
              )}
            </div>

            {/* SECTION DROPDOWN */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Section
              </label>
              <select
                {...register("section")}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="">Select a Section...</option>
                <option value="Technical Basics">Technical Basics</option>
                <option value="OOP">OOP</option>
                <option value="Problem Solving">Problem Solving</option>
                <option value="Live Scenario">Live Scenario</option>
                <option value="Communication">Communication</option>
              </select>
              {errors.section && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.section.message}
                </p>
              )}
            </div>

            {/* DIFFICULTY DROPDOWN */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Difficulty
              </label>
              <select
                {...register("difficulty")}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              {errors.difficulty && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.difficulty.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isMutating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {isMutating ? "Saving..." : "Save Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
