'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HeartRecord } from '@/lib/storage';

interface EmotionMapProps {
  records: HeartRecord[];
}

export function EmotionMap({ records }: EmotionMapProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  // 根据时间范围筛选记录
  const filteredRecords = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // 本周一开始
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    if (timeRange === 'week') {
      return records.filter(r => new Date(r.createdAt) >= weekStart);
    } else {
      return records.filter(r => new Date(r.createdAt) >= monthStart);
    }
  }, [records, timeRange]);

  // 统计情绪标签频率
  const emotionFrequency = useMemo(() => {
    const frequency: Record<string, number> = {};

    filteredRecords.forEach(record => {
      record.tagsEmotion.forEach(tag => {
        frequency[tag] = (frequency[tag] || 0) + 1;
      });
    });

    // 按频率排序
    const sorted = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
    const totalCount = sorted.reduce((sum, [_, count]) => sum + count, 0);

    return { data: sorted, totalCount };
  }, [filteredRecords]);

  // 如果没有记录
  if (emotionFrequency.data.length === 0) {
    return (
      <Card className="p-6 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow">
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm text-[#86868b]">
            {timeRange === 'week' ? '本周还没有记录' : '本月还没有记录'}
          </p>
        </div>
      </Card>
    );
  }

  // 获取最大频率，用于计算比例
  const maxCount = emotionFrequency.data[0][1];

  return (
    <Card className="p-6 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow">
      {/* 标题和时间范围切换 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
          情绪地图
        </h3>
        <div className="flex gap-1">
          <Button
            variant={timeRange === 'week' ? 'default' : 'ghost'}
            size="sm"
            className={`text-xs ${
              timeRange === 'week'
                ? 'bg-[#0071e3] text-white'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
            }`}
            onClick={() => setTimeRange('week')}
          >
            本周
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'ghost'}
            size="sm"
            className={`text-xs ${
              timeRange === 'month'
                ? 'bg-[#0071e3] text-white'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
            }`}
            onClick={() => setTimeRange('month')}
          >
            本月
          </Button>
        </div>
      </div>

      {/* 情绪分布图 */}
      <div className="space-y-3 mb-6">
        {emotionFrequency.data.map(([emotion, count]) => {
          const percentage = (count / emotionFrequency.totalCount * 100).toFixed(1);
          const barWidth = (count / maxCount * 100);

          return (
            <div key={emotion} className="flex items-center gap-3">
              <div className="w-16 flex-shrink-0">
                <Badge variant="outline" className="text-xs bg-[#f5f5f7] dark:bg-[#2c2c2e] border-[#e5e5e5] dark:border-[#38383a] w-full justify-center">
                  {emotion}
                </Badge>
              </div>
              <div className="flex-1 h-6 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <div className="w-16 flex-shrink-0 text-right">
                <span className="text-xs text-[#86868b]">
                  {count}次
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 中性说明 */}
      <div className="pt-4 border-t border-[#e5e5e5] dark:border-[#38383a]">
        <p className="text-xs text-[#86868b] text-center">
          这是最近一段时间，你记录下来的情绪分布情况。
        </p>
      </div>
    </Card>
  );
}
