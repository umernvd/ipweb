import {
  ExternalLink,
  AlertTriangle,
  FileText,
  FolderOpen,
  PlayCircle,
} from "lucide-react";

interface DriveAssetProps {
  label: string;
  link?: string | null;
  type: "audio" | "folder";
  subLabel?: string;
}

export const DriveAssetCard = ({
  label,
  link,
  type,
  subLabel,
}: DriveAssetProps) => {
  // 1. Handling Missing Links (Safety Check)
  if (!link) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg opacity-60 flex items-center gap-3">
        <div className="p-2 bg-slate-200 rounded-md">
          <AlertTriangle size={16} className="text-slate-500" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-700">{label}</h4>
          <p className="text-xs text-slate-500">Not uploaded yet</p>
        </div>
      </div>
    );
  }

  // 2. Logic to construct the URL if we only have an ID (Safe Fallback)
  // If 'link' looks like an ID (no https), we wrap it. Otherwise we use it as-is.
  const finalUrl = link.startsWith("http")
    ? link
    : type === "folder"
      ? `https://drive.google.com/drive/folders/${link}`
      : link;

  return (
    <div className="group relative p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          {/* Icon based on type */}
          <div
            className={`p-3 rounded-lg ${type === "audio" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}`}
          >
            {type === "audio" ? (
              <PlayCircle size={24} />
            ) : (
              <FolderOpen size={24} />
            )}
          </div>

          <div>
            <h4 className="font-semibold text-slate-900">{label}</h4>
            <p className="text-xs text-slate-500">
              {subLabel || "Hosted on Company Drive"}
            </p>
          </div>
        </div>

        {/* The Action Button */}
        <a
          href={finalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium group-hover:bg-blue-600 group-hover:text-white transition-colors"
        >
          Open <ExternalLink size={14} />
        </a>
      </div>

      {/* Security Hint */}
      <div className="mt-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
        <span className="text-[10px] text-slate-400">
          Ensure you are logged into the <b>Company Gmail</b> to view.
        </span>
      </div>
    </div>
  );
};
