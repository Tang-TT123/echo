# 数据持久化实现文档

> 本文档记录「余音 / Echo」应用的数据持久化实现和验证。

---

## 持久化规则

1. **所有用户内容必须使用浏览器本地持久化存储**
2. **页面刷新、关闭浏览器、隔天重新打开时，数据必须仍然存在**
3. **保留「备份与迁移」功能，但作为辅助功能展示**
4. **导出的备份文件为 .json 格式，明确告知用户该文件用于备份与恢复**

---

## 实现方案

### 1. 使用 localStorage

**存储键名**（`src/lib/storage.ts`）：
- `echo_heart_records` - 心事记录
- `echo_praise_records` - 夸夸记录
- `echo_heart_filter` - 写心事筛选状态
- `echo_capsules` - 时间胶囊

**数据类型**：
- `HeartRecord` - 心事记录类型
- `PraiseRecord` - 夸夸记录类型
- `Capsule` - 时间胶囊类型
- `SafeCapsule` - 安全的胶囊类型（不包含 content）

### 2. 数据操作函数

**读取函数**：
- `getHeartRecords()` - 获取所有心事记录
- `getPraiseRecords()` - 获取所有夸夸记录
- `getCapsules()` - 获取所有时间胶囊

**写入函数**：
- `addHeartRecord()` - 添加心事记录
- `addPraiseRecord()` - 添加夸夸记录
- `addCapsule()` - 添加时间胶囊

**更新函数**：
- `updateHeartRecordLowMoment()` - 更新心事记录的低能量标记
- `updatePraiseRecordLowMoment()` - 更新夸夸记录的低能量标记
- `openCapsule()` - 开启时间胶囊
- `updateCapsuleReply()` - 更新时间胶囊的补充回复

**删除函数**：
- `deleteHeartRecord()` - 删除心事记录
- `deletePraiseRecord()` - 删除夸夸记录
- `deleteCapsule()` - 删除时间胶囊

### 3. 日期处理

所有日期字段在存储时会自动转换为字符串，读取时自动转换回 `Date` 对象：

```typescript
// 读取时转换
createdAt: new Date(record.createdAt)
updatedAt: new Date(record.updatedAt)
unlockAt: new Date(record.unlockAt)
openedAt: new Date(record.openedAt)
```

---

## 备份与迁移功能

### 1. 功能位置

**新位置**：余音板块（`/resonance`）底部
- 作为辅助功能展示
- 不作为主入口
- 使用卡片形式展示

**移除位置**：设置页面（`/settings`）
- 已移除备份功能
- 保留简单的"数据与隐私"说明

### 2. 备份文件格式

**文件名**：`echo-backup-YYYY-MM-DD.json`
**文件类型**：JSON
**内容结构**：

```json
{
  "version": "1.0.0",
  "exportedAt": "2025-01-30T10:30:00.000Z",
  "records": [
    {
      "id": "1234567890",
      "type": "journal",
      "content": "...",
      "createdAt": "2025-01-30T10:00:00.000Z",
      ...
    },
    ...
  ]
}
```

### 3. 用户说明

备份组件中明确告知用户：
> "备份文件为 .json 格式，仅用于数据备份与恢复，不建议直接阅读。"

### 4. 导入策略

**合并模式**：
- 不会覆盖现有数据
- 基于 ID 去重
- 新记录会添加到现有记录中
- 保留所有历史数据

---

## 数据持久化验证

### 验证场景

1. **页面刷新**
   - ✅ 数据不会丢失
   - ✅ 所有记录正常显示

2. **关闭浏览器后重新打开**
   - ✅ 数据不会丢失
   - ✅ 所有记录正常显示

3. **隔天重新打开**
   - ✅ 数据不会丢失
   - ✅ 所有记录正常显示

4. **备份导出**
   - ✅ 正确导出为 .json 文件
   - ✅ 文件内容为可读结构化文本
   - ✅ 包含所有记录

5. **备份导入**
   - ✅ 正确导入备份文件
   - ✅ 合并模式不覆盖现有数据
   - ✅ 基于 ID 去重

### 测试方法

**手动测试**：
1. 在写心事页面添加一条记录
2. 刷新页面，确认记录仍然存在
3. 关闭浏览器，重新打开，确认记录仍然存在
4. 在余音板块导出备份
5. 检查导出的 .json 文件内容
6. 清空浏览器 localStorage
7. 在余音板块导入备份
8. 确认所有记录已恢复

---

## 数据安全

### 存储位置
- 数据仅保存在用户浏览器的 localStorage 中
- 不上传到任何服务器
- 不需要账号登录

### 数据清理
用户可以通过以下方式清理数据：
1. 在各功能页面删除记录
2. 清除浏览器 localStorage
3. 使用隐身模式浏览（数据不会保存）

### 数据备份
用户可以通过以下方式备份数据：
1. 在余音板块导出备份
2. 保存 .json 文件到本地
3. 在其他设备导入备份（需要在相同浏览器或支持 localStorage 的环境）

---

## 相关文件

- **数据存储**：`src/lib/storage.ts`
- **备份功能**：`src/lib/backup.ts`
- **备份组件**：`src/components/backup-section.tsx`
- **余音页面**：`src/app/resonance/page.tsx`
- **设置页面**：`src/app/settings/page.tsx`

---

## 注意事项

1. **localStorage 容量限制**
   - 一般浏览器限制为 5-10MB
   - 如果数据量过大，导出备份可能失败
   - 建议定期导出备份并清理旧数据

2. **跨设备同步**
   - 当前不支持跨设备自动同步
   - 需要手动导出备份并在目标设备导入

3. **浏览器隐私模式**
   - 隐身模式下关闭浏览器后数据会丢失
   - 正常模式下数据会持久保存

---

## 更新记录

- **2025-01-30**：初始版本，完成数据持久化实现和备份功能迁移
