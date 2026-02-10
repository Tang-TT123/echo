'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/sidebar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigationBack } from '@/hooks/use-navigation-back';
import { getRelationshipClarityCards, deleteRelationshipClarityCard, RelationshipClarityCard } from '@/lib/storage';

const RELATIONSHIP_TYPES = ['伴侣/暧昧对象', '朋友', '家人', '同事/上级', '其他重要的人'];

export default function RecordsPage() {
  const { handleBack } = useNavigationBack('/coexist');

  // 数据状态
  const [cards, setCards] = useState<RelationshipClarityCard[]>([]);
  const [filterRelationType, setFilterRelationType] = useState<string>('all');
  const [filterTheme, setFilterTheme] = useState<string>('all');
  const [filterTimeRange, setFilterTimeRange] = useState<string>('all');

  // 加载数据
  useEffect(() => {
    const loadedCards = getRelationshipClarityCards();
    setCards(loadedCards);
  }, []);

  // 提取所有主题
  const allThemes = useMemo(() => {
    const themes = new Set<string>();
    cards.forEach(card => {
      if (card.theme) {
        // 主题可能是"边界、内耗"这样的组合，需要拆分
        card.theme.split('、').forEach(t => themes.add(t.trim()));
      }
    });
    return Array.from(themes);
  }, [cards]);

  // 筛选数据
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      // 关系类型筛选
      if (filterRelationType !== 'all' && card.relationType !== filterRelationType) {
        return false;
      }

      // 主题筛选
      if (filterTheme !== 'all') {
        const cardThemes = card.theme.split('、').map(t => t.trim());
        if (!cardThemes.includes(filterTheme)) {
          return false;
        }
      }

      // 时间范围筛选
      if (filterTimeRange !== 'all') {
        const now = new Date();
        const cardDate = new Date(card.createdAt);
        const diffDays = Math.floor((now.getTime() - cardDate.getTime()) / (1000 * 60 * 60 * 24));

        if (filterTimeRange === '7days' && diffDays > 7) {
          return false;
        }
        if (filterTimeRange === '30days' && diffDays > 30) {
          return false;
        }
      }

      return true;
    });
  }, [cards, filterRelationType, filterTheme, filterTimeRange]);

  // 删除卡片
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这张关系澄清卡吗？')) {
      deleteRelationshipClarityCard(id);
      setCards(cards.filter(c => c.id !== id));
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
                  关系澄清记录
                </h1>
              </div>
            </div>
            <p className="text-sm text-[#86868b] mt-1 ml-16">
              查看你的关系澄清卡，回顾成长轨迹
            </p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* 筛选栏 */}
          <Card className="p-6 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 关系类型筛选 */}
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                  关系类型
                </label>
                <Select value={filterRelationType} onValueChange={setFilterRelationType}>
                  <SelectTrigger className="bg-background border-[#e5e5e5] dark:border-[#38383a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    {RELATIONSHIP_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 主题筛选 */}
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                  主题
                </label>
                <Select value={filterTheme} onValueChange={setFilterTheme}>
                  <SelectTrigger className="bg-background border-[#e5e5e5] dark:border-[#38383a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    {allThemes.map((theme) => (
                      <SelectItem key={theme} value={theme}>
                        {theme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 时间范围筛选 */}
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                  时间范围
                </label>
                <Select value={filterTimeRange} onValueChange={setFilterTimeRange}>
                  <SelectTrigger className="bg-background border-[#e5e5e5] dark:border-[#38383a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="7days">近7天</SelectItem>
                    <SelectItem value="30days">近30天</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* 卡片列表 */}
          {filteredCards.length === 0 ? (
            <Card className="p-8 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow text-center">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-[#86868b] mb-4">
                {cards.length === 0 ? '还没有关系澄清卡' : '没有符合条件的记录'}
              </p>
              {cards.length === 0 && (
                <p className="text-sm text-[#86868b]">
                  去"关系导航"开始分析一段关系吧
                </p>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCards.map((card) => (
                <Link
                  key={card.id}
                  href={`/coexist/records/${card.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Card className="p-6 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow hover:card-shadow-hover transition-smooth cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            {card.relationType}
                          </Badge>
                          <span className="text-xs text-[#86868b]">
                            {formatDate(card.createdAt)}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                          主题：{card.theme}
                        </div>
                        <div className="text-sm text-[#86868b]">
                          方向：{card.direction}
                        </div>
                      </div>
                      {card.partnerMBTI && (
                        <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {card.partnerMBTI}
                        </Badge>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
