export default function DashboardRouteLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading dashboard content">
      <div className="h-32 rounded-2xl bg-slate-100" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="h-56 rounded-2xl bg-slate-100" />
        <div className="h-56 rounded-2xl bg-slate-100" />
        <div className="h-56 rounded-2xl bg-slate-100" />
      </div>
      <div className="h-48 rounded-2xl bg-slate-100" />
    </div>
  );
}
