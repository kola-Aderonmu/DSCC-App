export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">Welcome to your Dashboard</h2>
      <p className="text-slate-600">
        Your smart digital card workspace is ready.
      </p>
      <div className="mt-8 rounded-xl bg-indigo-50 p-6 text-indigo-700">
        <p className="font-medium">Success!</p>
        <p className="text-sm">You have successfully logged in and the dashboard is rendering.</p>
      </div>
    </div>
  );
}

