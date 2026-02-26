import { Interview } from "@/core/entities/interview";
import { DriveAssetCard } from "../components/DriveAssetCard";

export const InterviewDetailView = ({
  interview,
}: {
  interview: Interview;
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT COLUMN: The Assets (Audio & CV) */}
      <div className="space-y-6">
        {/* 1. AUDIO CARD: Uses driveFileUrl */}
        <DriveAssetCard
          label="Session Recording"
          subLabel="Listen to the full interview"
          type="audio"
          link={interview.driveFileUrl}
        />

        {/* 2. CV/FOLDER CARD: Uses driveFolderId */}
        {/* Since we don't have a direct CV link, we open the Candidate's Folder */}
        <DriveAssetCard
          label="Candidate Assets"
          subLabel="View CV & Notes in Drive"
          type="folder"
          link={interview.driveFolderId}
        />

        {/* ... Candidate Details Card ... */}
      </div>

      {/* RIGHT COLUMN: AI Summary & Score */}
      <div className="lg:col-span-2 space-y-6">
        {/* ... Your AI Summary / Score Components ... */}
      </div>
    </div>
  );
};
