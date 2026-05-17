'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user as any;
  const isSeller = user?.role === 'seller' || user?.role === 'both';

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg text-[#3b5fa0] tracking-tight">
          Feverr
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-600">
          <Link href="/search" className="hover:text-slate-900">
            Jelajahi
          </Link>
          <a href="/seller/gigs" className="hover:text-slate-900">
            Jual Jasa
          </a>
        </nav>

        {/* Auth Area */}
        <div className="hidden sm:flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 hover:opacity-80"
              >
                <Avatar
                  src={null}
                  name={user?.name || 'User'}
                  size={32}
                />
                <span className="text-sm text-slate-700">{user?.name?.split(' ')[0]}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 shadow-md py-1 z-50">
                  <a
                    href="/dashboard/orders"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Pesanan Saya
                  </a>
                  {isSeller && (
                    <a
                      href="/seller/gigs"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Gig Saya
                    </a>
                  )}
                  <a
                    href="/settings/profile"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Pengaturan
                  </a>
                  <a
                    href="/settings/wallet"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dompet
                  </a>
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Daftar
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 text-slate-600"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white py-3 px-4 flex flex-col gap-3">
          <Link href="/search" className="text-sm text-slate-700" onClick={() => setMobileOpen(false)}>
            Jelajahi
          </Link>
          <a href="/seller/gigs" className="text-sm text-slate-700" onClick={() => setMobileOpen(false)}>
            Jual Jasa
          </a>
          {session ? (
            <>
              <a href="/dashboard/orders" className="text-sm text-slate-700" onClick={() => setMobileOpen(false)}>
                Pesanan Saya
              </a>
              {isSeller && (
                <a href="/seller/gigs" className="text-sm text-slate-700" onClick={() => setMobileOpen(false)}>
                  Gig Saya
                </a>
              )}
              <a href="/settings/profile" className="text-sm text-slate-700" onClick={() => setMobileOpen(false)}>
                Pengaturan
              </a>
              <button
                className="text-left text-sm text-red-600"
                onClick={() => {
                  setMobileOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
              >
                Keluar
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="secondary" size="sm">Masuk</Button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" size="sm">Daftar</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
