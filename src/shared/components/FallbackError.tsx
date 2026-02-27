import { AlertTriangle } from "lucide-react";

export const ComponentErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex flex-col items-center justify-center text-center">
    <AlertTriangle className="text-red-500 mb-3" size={32} />
    <h3 className="text-sm font-bold text-red-900">Unable to load component</h3>
    <p className="text-xs text-red-700 mt-1 max-w-md">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="mt-4 px-4 py-2 bg-red-100 text-red-800 text-xs font-semibold rounded-lg hover:bg-red-200"
    >
      Try Again
    </button>
  </div>
);
