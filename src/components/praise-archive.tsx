'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PraiseRecord } from '@/lib/storage';

interface PraiseArchiveProps {
  records: PraiseRecord[];
  onDelete: (id: string) => void;
  onToggleLowEnergy: (id: string) => void;
}

export function PraiseArchive({ records, onDelete, onToggleLowEnergy }: PraiseArchiveProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [filterLowEnergy, setFilterLowEnergy] = useState(false);

  // 按日期分组记录
  const groupedRecords = (() => {
    const groups: Record<string, PraiseRecord[]> = {};

    records.forEach((record) => {
      // 低能量筛选
      if (filterLowEnergy && !record.isLowMoment) {
        return;
      }

      const dateKey = new Date(record.createdAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(record);
    });

    return groups;
  })();

  // 删除记录
  const handleDelete = () => {
    if (recordToDelete) {
      onDelete(recordToDelete);
      setRecordToDelete(null);
    }
    setShowDeleteDialog(false);
  };

  // 确认删除
  const confirmDelete = (id: string) => {
    setRecordToDelete(id);
    setShowDeleteDialog(true);
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 如果没有记录
  if (Object.keys(groupedRecords).length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">🌸</div>
        <p className="text-sm text-[#86868b]">
          {filterLowEnergy ? '还没有标记为低能量时刻的记录' : '还没有夸夸记录'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 筛选栏 */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant={filterLowEnergy ? 'default' : 'outline'}
            size="sm"
            className={`text-xs ${
              filterLowEnergy
                ? 'bg-[#0071e3] text-white'
                : 'border-[#e5e5e5] dark:border-[#38383a] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
            }`}
            onClick={() => setFilterLowEnergy(!filterLowEnergy)}
          >
            低能量时刻
          </Button>
          <span className="text-xs text-[#86868b]">
            {filterLowEnergy ? '仅显示标记为低能量的记录' : '显示所有记录'}
          </span>
        </div>
      </div>

      {/* 按日期分组的记录 */}
      {Object.entries(groupedRecords)
        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
        .map(([date, records]) => (
          <div key={date} className="mb-6">
            <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">
              {date}
            </h3>
            <div className="space-y-3">
              {records.map((record) => (
                <Card
                  key={record.id}
                  className="p-5 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow"
                >
                  <div className="space-y-4">
                    {/* 顶部：时间 + 操作按钮 */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#86868b]">{formatTime(record.createdAt)}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`text-xs h-7 px-2 ${
                            record.isLowMoment
                              ? 'text-red-600 hover:text-red-700'
                              : 'text-[#86868b] hover:text-red-600'
                          }`}
                          onClick={() => onToggleLowEnergy(record.id)}
                        >
                          {record.isLowMoment ? '★ 低能量时刻' : '☆ 标记低能量'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 h-7 px-2"
                          onClick={() => confirmDelete(record.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </div>

                    {/* 语气模式标签 */}
                    <Badge
                      variant="outline"
                      className="text-xs bg-[#f5f5f7] dark:bg-[#2c2c2e] border-[#e5e5e5] dark:border-[#38383a]"
                    >
                      {record.toneMode === 'gentle'
                        ? '温柔型'
                        : record.toneMode === 'neutral'
                        ? '中性型'
                        : '克制型'}
                    </Badge>

                    {/* 三条内容 */}
                    <div className="space-y-3">
                      {record.line1 && (
                        <div>
                          <div className="text-xs text-[#86868b] mb-1">做对的一件小事</div>
                          <p className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
                            {record.line1}
                          </p>
                        </div>
                      )}

                      {record.line2 && (
                        <div>
                          <div className="text-xs text-[#86868b] mb-1">没有放弃的地方</div>
                          <p className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
                            {record.line2}
                          </p>
                        </div>
                      )}

                      {record.line3 && (
                        <div>
                          <div className="text-xs text-[#86868b] mb-1">对自己说的一句话</div>
                          <p className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
                            {record.line3}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-[#e5e5e5] dark:border-[#38383a]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1d1d1f] dark:text-[#f5f5f7]">
              确定要删除这条记录吗？
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#86868b]">
              这条记录将被永久删除，确定要删除吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#e5e5e5] dark:border-[#38383a]">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
