import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 gap-8">
        <div>
          <div className="font-bold text-[#3b5fa0] mb-2">Feverr</div>
          <p className="text-sm text-slate-500 max-w-xs">
            A freelance marketplace to find and offer the best creative and digital services.
          </p>
        </div>
        <div className="flex gap-12 justify-end">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-slate-600">
              <li><Link href="/search" className="hover:text-slate-900">Explore Services</Link></li>
              <li><Link href="/seller/gigs/new" className="hover:text-slate-900">Sell Services</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Account
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-slate-600">
              <li><Link href="/login" className="hover:text-slate-900">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-slate-900">Sign Up</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 text-center py-4 text-xs text-slate-400">
        © 2026 Feverr. Created for Database Systems Lab.
      </div>
    </footer>
  );
}
