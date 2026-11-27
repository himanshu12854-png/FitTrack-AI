export default function AuthLoading() {
  return (
    <div className="w-full max-w-md mx-auto space-y-5 animate-pulse" aria-label="Loading authentication page">
      <div className="h-7 w-48 rounded bg-slate-200" />
      <div className="h-4 w-72 rounded bg-slate-100" />
      <div className="space-y-3 pt-2">
        <div className="h-10 rounded-lg bg-slate-100" />
        <div className="h-10 rounded-lg bg-slate-100" />
        <div className="h-11 rounded-xl bg-emerald-100" />
      </div>
    </div>
  );
}
