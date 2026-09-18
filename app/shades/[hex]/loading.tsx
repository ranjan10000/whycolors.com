// app/shades/[hex]/loading.tsx
export default function ShadesLoading() {
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-[#090911] transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ============================================================
            HERO + HEADER SKELETON
        ============================================================ */}
        <header className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border bg-white/90 border-gray-200 shadow-lg dark:bg-[#131322]/80 dark:border-white/10 dark:shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
              {/* Color swatch skeleton */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gray-200 dark:bg-white/10 animate-pulse" />

              <div className="space-y-3 text-center sm:text-left w-full">
                {/* Hex input skeleton */}
                <div className="flex justify-center sm:justify-start">
                  <div className="h-14 w-52 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse" />
                </div>

                {/* Family pill + count skeleton */}
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <div className="h-7 w-28 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
                  <div className="h-4 w-40 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Format cards skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 w-full lg:w-auto min-w-[280px]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200 dark:border-white/10 p-3 bg-gray-50 dark:bg-white/[0.03]"
                >
                  <div className="h-3 w-10 rounded bg-gray-200 dark:bg-white/10 animate-pulse mb-2" />
                  <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ============================================================
            SEARCH + FILTER SKELETON
        ============================================================ */}
        <div className="flex flex-wrap gap-4 items-center p-4 rounded-xl border bg-white/90 border-gray-200 dark:bg-[#131322]/80 dark:border-white/10">
          <div className="flex-1 min-w-[200px]">
            <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
          </div>

          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-16 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* ============================================================
            COLOR NAMES SKELETON
        ============================================================ */}
        <div className="p-5 rounded-2xl border border-gray-100 bg-white/80 shadow-xl dark:border-white/10 dark:bg-gradient-to-b dark:from-[#18182a]/90 dark:to-[#11111d]/90">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse" />
              <div>
                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-white/10 animate-pulse mb-1" />
                <div className="h-3 w-40 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
              </div>
            </div>
            <div className="h-8 w-24 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
          </div>

          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-24 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* ============================================================
            UNIQUE SHADES GRID SKELETON
        ============================================================ */}
        <div className="p-4 sm:p-5 rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-white/10 dark:bg-gradient-to-b dark:from-[#18182a]/90 dark:to-[#11111d]/90">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse" />
              <div>
                <div className="h-4 w-40 rounded bg-gray-200 dark:bg-white/10 animate-pulse mb-1" />
                <div className="h-3 w-48 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-8 w-32 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
              <div className="h-8 w-24 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0 overflow-hidden rounded-xl">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[1.35/1] bg-gray-200 dark:bg-white/10 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* ============================================================
            SHADES GRID SECTIONS SKELETON
        ============================================================ */}
        {Array.from({ length: 2 }).map((_, sectionIdx) => (
          <section key={sectionIdx} className="space-y-3">
            <div className="h-6 w-40 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden"
                >
                  <div className="aspect-square bg-gray-200 dark:bg-white/10 animate-pulse" />
                  <div className="p-2 bg-white dark:bg-[#0a0a14]">
                    <div className="h-3 w-full rounded bg-gray-200 dark:bg-white/10 animate-pulse mb-1" />
                    <div className="h-2 w-3/4 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* ============================================================
            STATISTICS FOOTER SKELETON
        ============================================================ */}
        <div className="mt-8 p-4 rounded-xl border bg-white/90 border-gray-200 dark:bg-[#131322]/80 dark:border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="h-8 w-16 rounded bg-gray-200 dark:bg-white/10 animate-pulse mx-auto mb-2" />
                <div className="h-3 w-24 rounded bg-gray-200 dark:bg-white/10 animate-pulse mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}