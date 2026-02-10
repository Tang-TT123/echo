'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Sidebar } from '@/components/sidebar';
import { EnergySlider } from '@/components/energy-slider';
import { getEnergySuggestion } from '@/lib/energy-suggestion';
import { useState } from 'react';

export default function Home() {
  const [energyLevel, setEnergyLevel] = useState(65);

  // 根据当前能量值获取建议
  const currentSuggestion = getEnergySuggestion(energyLevel);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-[#e5e5e5] dark:border-[#38383a]">
          <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                主页
              </h1>
              <p className="text-sm text-[#86868b] mt-1">
                欢迎回来，今天是探索内在的好日子
              </p>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
          {/* 今日能量卡 */}
          <Card className="p-8 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow">
            <div className="space-y-6">
              {/* 能量显示 */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                    今日能量
                  </h2>
                  <p className="text-sm text-[#86868b]">
                    了解你的状态，做出更明智的选择
                  </p>
                </div>
                <div className="text-4xl font-semibold text-[#0071e3]">
                  {energyLevel}%
                </div>
              </div>

              {/* 可拖动能量滑块 */}
              <EnergySlider value={energyLevel} onChange={setEnergyLevel} />

              {/* 能量建议 */}
              <div className="pt-4 border-t border-[#e5e5e5] dark:border-[#38383a]">
                <div className="flex items-start gap-3">
                  <div className="text-2xl mt-0.5">✨</div>
                  <p className="text-base text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
                    {currentSuggestion}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 快速入口 */}
          <div>
            <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
              快速入口
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/resonance/heart">
                <Card className="p-6 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow hover:card-shadow-hover transition-smooth cursor-pointer group">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-smooth">💭</div>
                  <div className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    写心事
                  </div>
                  <div className="text-sm text-[#86868b]">把情绪卸载下来</div>
                </Card>
              </Link>

              <Link href="/resonance/praise">
                <Card className="p-6 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow hover:card-shadow-hover transition-smooth cursor-pointer group">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-smooth">🌸</div>
                  <div className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    今日夸夸
                  </div>
                  <div className="text-sm text-[#86868b]">给自己一点鼓励</div>
                </Card>
              </Link>

              <Link href="/coexist">
                <Card className="p-6 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow hover:card-shadow-hover transition-smooth cursor-pointer group">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-smooth">🤝</div>
                  <div className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    共生
                  </div>
                  <div className="text-sm text-[#86868b]">关系与相处方式的澄清</div>
                </Card>
              </Link>

              <Link href="/sprite">
                <Card className="p-6 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow hover:card-shadow-hover transition-smooth cursor-pointer group">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-smooth">🧚</div>
                  <div className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    小E精灵
                  </div>
                  <div className="text-sm text-[#86868b]">想聊什么都可以</div>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
