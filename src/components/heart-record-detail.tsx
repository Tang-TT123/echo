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
import { HeartRecord } from '@/lib/storage';

interface HeartRecordDetailProps {
  record: HeartRecord;
  onClose: () => void;
  onDelete: (id: string) => void;
  onTagFilter?: (type: 'mood' | 'scene', value: string) => void;
}

export function HeartRecordDetail({ record, onClose, onDelete, onTagFilter }: HeartRecordDetailProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    onDelete(record.id);
    setShowDeleteDialog(false);
    onClose();
  };

  // 格式化完整时间
  const formatFullTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Card className="p-8 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow">
        <div className="space-y-6">
          {/* 顶部：返回按钮 + 删除按钮 */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
              onClick={onClose}
            >
              ← 返回
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={() => setShowDeleteDialog(true)}
            >
              删除
            </Button>
          </div>

          {/* 时间 */}
          <div className="text-sm text-[#86868b]">
            {formatFullTime(record.createdAt)}
          </div>

          {/* 情绪标签 */}
          {record.tagsEmotion.length > 0 && (
            <div>
              <div className="text-xs text-[#86868b] mb-2">情绪</div>
              <div className="flex flex-wrap gap-2">
                {record.tagsEmotion.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-[#f5f5f7] dark:bg-[#2c2c2e] border-[#e5e5e5] dark:border-[#38383a] cursor-pointer hover:bg-[#e5e5e5] dark:hover:bg-[#38383a]"
                    onClick={() => onTagFilter?.('mood', tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 发生背景标签 */}
          {record.tagsContext.length > 0 && (
            <div>
              <div className="text-xs text-[#86868b] mb-2">发生背景</div>
              <div className="flex flex-wrap gap-2">
                {record.tagsContext.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-[#f5f5f7] dark:bg-[#2c2c2e] border-[#e5e5e5] dark:border-[#38383a] cursor-pointer hover:bg-[#e5e5e5] dark:hover:bg-[#38383a]"
                    onClick={() => onTagFilter?.('scene', tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 能量标签 */}
          {record.energyTag && (
            <div>
              <div className="text-xs text-[#86868b] mb-2">能量影响</div>
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

          {/* 完整正文 */}
          <div className="pt-4 border-t border-[#e5e5e5] dark:border-[#38383a]">
            <div className="text-base text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed whitespace-pre-wrap">
              {record.content}
            </div>
          </div>
        </div>
      </Card>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-[#e5e5e5] dark:border-[#38383a]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1d1d1f] dark:text-[#f5f5f7]">
              确定要删除这条心事吗？
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#86868b]">
              这条心事将被永久删除，确定要删除吗？
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
