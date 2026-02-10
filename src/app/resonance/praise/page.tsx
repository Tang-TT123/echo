'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Sidebar } from '@/components/sidebar';
import { PraiseArchive } from '@/components/praise-archive';
import { useNavigationBack } from '@/hooks/use-navigation-back';
import { PraiseTone, toneConfigs, getPlaceholder, getSaveFeedback } from '@/lib/praise-text';
import { getPraiseRecords, addPraiseRecord, deletePraiseRecord, updatePraiseRecordLowMoment, PraiseRecord } from '@/lib/storage';

export default function PraisePage() {
  const { handleBack } = useNavigationBack('/resonance');
  const [smallThing, setSmallThing] = useState('');
  const [notGiveUp, setNotGiveUp] = useState('');
  const [sayToSelf, setSayToSelf] = useState('');
  const [tone, setTone] = useState<PraiseTone>('restrained');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  // 夸夸存档记录
  const [records, setRecords] = useState<PraiseRecord[]>([]);
  const [showArchive, setShowArchive] = useState(false);

  // 从 localStorage 加载记录
  useEffect(() => {
    const loadedRecords = getPraiseRecords();
    setRecords(loadedRecords);
  }, []);

  // 保存夸夸
  const handleSave = () => {
    // 至少有一条内容
    if (!smallThing.trim() && !notGiveUp.trim() && !sayToSelf.trim()) {
      return;
    }

    const newRecord: PraiseRecord = {
      id: Date.now().toString(),
      type: 'praise',
      line1: smallThing.trim(),      // 我今天做对的一件小事
      line2: notGiveUp.trim(),       // 我今天没有放弃的地方
      line3: sayToSelf.trim(),       // 我愿意对自己说一句
      toneMode: tone,                // 语气模式
      createdAt: new Date(),
      isLowMoment: false,            // 低能量时刻标记（可选）
    };

    // 保存到 localStorage
    addPraiseRecord(newRecord);

    // 添加到列表
    setRecords((prev) => [newRecord, ...prev]);

    // 显示反馈
    setFeedbackText(getSaveFeedback(tone));
    setShowFeedback(true);

    // 清空表单
    setSmallThing('');
    setNotGiveUp('');
    setSayToSelf('');

    // 3秒后隐藏反馈
    setTimeout(() => {
      setShowFeedback(false);
    }, 3000);
  };

  // 切换语气模式
  const toggleTone = (newTone: PraiseTone) => {
    setTone(newTone);
  };

  // 切换存档视图
  const handleToggleArchive = () => {
    setShowArchive(!showArchive);
  };

  // 删除记录
  const handleDelete = (id: string) => {
    // 从 localStorage 删除
    deletePraiseRecord(id);
    // 从状态中删除
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // 切换低能量标记
  const handleToggleLowEnergy = (id: string) => {
    // 找到记录并更新
    const record = records.find(r => r.id === id);
    if (record) {
      const newIsLowMoment = !record.isLowMoment;
      // 更新 localStorage
      updatePraiseRecordLowMoment(id, newIsLowMoment);
      // 更新状态
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isLowMoment: newIsLowMoment } : r))
      );
    }
  };

  if (showArchive) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar />

        <main className="ml-64">
          <header className="sticky top-0 z-40 glass border-b border-[#e5e5e5] dark:border-[#38383a]">
            <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
                onClick={handleToggleArchive}
              >
                ← 返回
              </Button>
              <h1 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                夸夸存档
              </h1>
              <div className="w-12" />
            </div>
          </header>

          <div className="max-w-4xl mx-auto px-8 py-8">
            <PraiseArchive
              records={records}
              onDelete={handleDelete}
              onToggleLowEnergy={handleToggleLowEnergy}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-[#e5e5e5] dark:border-[#38383a]">
          <div className="max-w-4xl mx-auto px-8 py-4">
            {/* 面包屑 + 返回按钮 + 标题 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* 返回按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] h-8 px-2"
                  onClick={handleBack}
                >
                  ← 返回
                </Button>

                {/* 面包屑 + 标题 */}
                <div>
                  {/* 面包屑 */}
                  <div className="flex items-center gap-2 text-xs text-[#86868b] mb-1">
                    <Link href="/resonance" className="hover:text-[#0071e3]">
                      余音
                    </Link>
                    <span>/</span>
                    <span>今日夸夸</span>
                  </div>
                  {/* 标题 */}
                  <h1 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    今日夸夸
                  </h1>
                </div>
              </div>

              {/* 右侧按钮 */}
              <Button
                variant="outline"
                size="sm"
                className="border-[#e5e5e5] dark:border-[#38383a]"
                onClick={handleToggleArchive}
              >
                查看存档
              </Button>
            </div>
            <p className="text-sm text-[#86868b] mt-1 ml-16">
              不尴尬、不过度正能量、可轻量确认
            </p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* 语气模式切换（低存在感） */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs text-[#86868b]">语气模式：</span>
            {toneConfigs.map((config) => (
              <Button
                key={config.id}
                variant={tone === config.id ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs ${
                  tone === config.id
                    ? 'bg-[#0071e3] text-white'
                    : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                }`}
                onClick={() => toggleTone(config.id)}
              >
                {config.label}
              </Button>
            ))}
            <span className="text-xs text-[#86868b]">（{toneConfigs.find((c) => c.id === tone)?.description}）</span>
          </div>

          {/* 夸夸输入区 */}
          <Card className="p-6 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow">
            <div className="space-y-5">
              {/* 我今天做对的一件小事 */}
              <div>
                <label className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] block mb-2">
                  我今天做对的一件小事
                </label>
                <Textarea
                  value={smallThing}
                  onChange={(e) => setSmallThing(e.target.value)}
                  placeholder={getPlaceholder(tone, 'smallThing')}
                  className="min-h-[80px] text-sm leading-relaxed resize-none border-[#e5e5e5] dark:border-[#38383a] focus:border-blue-500 dark:focus:border-blue-500"
                />
              </div>

              {/* 我今天没有放弃的地方 */}
              <div>
                <label className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] block mb-2">
                  我今天没有放弃的地方
                </label>
                <Textarea
                  value={notGiveUp}
                  onChange={(e) => setNotGiveUp(e.target.value)}
                  placeholder={getPlaceholder(tone, 'notGiveUp')}
                  className="min-h-[80px] text-sm leading-relaxed resize-none border-[#e5e5e5] dark:border-[#38383a] focus:border-blue-500 dark:focus:border-blue-500"
                />
              </div>

              {/* 我愿意对自己说一句 */}
              <div>
                <label className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] block mb-2">
                  我愿意对自己说一句
                </label>
                <Textarea
                  value={sayToSelf}
                  onChange={(e) => setSayToSelf(e.target.value)}
                  placeholder={getPlaceholder(tone, 'sayToSelf')}
                  className="min-h-[80px] text-sm leading-relaxed resize-none border-[#e5e5e5] dark:border-[#38383a] focus:border-blue-500 dark:focus:border-blue-500"
                />
              </div>

              {/* 保存按钮 */}
              <div className="flex items-center justify-between pt-4 border-t border-[#e5e5e5] dark:border-[#38383a]">
                <p className="text-xs text-[#86868b]">
                  所有输入均可跳过，至少填写一条即可保存
                </p>
                <div className="flex items-center gap-3">
                  {showFeedback && (
                    <span className="text-sm text-[#0071e3] animate-in fade-in slide-in-from-bottom-2">
                      {feedbackText}
                    </span>
                  )}
                  <Button
                    className="bg-[#0071e3] hover:bg-[#0077ed]"
                    onClick={handleSave}
                    disabled={!smallThing.trim() && !notGiveUp.trim() && !sayToSelf.trim()}
                  >
                    保存
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* 底部静态提示 */}
          <div className="mt-8 text-center">
            <p className="text-xs text-[#86868b]">
              这些话，未来的你也许会想再看看。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
