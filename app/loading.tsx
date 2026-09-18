// app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 dark:bg-[#090911]">
      <div className="w-10 h-10 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}