"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Download,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface CSVRow {
  "Question Text": string;
  "Role Name": string;
  "Experience Level": string;
  Category?: string;
  Difficulty?: string;
}

interface BulkUploadResult {
  success: boolean;
  successCount: number;
  totalCount: number;
  errors: Array<{
    row: number;
    message: string;
    data: CSVRow;
  }>;
}

interface BulkQuestionUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BulkQuestionUpload = ({
  isOpen,
  onClose,
  onSuccess,
}: BulkQuestionUploadProps) => {
  const { companyId } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CSVRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(
    null,
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setParseError("Please select a CSV file");
      return;
    }

    setFile(selectedFile);
    setParseError(null);
    setUploadResult(null);

    // Parse CSV using Papaparse
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError(`CSV parsing error: ${results.errors[0].message}`);
          return;
        }

        const data = results.data as CSVRow[];

        // Validate required columns
        if (data.length === 0) {
          setParseError("CSV file is empty");
          return;
        }

        const firstRow = data[0];
        const requiredColumns = [
          "Question Text",
          "Role Name",
          "Experience Level",
        ];
        const missingColumns = requiredColumns.filter(
          (col) => !(col in firstRow),
        );

        if (missingColumns.length > 0) {
          setParseError(
            `Missing required columns: ${missingColumns.join(", ")}`,
          );
          return;
        }

        // Filter out rows with empty required fields
        const validData = data.filter(
          (row) =>
            row["Question Text"]?.trim() &&
            row["Role Name"]?.trim() &&
            row["Experience Level"]?.trim(),
        );

        if (validData.length === 0) {
          setParseError(
            "No valid rows found. Please ensure all required fields are filled.",
          );
          return;
        }

        setParsedData(validData);
      },
      error: (error) => {
        setParseError(`Failed to parse CSV: ${error.message}`);
      },
    });
  };

  const handleUpload = async () => {
    if (!companyId || parsedData.length === 0) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const response = await fetch("/api/questions/bulk-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId,
          questions: parsedData.map((row) => ({
            questionText: row["Question Text"].trim(),
            roleName: row["Role Name"].trim(),
            experienceLevel: row["Experience Level"].trim(),
            category: row["Category"]?.trim() || "General",
            difficulty: row["Difficulty"]?.trim() || "Medium",
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setUploadResult(result);

      if (result.success && result.errors.length === 0) {
        // All questions uploaded successfully
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      setParseError(error.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Question Text,Role Name,Experience Level,Category,Difficulty
"What is your experience with React?","Frontend Developer","Junior","Technical","Easy"
"Describe a challenging project you worked on","Project Manager","Senior","Behavioral","Medium"
"How do you handle conflicts in a team?","Team Lead","Mid-level","Behavioral","Medium"`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "question_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFile(null);
    setParsedData([]);
    setParseError(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Bulk Import Questions
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Upload multiple questions via CSV file
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-700 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Template Download */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="text-blue-600 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="font-medium text-blue-900">Need a template?</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Download our CSV template with the correct format and example
                  data.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-2 mt-2 text-sm font-medium text-blue-700 hover:text-blue-800"
                >
                  <Download size={16} />
                  Download Template
                </button>
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select CSV File
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                file
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-300 hover:border-slate-400 bg-slate-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload
                  className={`mx-auto mb-3 ${file ? "text-emerald-600" : "text-slate-700"}`}
                  size={32}
                />
                {file ? (
                  <div>
                    <p className="text-emerald-700 font-medium">{file.name}</p>
                    <p className="text-sm text-emerald-600 mt-1">
                      {parsedData.length} valid questions found
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-600 font-medium">
                      Click to upload CSV file
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Required columns: Question Text, Role Name, Experience
                      Level
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Parse Error */}
          {parseError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-0.5" size={20} />
                <div>
                  <h3 className="font-medium text-red-900">Upload Error</h3>
                  <p className="text-sm text-red-700 mt-1">{parseError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div
              className={`mb-6 p-4 border rounded-lg ${
                uploadResult.success
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {uploadResult.success ? (
                  <CheckCircle className="text-emerald-600 mt-0.5" size={20} />
                ) : (
                  <AlertCircle className="text-red-600 mt-0.5" size={20} />
                )}
                <div className="flex-1">
                  <h3
                    className={`font-medium ${
                      uploadResult.success ? "text-emerald-900" : "text-red-900"
                    }`}
                  >
                    {uploadResult.success ? "Upload Complete" : "Upload Failed"}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      uploadResult.success ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {uploadResult.successCount} of {uploadResult.totalCount}{" "}
                    questions imported successfully
                  </p>

                  {uploadResult.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-red-900 mb-2">
                        {uploadResult.errors.length} questions failed:
                      </p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {uploadResult.errors.map((error, index) => (
                          <div
                            key={index}
                            className="text-xs text-red-700 bg-red-100 p-2 rounded"
                          >
                            <span className="font-medium">
                              Row {error.row}:
                            </span>{" "}
                            {error.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {parsedData.length > 0 && !uploadResult && (
            <div className="mb-6">
              <h3 className="font-medium text-slate-900 mb-3">
                Preview ({parsedData.length} questions)
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-3 font-medium text-slate-700">
                          Question
                        </th>
                        <th className="text-left p-3 font-medium text-slate-700">
                          Role
                        </th>
                        <th className="text-left p-3 font-medium text-slate-700">
                          Level
                        </th>
                        <th className="text-left p-3 font-medium text-slate-700">
                          Category
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedData.slice(0, 5).map((row, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-900 max-w-xs truncate">
                            {row["Question Text"]}
                          </td>
                          <td className="p-3 text-slate-600">
                            {row["Role Name"]}
                          </td>
                          <td className="p-3 text-slate-600">
                            {row["Experience Level"]}
                          </td>
                          <td className="p-3 text-slate-600">
                            {row["Category"] || "General"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedData.length > 5 && (
                  <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-sm text-slate-500">
                    ... and {parsedData.length - 5} more questions
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={resetForm}
            className="text-sm text-slate-600 hover:text-slate-800"
            disabled={isUploading}
          >
            Reset
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={
                parsedData.length === 0 || isUploading || !!uploadResult
              }
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading
                ? "Uploading..."
                : `Import ${parsedData.length} Questions`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
