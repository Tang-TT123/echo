'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  downloadBackupFile,
  importBackup,
  readFileAsText,
  ImportResult,
} from '@/lib/backup';

export function BackupSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportResult, setExportResult] = useState<{ filename: string; recordCount: number } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // 处理导出备份
  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);
    setImportResult(null);
    try {
      const result = downloadBackupFile();
      setExportResult(result);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // 处理导入备份
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const jsonData = await readFileAsText(file);
      const result = importBackup(jsonData);
      setImportResult(result);

      // 如果导入成功，3秒后关闭对话框
      if (result.success) {
        setTimeout(() => {
          setDialogOpen(false);
          setImportResult(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        success: false,
        heartRecordsAdded: 0,
        praiseRecordsAdded: 0,
        capsulesAdded: 0,
        error: '读取文件失败',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="p-6 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            数据备份与迁移
          </h3>
          <p className="text-sm text-[#86868b] mt-1">
            导出或导入你的本地记录
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="border-[#e5e5e5] dark:border-[#38383a]">
              管理
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#1d1d1f] dark:text-[#f5f5f7]">
                数据备份与迁移
              </DialogTitle>
              <DialogDescription className="text-[#86868b]">
                导出或导入你的本地记录
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* 导出部分 */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    导出备份
                  </h4>
                  <p className="text-xs text-[#86868b]">
                    将所有本地记录导出为 JSON 文件（备份与恢复用）
                  </p>
                </div>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full bg-[#0071e3] hover:bg-[#0077ed]"
                >
                  {isExporting ? '导出中...' : '导出备份文件'}
                </Button>
                <p className="text-xs text-[#86868b] text-center">
                  备份文件为 .json 格式，仅用于数据备份与恢复，不建议直接阅读。
                </p>

                {/* 导出结果 */}
                {exportResult && (
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="text-sm">
                      <p className="font-medium text-blue-700 dark:text-blue-400 mb-1">
                        导出成功
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-500">
                        文件名：{exportResult.filename}，已导出 {exportResult.recordCount} 条记录
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-[#e5e5e5] dark:border-[#38383a]" />

              {/* 导入部分 */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    导入备份
                  </h4>
                  <p className="text-xs text-[#86868b]">
                    从备份文件导入记录（合并模式，不覆盖原数据）
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    disabled={isImporting}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button
                    variant="outline"
                    disabled={isImporting}
                    className="w-full border-[#e5e5e5] dark:border-[#38383a]"
                  >
                    {isImporting ? '导入中...' : '选择备份文件'}
                  </Button>
                </div>

                {/* 导入结果 */}
                {importResult && (
                  <div className={`p-3 rounded-lg border ${
                    importResult.success
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}>
                    <div className="text-sm">
                      <p className={`font-medium mb-1 ${
                        importResult.success
                          ? 'text-blue-700 dark:text-blue-400'
                          : 'text-red-700 dark:text-red-400'
                      }`}>
                        {importResult.success ? '导入成功' : '导入失败'}
                      </p>
                      {importResult.success ? (
                        <p className="text-xs text-blue-600 dark:text-blue-500">
                          心事记录：+{importResult.heartRecordsAdded} | 
                          夸夸记录：+{importResult.praiseRecordsAdded} | 
                          时间胶囊：+{importResult.capsulesAdded}
                        </p>
                      ) : (
                        <p className="text-xs text-red-600 dark:text-red-500">
                          {importResult.error}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="text-xs text-[#86868b]">
        <p>所有数据默认保存在浏览器本地。建议定期导出备份以防数据丢失。</p>
      </div>
    </Card>
  );
}
