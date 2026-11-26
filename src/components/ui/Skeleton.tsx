export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-52 rounded-lg bg-slate-200" />
          <div className="h-4 w-72 rounded-md bg-slate-100" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-emerald-100" />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-slate-100" />
              <div className="h-9 w-9 rounded-xl bg-emerald-50" />
            </div>
            <div className="h-7 w-28 rounded-lg bg-slate-200" />
            <div className="h-3 w-36 rounded bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="h-5 w-36 rounded bg-slate-200" />
          <div className="flex justify-center py-2">
            <div className="h-36 w-36 rounded-full border-12 border-slate-100 bg-slate-50" />
          </div>
          <div className="space-y-3">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-16 rounded bg-slate-100" />
                  <div className="h-3 w-20 rounded bg-slate-100" />
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-44 rounded bg-slate-200" />
            <div className="h-8 w-28 rounded-lg bg-slate-100" />
          </div>
          <div className="h-56 w-full rounded-xl bg-slate-100" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-slate-200" />
        <div className="space-y-3">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 rounded bg-slate-200" />
                  <div className="h-3 w-24 rounded bg-slate-100" />
                </div>
              </div>
              <div className="h-5 w-16 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CaloriesSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-slate-200" />
          <div className="h-4 w-64 rounded-md bg-slate-100" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-44 rounded-xl bg-slate-100" />
          <div className="h-10 w-32 rounded-xl bg-emerald-100" />
        </div>
      </div>

      {/* Summary Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex justify-center">
          <div className="h-36 w-36 rounded-full border-12 border-slate-100 bg-slate-50" />
        </div>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2.5"
            >
              <div className="h-3.5 w-16 rounded bg-slate-200" />
              <div className="h-6 w-24 rounded bg-slate-200" />
              <div className="h-2 w-full rounded-full bg-slate-200/80" />
            </div>
          ))}
        </div>
      </div>

      {/* Meal Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-50" />
                <div className="space-y-1.5">
                  <div className="h-4 w-24 rounded bg-slate-200" />
                  <div className="h-3 w-16 rounded bg-slate-100" />
                </div>
              </div>
              <div className="h-8 w-20 rounded-lg bg-slate-100" />
            </div>
            <div className="space-y-2.5">
              {[0, 1].map((row) => (
                <div
                  key={row}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3"
                >
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="h-3 w-40 rounded bg-slate-100" />
                  </div>
                  <div className="h-4 w-14 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
      {/* Profile Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-emerald-100 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-6 w-48 rounded-lg bg-slate-200" />
          <div className="h-4 w-64 rounded bg-slate-100" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-slate-100" />
      </div>

      {/* Form Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1].map((card) => (
          <div
            key={card}
            className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5"
          >
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="space-y-4">
              {[0, 1, 2, 3].map((field) => (
                <div key={field} className="space-y-2">
                  <div className="h-3.5 w-24 rounded bg-slate-100" />
                  <div className="h-11 w-full rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
