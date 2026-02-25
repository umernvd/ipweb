import { Clock, HelpCircle, AlertCircle, Sparkles } from "lucide-react";
import { BlueprintFormValues } from "@/core/validators/blueprint.validator";

// Helper to map categories to colors
const getCategoryColor = (category: string) => {
  switch (category) {
    case "behavioral":
      return "bg-blue-500";
    case "technical":
      return "bg-purple-500";
    case "system_design":
      return "bg-orange-500";
    case "experience":
      return "bg-emerald-500";
    default:
      return "bg-slate-400";
  }
};

interface Props {
  data: Partial<BlueprintFormValues>; // Partial because form might be incomplete
}

export const BlueprintPreviewCard = ({ data }: Props) => {
  const structure = data.structure || [];

  // 1. Calculate Totals
  const totalQuestions = structure.reduce(
    (acc, curr) => acc + (curr.questionCount || 0),
    0,
  );
  const totalMinutes = structure.reduce(
    (acc, curr) => acc + (curr.durationMinutes || 0),
    0,
  );

  // 2. Calculate Distribution for the Visual Bar
  const distribution = structure.reduce(
    (acc, curr) => {
      const cat = curr.category || "other";
      acc[cat] = (acc[cat] || 0) + (curr.durationMinutes || 0);
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="sticky top-6 space-y-6">
      {/* CARD 1: OVERVIEW STATS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-900">Blueprint Summary</h3>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Live Preview
          </span>
        </div>

        <div className="p-6 grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-2">
              {totalQuestions}
              <span className="text-sm font-normal text-slate-400 translate-y-1">
                qtns
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wide">
              Total Questions
            </p>
          </div>

          <div className="text-center border-l border-slate-100">
            <div className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-2">
              {totalMinutes}
              <span className="text-sm font-normal text-slate-400 translate-y-1">
                min
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wide">
              Total Duration
            </p>
          </div>
        </div>

        {/* VISUAL DISTRIBUTION BAR */}
        {totalMinutes > 0 && (
          <div className="px-6 pb-6">
            <div className="flex h-2 rounded-full overflow-hidden w-full bg-slate-100">
              {Object.entries(distribution).map(([category, minutes]) => (
                <div
                  key={category}
                  style={{ width: `${(minutes / totalMinutes) * 100}%` }}
                  className={`${getCategoryColor(category)} transition-all duration-500`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
              <span>Start</span>
              <span>End ({totalMinutes}m)</span>
            </div>
          </div>
        )}
      </div>

      {/* CARD 2: CANDIDATE JOURNEY */}
      <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-6 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2 bg-white/10 rounded-lg">
            <Sparkles size={18} className="text-purple-300" />
          </div>
          <div>
            <h3 className="font-semibold">Candidate Journey</h3>
            <p className="text-xs text-slate-400">
              The AI will follow this exact flow
            </p>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          {structure.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-700 rounded-lg">
              Add sections to see the flow
            </div>
          ) : (
            structure.map((section, idx) => (
              <div key={section.id || idx} className="flex gap-4 group">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-purple-400 ring-4 ring-purple-500/20 group-hover:ring-purple-400/40 transition-all" />
                  {idx !== structure.length - 1 && (
                    <div className="w-0.5 h-full bg-slate-700 my-1" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-4">
                  <h4 className="text-sm font-medium text-slate-200">
                    {section.title || (
                      <span className="text-slate-500 italic">
                        Untitled Section
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <HelpCircle size={10} /> {section.questionCount} Questions
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {section.durationMinutes} min
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Footer Warning */}
          {totalMinutes > 60 && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3 text-red-200 text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <p>
                This interview is over 60 minutes. Consider splitting it into
                two sessions to reduce candidate fatigue.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
