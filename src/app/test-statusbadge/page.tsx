import { StatusBadge } from '@/shared/components/ui/StatusBadge';

export default function TestStatusBadgePage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">StatusBadge Component Test</h1>
          <p className="text-slate-600">Task 2.3: Implement solid and outlined variants</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4">Solid Variant (Default)</h2>
          <div className="flex gap-4 flex-wrap">
            <StatusBadge status="Active" variant="solid" />
            <StatusBadge status="Pending" variant="solid" />
            <StatusBadge status="Completed" variant="solid" />
            <StatusBadge status="Reviewing" variant="solid" />
          </div>
          <ul className="text-sm text-slate-600 mt-4 space-y-1">
            <li>✓ Solid backgrounds (green-600, yellow-500, blue-600)</li>
            <li>✓ Contrasting text (white or slate-900)</li>
            <li>✓ No pastel backgrounds</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4">Outlined Variant</h2>
          <div className="flex gap-4 flex-wrap">
            <StatusBadge status="Active" variant="outlined" />
            <StatusBadge status="Pending" variant="outlined" />
            <StatusBadge status="Completed" variant="outlined" />
            <StatusBadge status="Reviewing" variant="outlined" />
          </div>
          <ul className="text-sm text-slate-600 mt-4 space-y-1">
            <li>✓ Transparent backgrounds</li>
            <li>✓ Colored borders matching status</li>
            <li>✓ Dot indicator before text</li>
            <li>✓ No pastel backgrounds</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4">Default (No variant prop)</h2>
          <div className="flex gap-4 flex-wrap">
            <StatusBadge status="Active" />
            <StatusBadge status="Pending" />
            <StatusBadge status="Completed" />
            <StatusBadge status="Reviewing" />
          </div>
          <ul className="text-sm text-slate-600 mt-4 space-y-1">
            <li>✓ Defaults to solid variant</li>
          </ul>
        </div>

        <div className="bg-slate-900 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4 text-white">On Dark Background</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-300 mb-2">Solid:</p>
              <div className="flex gap-4 flex-wrap">
                <StatusBadge status="Active" variant="solid" />
                <StatusBadge status="Pending" variant="solid" />
                <StatusBadge status="Completed" variant="solid" />
                <StatusBadge status="Reviewing" variant="solid" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-300 mb-2">Outlined:</p>
              <div className="flex gap-4 flex-wrap">
                <StatusBadge status="Active" variant="outlined" />
                <StatusBadge status="Pending" variant="outlined" />
                <StatusBadge status="Completed" variant="outlined" />
                <StatusBadge status="Reviewing" variant="outlined" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
