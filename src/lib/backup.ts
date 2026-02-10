import {
  getHeartRecords,
  saveHeartRecords,
  HeartRecord,
  getPraiseRecords,
  savePraiseRecords,
  PraiseRecord,
  getCapsules,
  saveCapsules,
  Capsule,
} from './storage';

// 统一的记录类型（用于导出）
export type ExportedRecord = HeartRecord | PraiseRecord | Capsule;

/**
 * 备份数据类型
 */
export interface BackupData {
  version: string;
  exportedAt: string;
  records: ExportedRecord[];
}

/**
 * 导出所有记录为 JSON
 */
export function exportBackup(): { data: string; recordCount: number } {
  const heartRecords = getHeartRecords();
  const praiseRecords = getPraiseRecords();
  const capsules = getCapsules();

  // 合并所有记录到一个数组
  const allRecords = [...heartRecords, ...praiseRecords, ...capsules];

  const backupData: BackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    records: allRecords,
  };

  return {
    data: JSON.stringify(backupData, null, 2),
    recordCount: allRecords.length,
  };
}

/**
 * 下载备份文件
 * @returns 文件名和记录数
 */
export function downloadBackupFile(): { filename: string; recordCount: number } {
  try {
    const { data, recordCount } = exportBackup();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // 文件名格式：echo-backup-YYYY-MM-DD.json
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `echo-backup-${dateStr}.json`;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { filename, recordCount };
  } catch (error) {
    console.error('Failed to download backup file:', error);
    throw new Error('导出备份文件失败');
  }
}

/**
 * 验证备份数据格式
 */
export function validateBackupData(data: any): data is BackupData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // 检查必需字段
  if (
    typeof data.version !== 'string' ||
    typeof data.exportedAt !== 'string' ||
    !Array.isArray(data.records)
  ) {
    return false;
  }

  return true;
}

/**
 * 导入备份文件（合并模式）
 * @param jsonData JSON 字符串
 * @returns 导入结果
 */
export interface ImportResult {
  success: boolean;
  heartRecordsAdded: number;
  praiseRecordsAdded: number;
  capsulesAdded: number;
  error?: string;
}

export function importBackup(jsonData: string): ImportResult {
  try {
    // 解析 JSON
    const data = JSON.parse(jsonData);

    // 验证格式
    if (!validateBackupData(data)) {
      return {
        success: false,
        heartRecordsAdded: 0,
        praiseRecordsAdded: 0,
        capsulesAdded: 0,
        error: '备份文件格式不正确',
      };
    }

    // 获取现有记录
    const existingHeartRecords = getHeartRecords();
    const existingPraiseRecords = getPraiseRecords();
    const existingCapsules = getCapsules();

    // 现有记录 ID 集合（用于去重）
    const existingHeartIds = new Set(existingHeartRecords.map(r => r.id));
    const existingPraiseIds = new Set(existingPraiseRecords.map(r => r.id));
    const existingCapsuleIds = new Set(existingCapsules.map(c => c.id));

    // 从 records 数组中分离不同类型的记录
    const importedHeartRecords: any[] = [];
    const importedPraiseRecords: any[] = [];
    const importedCapsules: any[] = [];

    data.records.forEach((record: any) => {
      // 转换日期格式
      if (typeof record.createdAt === 'string') {
        record.createdAt = new Date(record.createdAt);
      }
      if (record.updatedAt && typeof record.updatedAt === 'string') {
        record.updatedAt = new Date(record.updatedAt);
      }
      if (record.unlockAt && typeof record.unlockAt === 'string') {
        record.unlockAt = new Date(record.unlockAt);
      }
      if (record.openedAt && typeof record.openedAt === 'string') {
        record.openedAt = new Date(record.openedAt);
      }

      // 根据 type 字段分类
      if (record.type === 'journal') {
        importedHeartRecords.push(record);
      } else if (record.type === 'praise') {
        importedPraiseRecords.push(record);
      } else if (record.type === 'capsule') {
        importedCapsules.push(record);
      }
    });

    // 过滤掉已存在的记录（合并模式）
    const newHeartRecords = importedHeartRecords.filter((record) => {
      return !existingHeartIds.has(record.id);
    });

    const newPraiseRecords = importedPraiseRecords.filter((record) => {
      return !existingPraiseIds.has(record.id);
    });

    const newCapsules = importedCapsules.filter((record) => {
      return !existingCapsuleIds.has(record.id);
    });

    // 合并记录
    const mergedHeartRecords = [...newHeartRecords, ...existingHeartRecords];
    const mergedPraiseRecords = [...newPraiseRecords, ...existingPraiseRecords];
    const mergedCapsules = [...newCapsules, ...existingCapsules];

    // 保存到 localStorage
    saveHeartRecords(mergedHeartRecords);
    savePraiseRecords(mergedPraiseRecords);
    saveCapsules(mergedCapsules);

    return {
      success: true,
      heartRecordsAdded: newHeartRecords.length,
      praiseRecordsAdded: newPraiseRecords.length,
      capsulesAdded: newCapsules.length,
    };
  } catch (error) {
    console.error('Failed to import backup:', error);
    return {
      success: false,
      heartRecordsAdded: 0,
      praiseRecordsAdded: 0,
      capsulesAdded: 0,
      error: '导入备份文件失败，请检查文件格式',
    };
  }
}

/**
 * 读取用户选择的文件内容
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('读取文件失败'));
      }
    };

    reader.onerror = () => {
      reject(new Error('读取文件失败'));
    };

    reader.readAsText(file);
  });
}
