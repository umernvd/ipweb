"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  HardDrive,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";

export const GoogleDriveConnect = () => {
  const { companyId } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch connection status on mount
  useEffect(() => {
    const fetchConnectionStatus = async () => {
      if (!companyId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/auth/google/status?companyId=${companyId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch status");
        }

        const data = await response.json();
        setIsConnected(data.isConnected);
        setError(null);
      } catch (err) {
        console.error("Failed to check Drive connection status:", err);
        setError("Failed to check connection status");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnectionStatus();

    // Check for callback messages in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "google_drive_connected") {
      setSuccess("Google Drive connected successfully!");
      setIsConnected(true);
      // Clear success message after 3 seconds
      const timer = setTimeout(() => setSuccess(null), 3000);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return () => clearTimeout(timer);
    }
    if (params.get("error")) {
      const errorMsg = params.get("error");
      setError(`Connection failed: ${errorMsg}`);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [companyId]);

  const handleConnect = async () => {
    if (!companyId) {
      setError("Company ID not found");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Redirect to Google OAuth login
      window.location.href = `/api/auth/google/login?companyId=${companyId}`;
    } catch (err) {
      setIsConnecting(false);
      setError("Failed to initiate Google Drive connection");
      console.error("Error connecting to Google Drive:", err);
    }
  };

  const handleDisconnect = async () => {
    if (!companyId) {
      setError("Company ID not found");
      return;
    }

    setIsDisconnecting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/google/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId }),
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect");
      }

      setIsConnected(false);
      setSuccess("Google Drive disconnected successfully");
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error disconnecting from Google Drive:", err);
      setError("Failed to disconnect Google Drive");
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <HardDrive className="w-5 h-5 text-slate-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Google Drive Integration
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              Connect your company's Google Drive to enable automated file
              uploads and document management for interviews.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 shrink-0">
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-500">Checking...</span>
          </div>
        ) : isConnected ? (
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">
                Connected
              </span>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="px-3 py-2 bg-red-50 hover:bg-red-100 disabled:bg-slate-100 text-red-600 disabled:text-slate-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Disconnect
                </>
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Drive"
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="px-6 py-3 bg-red-50 border-t border-slate-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="px-6 py-3 bg-emerald-50 border-t border-slate-200 flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-sm text-emerald-600">{success}</p>
        </div>
      )}
    </div>
  );
};
