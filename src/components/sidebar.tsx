'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  {
    name: '首页',
    href: '/',
    icon: '🏠',
  },
  {
    name: '余音 Resonance',
    href: '/resonance',
    icon: '💭',
  },
  {
    name: '共生 Co-exist',
    href: '/coexist',
    icon: '🤝',
  },
  {
    name: '小E精灵',
    href: '/sprite',
    icon: '🧚',
  },
];

const settingsItem = {
  name: '设置',
  href: '/settings',
  icon: '⚙',
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 glass border-r border-[#e5e5e5] dark:border-[#38383a] z-50">
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#e5e5e5] dark:border-[#38383a]">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              e
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                echo 回声
              </h1>
              <p className="text-xs text-[#86868b]">让深度不再孤独</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 flex flex-col">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-smooth',
                  isActive
                    ? 'bg-[#0071e3] text-white shadow-lg'
                    : 'text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e]'
                )}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}

          {/* 设置项（底部） */}
          <Link
            href={settingsItem.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-smooth mt-auto',
              pathname === settingsItem.href
                ? 'bg-[#0071e3] text-white shadow-lg'
                : 'text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e]'
            )}
          >
            <span className="text-xl">{settingsItem.icon}</span>
            <span className="font-medium text-sm">{settingsItem.name}</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5e5e5] dark:border-[#38383a]">
          <div className="text-xs text-[#86868b] text-center">
            <p>© 2025 echo 回声</p>
            <p className="mt-1">为 INFJ 而生</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
