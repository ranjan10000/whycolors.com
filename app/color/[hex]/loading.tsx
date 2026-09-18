// app/color/[hex]/loading.tsx
export default function ColorLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#090911] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-6 sm:pt-8">
        {/* ============================================================
            BREADCRUMB SKELETON
        ============================================================ */}
        <nav
          className="flex items-center justify-between gap-2"
          aria-label="Breadcrumb loading"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-6 w-6 rounded-md bg-gray-200 dark:bg-white/10 animate-pulse" />
            <div className="h-4 w-4 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
            <div className="h-6 w-14 rounded-md bg-gray-200 dark:bg-white/10 animate-pulse" />
            <div className="h-4 w-4 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
            <div className="h-7 w-24 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
          </div>

          <div className="h-8 w-20 rounded-md bg-gray-200 dark:bg-white/10 animate-pulse" />
        </nav>

        {/* ============================================================
            H1 SKELETON
        ============================================================ */}
        <div className="mt-4 sm:mt-6 flex items-center gap-3">
          <div className="h-8 sm:h-10 w-48 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
          <div className="h-5 w-20 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
        </div>
      </div>

      {/* ============================================================
          COLOR DETAIL SKELETON (main content)
      ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 mt-8 space-y-6">
        {/* Color preview + format cards */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Left — big color preview */}
            <div className="h-64 sm:h-80 lg:h-auto lg:min-h-[400px] bg-gray-200 dark:bg-white/10 animate-pulse" />

            {/* Right — format values */}
            <div className="p-6 sm:p-8 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-3"
                >
                  <div className="h-4 w-16 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
                  <div className="h-5 w-32 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shades grid skeleton */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-5">
          <div className="h-5 w-32 rounded bg-gray-200 dark:bg-white/10 animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Harmonies / similar colors skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 dark:border-white/10 p-5"
            >
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
              <div className="mt-3 h-6 w-32 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}