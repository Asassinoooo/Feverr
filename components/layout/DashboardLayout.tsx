import React from 'react';
import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
}

interface DashboardLayoutProps {
  title: string;
  navItems: NavItem[];
  children: React.ReactNode;
}

export function DashboardLayout({ title, navItems, children }: DashboardLayoutProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-52 flex-shrink-0">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            {title}
          </h2>
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
