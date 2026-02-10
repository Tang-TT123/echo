'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeartRecord } from '@/lib/storage';

interface HeartRecordListProps {
  records: HeartRecord[];
  onViewDetail: (record: HeartRecord) => void;
  onTagFilter?: (type: 'mood' | 'scene', value: string) => void;
}

export function HeartRecordList({ records, onViewDetail, onTagFilter }: HeartRecordListProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">💭</div>
        <p className="text-sm text-[#86868b]">
          还没有记录，写下你的第一件心事吧
        </p>
      </div>
    );
  }

  // 格式化时间
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return '今天';
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days} 天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  // 获取内容摘要（前1行或前50字）
  const getContentSummary = (content: string) => {
    const lines = content.split('\n');
    const firstLine = lines[0].trim();
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
  };

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <Card
          key={record.id}
          className="p-4 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow hover:card-shadow-hover transition-smooth cursor-pointer"
          onClick={() => onViewDetail(record)}
        >
          <div className="space-y-3">
            {/* 顶部：情绪标签 + 时间 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {record.tagsEmotion.length > 0 && (
                  <>
                    {record.tagsEmotion.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs bg-[#f5f5f7] dark:bg-[#2c2c2e] border-[#e5e5e5] dark:border-[#38383a] cursor-pointer hover:bg-[#e5e5e5] dark:hover:bg-[#38383a]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTagFilter?.('mood', tag);
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </>
                )}
                {record.tagsEmotion.length === 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-[#f5f5f7] dark:bg-[#2c2c2e] border-[#e5e5e5] dark:border-[#38383a]"
                  >
                    无标签
                  </Badge>
                )}
              </div>
              <span className="text-xs text-[#86868b]">{formatTime(record.createdAt)}</span>
            </div>

            {/* 内容摘要 */}
            <p className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
              {getContentSummary(record.content)}
            </p>

            {/* 底部：能量标签（如果有） */}
            {record.energyTag && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#86868b]">能量:</span>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    record.energyTag === '耗能'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                      : record.energyTag === '充能'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                      : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] border-[#e5e5e5] dark:border-[#38383a]'
                  }`}
                >
                  {record.energyTag}
                </Badge>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
