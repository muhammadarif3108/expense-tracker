import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center">
        <h1 className="text-8xl sm:text-9xl font-bold bg-gradient-to-br from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-xl text-gray-300 mt-4 font-medium">Halaman tidak ditemukan</p>
        <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
