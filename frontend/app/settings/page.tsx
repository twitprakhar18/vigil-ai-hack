"use client";

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-400">Brand configuration and integrations</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {[
          { label: "Brand Name", value: "Housing.com" },
          { label: "Brand URL", value: "housing.com" },
          { label: "Brand Voice", value: "Empathetic" },
          { label: "Competitors", value: "MagicBricks, 99acres, NoBroker" },
          { label: "Alert Threshold", value: "Reach > 5,000 or Triage = Urgent" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-5 py-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-sm font-medium text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Connected Platforms</h2>
        <div className="space-y-3">
          {[
            { name: "X (Twitter)", status: "connected" },
            { name: "Reddit", status: "connected" },
            { name: "Google Reviews", status: "connected" },
            { name: "Play Store", status: "connected" },
            { name: "WhatsApp Business", status: "disconnected" },
          ].map(({ name, status }) => (
            <div key={name} className="flex items-center justify-between">
              <p className="text-sm text-slate-700">{name}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  status === "connected"
                    ? "bg-green-50 text-green-600"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
