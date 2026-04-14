export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-4xl font-bold text-slate-800">404</h1>
        <p className="text-slate-600">The page you're looking for doesn't exist.</p>
        <a href="/" className="inline-block rounded-full bg-[#36c1bf] px-6 py-3 font-bold text-white transition hover:bg-[#29aeb2]">
          Go Home
        </a>
      </div>
    </div>
  );
}
