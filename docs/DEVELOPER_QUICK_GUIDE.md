# 开发者快速指南：交互底层宪法

> 在开发新功能前，请先阅读本文档，确保符合【交互底层宪法】要求。

## 8条铁律（必须遵守）

### 1. 禁止装饰性按钮
- ❌ 不要：放一个"功能开发中"的按钮占位
- ✅ 必须：功能实现后再展示按钮

### 2. 返回规则
- ❌ 不要：写死 `router.push('/resonance')`
- ✅ 必须：使用 `useNavigationBack('/resonance')` Hook

### 3. 默认私密
- ❌ 不要：调用 API 上传数据
- ✅ 必须：仅使用 `localStorage` 保存

### 4. 时间胶囊未解锁禁止预览
- ❌ 不要：在任何地方显示 `content` 字段
- ✅ 必须：使用 `SafeCapsule` 类型，解锁判断在数据获取之前

### 5. 保存必须有反馈
- ❌ 不要：保存后让用户自己刷新确认
- ✅ 必须：使用 `showToast()` 或状态提示（3秒后自动隐藏）

### 6. 不制造焦虑
- ❌ 不要：红点、精确倒计时、强制打卡、进度条压力
- ✅ 必须：温和提示，用户自设定时间可以显示

### 7. 余音板块不分析不评判
- ❌ 不要："你应该"、"建议你"、"分析你的情绪"
- ✅ 必须："陪伴"、"记录"、"你不需要独自承受"

### 8. 同类功能交互一致
- ✅ 返回：统一用 `useNavigationBack`
- ✅ 保存：统一有反馈
- ✅ 私密：统一用 localStorage

---

## 开发检查清单

在提交 PR 前，请逐项确认：

- [ ] 所有按钮都有真实功能（无"功能开发中"按钮）
- [ ] 返回按钮使用 `useNavigationBack` Hook
- [ ] 无 API 调用，数据仅保存在 localStorage
- [ ] 时间胶囊相关功能通过 `SafeCapsule` 类型检查
- [ ] 保存/创建操作有 `showToast` 或状态反馈
- [ ] 无红点、精确倒计时、强制打卡
- [ ] 文案中无"分析"、"应该"、"建议"等词汇
- [ ] TypeScript 类型检查通过：`npx tsc --noEmit`

---

## 代码示例

### ✅ 正确示例

#### 返回按钮
```tsx
import { useNavigationBack } from '@/hooks/use-navigation-back';

function MyPage() {
  const { handleBack } = useNavigationBack('/resonance');

  return (
    <Button onClick={handleBack}>← 返回</Button>
  );
}
```

#### 保存操作
```tsx
function handleSave() {
  if (!content.trim()) return;

  const newRecord = { ... };
  addRecord(newRecord);

  // 明确反馈
  showToast('已保存', 'success');

  // 清空表单
  setContent('');
}
```

#### 时间胶囊解锁判断
```tsx
function handleViewCapsule(capsule: Capsule) {
  // 解锁判断在数据获取之前
  if (!isCapsuleUnlocked(capsule)) {
    // 返回 SafeCapsule（不包含 content）
    setSelectedCapsule(getSafeCapsule(capsule));
    return;
  }

  // 已解锁，返回完整 Capsule
  setSelectedCapsule(capsule);
}
```

### ❌ 错误示例

#### 错误的返回按钮
```tsx
// ❌ 不要写死返回路径
<Link href="/resonance">
  <Button>← 返回</Button>
</Link>

// ❌ 不要使用 router.push
<Button onClick={() => router.push('/resonance')}>
  ← 返回
</Button>
```

#### 错误的保存操作
```tsx
// ❌ 不要保存后无反馈
function handleSave() {
  addRecord(newRecord);
  setContent('');
  // 用户不知道是否保存成功！
}
```

#### 错误的时间胶囊逻辑
```tsx
// ❌ 不要在未解锁时显示 content
function renderCapsule(capsule: Capsule) {
  return (
    <div>
      <h3>{capsule.title}</h3>
      {/* 💥 未解锁也会显示 content！ */}
      <p>{capsule.content}</p>
    </div>
  );
}
```

---

## 常见问题

### Q: 可以显示"X天后解锁"吗？
A: 可以。这是用户自己设定的解锁时间，不是系统强制的，不会制造焦虑。但不要显示精确倒计时（小时、分钟、秒）。

### Q: 可以添加数据导出功能吗？
A: 可以，但必须由用户主动触发（点击导出按钮），不能自动上传云端。导出文件也应保存在本地。

### Q: 文案可以使用"建议"吗？
A: 不可以。余音板块不进行心理分析、不评判、不提出"你应该怎样"的建议。文案应保持陪伴式、记录式风格。

### Q: 如何确认数据仅保存在本地？
A: 检查代码中是否有 `fetch`、`axios`、`api` 等网络请求关键词。所有数据操作应通过 `src/lib/storage.ts` 进行。

---

## 相关文件

- 完整宪法文档：`docs/INTERACTION_CONSTITUTION.md`
- 统一返回 Hook：`src/hooks/use-navigation-back.ts`
- 数据存储：`src/lib/storage.ts`
- 文案库：
  - `src/lib/write-heart-text.ts`
  - `src/lib/praise-text.ts`

---

**记住：宪法高于需求。如果某个功能需求违反宪法，请直接拒绝或修改需求。**
