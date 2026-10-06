import { Link } from "react-router-dom";
import { ShieldX, ArrowLeft, Home } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-white flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
          <ShieldX className="w-10 h-10 text-red-400" />
        </div>

        <p className="text-sm font-semibold text-blue-400 mb-3">
          ERROR 403
        </p>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Access denied
        </h1>

        <p className="text-slate-400 leading-7 mb-8">
          You don't have permission to access this area.
          Please return to your dashboard or go back to the website.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/5 transition"
          >
            <Home size={17} />
            Back to home
          </Link>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500 transition"
          >
            <ArrowLeft size={17} />
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
}