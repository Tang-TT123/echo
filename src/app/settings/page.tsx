'use client';

import { Card } from '@/components/ui/card';
import { Sidebar } from '@/components/sidebar';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-[#e5e5e5] dark:border-[#38383a]">
          <div className="max-w-4xl mx-auto px-8 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                设置
              </h1>
              <p className="text-sm text-[#86868b] mt-1">
                关于应用
              </p>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* 数据与隐私 */}
          <Card className="p-6 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                  数据与隐私
                </h2>
                <p className="text-sm text-[#86868b]">
                  所有数据默认仅保存在浏览器本地，你可以前往「余音」板块导出备份。
                </p>
              </div>
            </div>
          </Card>

          {/* 关于 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[#86868b]">
              echo 回声 · 为 INFJ 而生 · 版本 1.0.0
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
