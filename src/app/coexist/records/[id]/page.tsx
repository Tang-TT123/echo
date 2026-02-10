'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/sidebar';
import { Badge } from '@/components/ui/badge';
import { useNavigationBack } from '@/hooks/use-navigation-back';
import { getRelationshipClarityCards, deleteRelationshipClarityCard, RelationshipClarityCard } from '@/lib/storage';

export default function RecordDetailPage() {
  const { handleBack } = useNavigationBack('/coexist/records');
  const params = useParams();
  const router = useRouter();
  const [card, setCard] = useState<RelationshipClarityCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cards = getRelationshipClarityCards();
    const foundCard = cards.find((c) => c.id === params.id);
    setCard(foundCard || null);
    setLoading(false);
  }, [params.id]);

  // 删除卡片
  const handleDelete = () => {
    if (confirm('确定要删除这张关系澄清卡吗？')) {
      deleteRelationshipClarityCard(params.id as string);
      router.push('/coexist/records');
    }
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar />
        <main className="ml-64">
          <header className="sticky top-0 z-40 glass border-b border-[#e5e5e5] dark:border-[#38383a]">
            <div className="max-w-4xl mx-auto px-8 py-4">
              <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                关系澄清卡详情
              </h1>
            </div>
          </header>
          <div className="max-w-4xl mx-auto px-8 py-8">
            <div className="text-center py-12">
              <p className="text-[#86868b]">加载中...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar />
        <main className="ml-64">
          <header className="sticky top-0 z-40 glass border-b border-[#e5e5e5] dark:border-[#38383a]">
            <div className="max-w-4xl mx-auto px-8 py-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] h-8 px-2"
                  onClick={handleBack}
                >
                  ← 返回
                </Button>
                <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  关系澄清卡详情
                </h1>
              </div>
            </div>
          </header>
          <div className="max-w-4xl mx-auto px-8 py-8">
            <Card className="p-8 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow text-center">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-[#86868b] mb-4">未找到这张关系澄清卡</p>
              <Button onClick={handleBack} className="bg-[#0071e3] hover:bg-[#0077ed]">
                返回列表
              </Button>
            </Card>
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
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] h-8 px-2"
                onClick={handleBack}
              >
                ← 返回
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  关系澄清卡详情
                </h1>
              </div>
            </div>
            <p className="text-sm text-[#86868b] mt-1 ml-16">
              查看详细信息和成长记录
            </p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-8 py-8">
          <Card className="p-8 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow">
            {/* 日期 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#86868b] mb-2">
                创建日期
              </label>
              <div className="text-base text-[#1d1d1f] dark:text-[#f5f5f7]">
                {formatDate(card.createdAt)}
              </div>
            </div>

            {/* 关系类型 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#86868b] mb-2">
                关系类型
              </label>
              <div>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-sm">
                  {card.relationType}
                </Badge>
              </div>
            </div>

            {/* 主题 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#86868b] mb-2">
                主题
              </label>
              <div className="text-base text-[#1d1d1f] dark:text-[#f5f5f7]">
                {card.theme}
              </div>
            </div>

            {/* 方向 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#86868b] mb-2">
                方向
              </label>
              <div className="text-base text-[#1d1d1f] dark:text-[#f5f5f7]">
                {card.direction}
              </div>
            </div>

            {/* 对方 MBTI（可选） */}
            {card.partnerMBTI && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#86868b] mb-2">
                  对方 MBTI
                </label>
                <div>
                  <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-sm">
                    {card.partnerMBTI}
                  </Badge>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-6 border-t border-[#e5e5e5] dark:border-[#38383a]">
              <Link href={`/coexist/records/${params.id}/chat`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                <Button
                  className="w-full bg-[#0071e3] hover:bg-[#0077ed]"
                >
                  👉 进入关系对话
                </Button>
              </Link>
              <Button
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={handleDelete}
              >
                删除
              </Button>
            </div>

            {/* 隐私说明 */}
            <div className="mt-6 pt-6 border-t border-[#e5e5e5] dark:border-[#38383a]">
              <p className="text-xs text-[#86868b] text-center">
                此卡片仅保存结构化信息，不包含原始补充描述等隐私内容
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
