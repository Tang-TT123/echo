'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sidebar } from '@/components/sidebar';
import { BackupSection } from '@/components/backup-section';
import { hasReadyCapsules } from '@/lib/storage';

export default function ResonancePage() {
  const [showCapsuleReminder, setShowCapsuleReminder] = useState(false);

  useEffect(() => {
    // 检查是否有已到期但未打开的胶囊
    const hasReady = hasReadyCapsules();
    setShowCapsuleReminder(hasReady);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-[#e5e5e5] dark:border-[#38383a]">
          <div className="max-w-6xl mx-auto px-8 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                余音 Resonance
              </h1>
              <p className="text-sm text-[#86868b] mt-1">
                情绪安放的空间
              </p>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* 时间胶囊提醒 */}
          {showCapsuleReminder && (
            <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 card-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💌</span>
                  <div>
                    <p className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      有一封来自过去的你，已经准备好了
                    </p>
                    <p className="text-xs text-[#86868b] mt-1">
                      时间胶囊已到期，可以开启查看
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/resonance/capsule">
                    <Button size="sm" className="bg-[#0071e3] hover:bg-[#0077ed]">
                      查看胶囊
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCapsuleReminder(false)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* 功能入口 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 写心事 */}
            <Link href="/resonance/heart">
              <Card className="p-8 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow hover:card-shadow-hover transition-smooth cursor-pointer group">
                <div className="space-y-4">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-smooth">💭</div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                      写心事
                    </h2>
                    <p className="text-sm text-[#86868b] leading-relaxed">
                      把情绪放下来就好，不需要立刻解决
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="text-xs text-[#0071e3]">进入 →</span>
                  </div>
                </div>
              </Card>
            </Link>

            {/* 今日夸夸 */}
            <Link href="/resonance/praise">
              <Card className="p-8 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow hover:card-shadow-hover transition-smooth cursor-pointer group">
                <div className="space-y-4">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-smooth">🌸</div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                      今日夸夸
                    </h2>
                    <p className="text-sm text-[#86868b] leading-relaxed">
                      不尴尬、不过度正能量、可轻量确认
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="text-xs text-[#0071e3]">进入 →</span>
                  </div>
                </div>
              </Card>
            </Link>

            {/* 时间胶囊 */}
            <Link href="/resonance/capsule">
              <Card className="p-8 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow hover:card-shadow-hover transition-smooth cursor-pointer group">
                <div className="space-y-4">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-smooth">🕰️</div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                      时间胶囊
                    </h2>
                    <p className="text-sm text-[#86868b] leading-relaxed">
                      把"现在的你"留给"未来的你"
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="text-xs text-[#0071e3]">进入 →</span>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          {/* 小E精灵引导卡片 */}
          <Card className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-pink-200 dark:border-pink-900 card-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xl shadow-lg">
                  🧚
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                    想随便聊聊？
                  </p>
                  <p className="text-xs text-[#86868b]">
                    去找小E精灵，它什么都愿意听
                  </p>
                </div>
              </div>
              <Link href="/sprite">
                <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                  去聊聊
                </Button>
              </Link>
            </div>
          </Card>

          {/* 模块说明 */}
          <div className="mt-12 text-center">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">
                关于余音
              </h3>
              <p className="text-sm text-[#86868b] leading-relaxed">
                余音是为 INFJ 打造的情绪安放空间。在这里，你可以卸下情绪包袱，
                也可以轻量地肯定自己。没有评判，没有分析，只有陪伴。
              </p>
            </div>
          </div>

          {/* 备份与迁移（辅助功能） */}
          <div className="mt-8">
            <BackupSection />
          </div>
        </div>
      </main>
    </div>
  );
}
