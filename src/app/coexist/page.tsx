'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/sidebar';

export default function CoexistPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-[#e5e5e5] dark:border-[#38383a]">
          <div className="max-w-4xl mx-auto px-8 py-4">
            <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              共生 Co-exist
            </h1>
            <p className="text-sm text-[#86868b] mt-1">
              在关系中找到边界与平衡
            </p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* 欢迎卡片 */}
          <Card className="p-8 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow mb-6">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🤝</div>
              <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">
                欢迎来到共生空间
              </h2>
              <p className="text-[#86868b] max-w-lg mx-auto leading-relaxed">
                这里有工具帮助你觉察和记录重要的人际关系。理解边界、平衡付出、发现模式。
                这里没有评判，只有陪伴与探索。
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <Link href="/coexplore" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Button
                  className="bg-[#0071e3] hover:bg-[#0077ed] px-8 py-6 text-base"
                >
                  开始关系导航
                </Button>
              </Link>
              <Link href="/coexist/records" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Button
                  variant="outline"
                  className="border-[#e5e5e5] dark:border-[#38383a] px-8 py-6 text-base"
                >
                  查看澄清记录
                </Button>
              </Link>
            </div>
          </Card>

          {/* 功能说明 */}
          <Card className="p-6 bg-card border-[#e5e5e5] dark:border-[#38383a]">
            <h3 className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
              你可以在这里
            </h3>
            <ul className="text-sm text-[#86868b] space-y-3">
              <li className="flex items-start">
                <span className="mr-3">📝</span>
                <span>
                  记录重要的人际关系，写下你的感受和观察
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3">🔍</span>
                <span>
                  反思关系中的模式，发现重复出现的议题
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3">⚖️</span>
                <span>
                  觉察付出与接收的平衡，建立健康的边界
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3">💾</span>
                <span>
                  所有内容仅保存在本地，完全隐私安全
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}
