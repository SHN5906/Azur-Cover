export default function AdminLoading() {
  return (
    <main className="mx-auto max-w-3xl p-10">
      <div className="animate-pulse space-y-6">
        <div className="h-7 w-48 bg-line/60" />
        <div className="h-4 w-72 bg-line/40" />
        <div className="mt-8 space-y-3">
          <div className="h-14 w-full bg-line/40" />
          <div className="h-14 w-full bg-line/40" />
          <div className="h-14 w-4/5 bg-line/40" />
        </div>
      </div>
    </main>
  );
}
