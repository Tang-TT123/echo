'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sidebar } from '@/components/sidebar';
import { useNavigationBack } from '@/hooks/use-navigation-back';
import {
  getCapsules,
  addCapsule,
  deleteCapsule,
  openCapsule,
  updateCapsuleReply,
  generateCapsuleTitle,
  getSafeCapsule,
  isCapsuleUnlocked,
  Capsule,
  SafeCapsule,
} from '@/lib/storage';

export default function CapsulePage() {
  const { handleBack } = useNavigationBack('/resonance');
  const [content, setContent] = useState('');
  const [unlockAt, setUnlockAt] = useState('');
  const [selectedDays, setSelectedDays] = useState<string | null>(null);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [showList, setShowList] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | SafeCapsule | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [reply, setReply] = useState('');
  const [isOpeningAnimation, setIsOpeningAnimation] = useState(false);

  // 保存反馈状态
  const [saveToast, setSaveToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });

  // 显示 toast 反馈
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setSaveToast({ show: true, message, type });
    // 3秒后自动隐藏
    setTimeout(() => {
      setSaveToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // 从 localStorage 加载胶囊
  useEffect(() => {
    const loadedCapsules = getCapsules();
    setCapsules(loadedCapsules);
  }, []);

  // 计算解锁日期
  const getUnlockDate = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  // 处理天数选择
  const handleDaysSelect = (days: number) => {
    setSelectedDays(days.toString());
    setUnlockAt(getUnlockDate(days));
  };

  // 处理自定义日期
  const handleCustomDateChange = (date: string) => {
    setSelectedDays(null);
    setUnlockAt(date);
  };

  // 显示保存确认
  const handleSaveClick = () => {
    if (!content.trim() || !unlockAt) {
      return;
    }
    setShowConfirm(true);
  };

  // 确认保存胶囊
  const handleConfirmSave = () => {
    if (!content.trim() || !unlockAt) {
      showToast('请填写内容和选择解锁时间', 'error');
      return;
    }

    try {
      const createdAt = new Date();
      const newCapsule: Capsule = {
        id: Date.now().toString(),
        type: 'capsule',
        title: generateCapsuleTitle(createdAt),
        content: content.trim(),
        unlockAt: new Date(unlockAt),
        createdAt: createdAt,
        status: 'locked',
      };

      addCapsule(newCapsule);
      setCapsules(getCapsules()); // 重新加载并排序

      // 清空表单
      setContent('');
      setUnlockAt('');
      setSelectedDays(null);
      setShowConfirm(false);

      // 显示成功反馈
      showToast('这封信已为你妥善保存。', 'success');
    } catch (error) {
      console.error('保存胶囊失败:', error);
      showToast('保存失败，请重试', 'error');
      setShowConfirm(false);
    }
  };

  // 取消保存
  const handleCancelSave = () => {
    setShowConfirm(false);
  };

  // 查看胶囊（解锁判断发生在数据获取之前）
  const handleViewCapsule = (capsule: Capsule) => {
    // 1. 解锁判断必须在数据获取之前
    // 2. 基于时间逻辑判断是否已解锁
    // 3. 刷新后逻辑依然有效
    const unlocked = isCapsuleUnlocked(capsule);

    // 4. 如果未解锁，只返回 SafeCapsule（不包含 content）
    if (!unlocked) {
      setSelectedCapsule(getSafeCapsule(capsule));
      setReply('');
      setShowList(false);
      return;
    }

    // 5. 已解锁，更新状态为 unlocked（如果当前是 locked）
    if (capsule.status === 'locked') {
      const updatedCapsules = capsules.map((c) =>
        c.id === capsule.id ? { ...c, status: 'unlocked' as const } : c
      );
      setCapsules(updatedCapsules);
      setSelectedCapsule({ ...capsule, status: 'unlocked' as const });
    } else {
      setSelectedCapsule(capsule);
    }

    setReply((capsule as Capsule).reply || '');
    setShowList(false);
  };

  // 开启胶囊
  const handleOpenCapsule = () => {
    if (selectedCapsule && (selectedCapsule.status === 'locked' || selectedCapsule.status === 'unlocked')) {
      const now = new Date();
      if (now >= selectedCapsule.unlockAt) {
        setIsOpeningAnimation(true);
        openCapsule(selectedCapsule.id);

        // 从 capsules 列表中获取完整的 capsule 对象（包含 content）
        const fullCapsule = capsules.find(c => c.id === selectedCapsule.id);
        if (fullCapsule) {
          const openedCapsule: Capsule = {
            ...fullCapsule,
            status: 'opened',
            openedAt: now,
          };
          setSelectedCapsule(openedCapsule);

          // 更新列表
          const updatedCapsules = capsules.map((c) =>
            c.id === selectedCapsule.id
              ? { ...c, status: 'opened' as const, openedAt: now }
              : c
          );
          setCapsules(updatedCapsules);
        }

        // 500ms 后结束动画
        setTimeout(() => {
          setIsOpeningAnimation(false);
        }, 500);
      }
    }
  };

  // 保存补充回复
  const handleSaveReply = () => {
    if (selectedCapsule && reply.trim()) {
      updateCapsuleReply(selectedCapsule.id, reply.trim());
      setSelectedCapsule({
        ...selectedCapsule,
        reply: reply.trim(),
      });
      setReply('');
    }
  };

  // 删除胶囊
  const handleDeleteCapsule = (id: string) => {
    deleteCapsule(id);
    setCapsules((prev) => prev.filter((c) => c.id !== id));
    if (selectedCapsule?.id === id) {
      setSelectedCapsule(null);
      setShowList(false);
    }
  };

  // 返回列表
  const handleBackToList = () => {
    setSelectedCapsule(null);
    setShowList(true);
  };

  // 返回余音首页
  const handleBackToResonance = () => {
    setSelectedCapsule(null);
    handleBack();
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 计算距离解锁还有多少天
  const getDaysUntilUnlock = (unlockAt: Date) => {
    const now = new Date();
    const diff = unlockAt.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  // 是否可以开启
  const canOpen = (capsule: Capsule) => {
    return capsule.status === 'unlocked' || (capsule.status === 'locked' && new Date() >= capsule.unlockAt);
  };

  // 获取状态图标
  const getStatusIcon = (capsule: Capsule | SafeCapsule): string => {
    if (capsule.status === 'opened') return '📖';
    if (capsule.status === 'unlocked') return '🔓';
    return '⏳';
  };

  // 获取状态文本
  const getStatusText = (capsule: Capsule | SafeCapsule) => {
    if (capsule.status === 'opened') return '已打开';
    if (capsule.status === 'unlocked') return '已到期';
    if (capsule.status === 'locked') {
      const daysUntil = getDaysUntilUnlock(capsule.unlockAt);
      if (daysUntil > 0) return `${daysUntil}天后解锁`;
      return '已到期';
    }
    return '';
  };

  // 获取状态样式
  const getStatusColor = (capsule: Capsule | SafeCapsule) => {
    if (capsule.status === 'opened') return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    if (capsule.status === 'unlocked') return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    if (capsule.status === 'locked') {
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-[#e5e5e5] dark:border-[#38383a]">
          <div className="max-w-4xl mx-auto px-8 py-4">
            {/* 面包屑 + 返回按钮 + 标题 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* 返回按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] h-8 px-2"
                  onClick={handleBack}
                >
                  ← 返回
                </Button>

                {/* 面包屑 + 标题 */}
                <div>
                  {/* 面包屑 */}
                  <div className="flex items-center gap-2 text-xs text-[#86868b] mb-1">
                    <Link href="/resonance" className="hover:text-[#0071e3]">
                      余音
                    </Link>
                    <span>/</span>
                    <span>时间胶囊</span>
                  </div>
                  {/* 标题 */}
                  <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    时间胶囊
                  </h1>
                </div>
              </div>

              {/* 右侧按钮 */}
              {!showList && !selectedCapsule && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#e5e5e5] dark:border-[#38383a]"
                  onClick={() => setShowList(true)}
                >
                  查看胶囊
                </Button>
              )}
            </div>
            <p className="text-sm text-[#86868b] mt-1 ml-16">
              把"现在的你"留给"未来的你"
            </p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* 胶囊列表 */}
          {showList ? (
            <Card className="p-6 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  我的胶囊
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
                  onClick={() => setShowList(false)}
                >
                  ← 写新胶囊
                </Button>
              </div>

              {capsules.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🕰️</div>
                  <p className="text-[#86868b] mb-4">还没有时间胶囊</p>
                  <p className="text-sm text-[#86868b]">
                    写一封信给未来的自己，在指定的时间点开启
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {capsules.map((capsule) => (
                    <Card
                      key={capsule.id}
                      className="p-4 bg-card border-[#e5e5e5] dark:border-[#38383a] cursor-pointer hover:border-[#0071e3] transition-smooth"
                      onClick={() => handleViewCapsule(capsule)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {/* 标题行 */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{getStatusIcon(capsule)}</span>
                            <h3 className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                              {capsule.title}
                            </h3>
                            <Badge className={getStatusColor(capsule)}>
                              {getStatusText(capsule)}
                            </Badge>
                          </div>
                          {/* 信息行 */}
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs text-[#86868b]">
                              创建于 {formatDate(capsule.createdAt)}
                            </span>
                            <span className="text-xs text-[#86868b]">•</span>
                            <span className="text-xs text-[#86868b]">
                              解锁于 {formatDate(capsule.unlockAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          ) : selectedCapsule ? (
            /* 胶囊详情 */
            <Card className="p-8 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow">
              <div className="mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] mb-4"
                  onClick={handleBackToResonance}
                >
                  ← 返回 余音
                </Button>

                {/* 标题和状态 */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{getStatusIcon(selectedCapsule)}</span>
                    <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {selectedCapsule.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getStatusColor(selectedCapsule)}>
                      {getStatusText(selectedCapsule)}
                    </Badge>
                    <span className="text-xs text-[#86868b]">
                      创建于 {formatDate(selectedCapsule.createdAt)}
                    </span>
                    <span className="text-xs text-[#86868b]">•</span>
                    <span className="text-xs text-[#86868b]">
                      解锁于 {formatDate(selectedCapsule.unlockAt)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedCapsule.status === 'opened' && isCapsuleUnlocked(selectedCapsule) ? (
                /* 已打开的内容 */
                <div className={`transition-opacity duration-500 ${isOpeningAnimation ? 'opacity-0' : 'opacity-100'}`}>
                  {/* 胶囊内容 */}
                  <div className="mb-12">
                    <div className="prose prose-lg max-w-none text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-pre-wrap leading-relaxed">
                      {/* 只有在解锁时才渲染 content */}
                      {('content' in selectedCapsule) && selectedCapsule.content}
                    </div>
                  </div>

                  {/* 信息栏 */}
                  <div className="flex items-center gap-6 py-6 border-t border-[#e5e5e5] dark:border-[#38383a] mb-8">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#86868b]">写下日期</span>
                      <span className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {formatDate(selectedCapsule.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#86868b]">解锁日期</span>
                      <span className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {formatDate(selectedCapsule.unlockAt)}
                      </span>
                    </div>
                  </div>

                  {/* 可选补充回复 */}
                  <div className="border-t border-[#e5e5e5] dark:border-[#38383a] pt-8">
                    <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">
                      现在的我，想对那时的自己补一句……
                    </label>
                    <Textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="（可选）写点什么吧……"
                      className="min-h-[100px] bg-background border-[#e5e5e5] dark:border-[#38383a] resize-none mb-3"
                    />
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleSaveReply}
                        disabled={!reply.trim()}
                        size="sm"
                        className="bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50"
                      >
                        保存
                      </Button>
                      <span className="text-xs text-[#86868b]">
                        仅附加在此胶囊下，不生成新胶囊
                      </span>
                    </div>

                    {/* 已保存的回复 */}
                    {selectedCapsule.reply && (
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-100 dark:border-blue-900">
                        <p className="text-xs text-[#86868b] mb-2">你之前补充的：</p>
                        <p className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-pre-wrap">
                          {selectedCapsule.reply}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-3 mt-8 pt-6 border-t border-[#e5e5e5] dark:border-[#38383a]">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={() => handleDeleteCapsule(selectedCapsule.id)}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              ) : selectedCapsule.status === 'locked' || selectedCapsule.status === 'unlocked' ? (
                /* 未打开的内容 */
                <div>
                  {isCapsuleUnlocked(selectedCapsule) ? (
                    /* 已解锁，可以开启 */
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">💌</div>
                      <p className="text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
                        有一封来自过去的你，已经准备好了
                      </p>
                      <div className="flex justify-center gap-3">
                        <Button
                          onClick={handleOpenCapsule}
                          className="bg-[#0071e3] hover:bg-[#0077ed]"
                        >
                          开启胶囊
                        </Button>
                        <Button
                          variant="outline"
                          className="border-[#e5e5e5] dark:border-[#38383a]"
                          onClick={handleBackToList}
                        >
                          稍后再说
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* 未解锁，只显示锁定状态 */
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">🔒</div>
                      <h3 className="text-xl font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">
                        这封信将在 {formatDate(selectedCapsule.unlockAt)} 打开
                      </h3>
                      <p className="text-sm text-[#86868b] mb-8">
                        请耐心等待，时间到了你就能看到来自过去的你
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                        onClick={() => handleDeleteCapsule(selectedCapsule.id)}
                      >
                        删除胶囊
                      </Button>
                    </div>
                  )}
                </div>
              ) : null}
            </Card>
          ) : (
            /* 写新胶囊表单 */
            <>
              <Card className="p-6 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow mb-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                    给未来的自己写点什么
                  </label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="在这里写下你想对未来的自己说的话..."
                    className="min-h-[200px] bg-background border-[#e5e5e5] dark:border-[#38383a] resize-none"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                    解锁时间
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      variant={selectedDays === '7' ? 'default' : 'outline'}
                      size="sm"
                      className={selectedDays === '7' ? 'bg-[#0071e3]' : 'border-[#e5e5e5] dark:border-[#38383a]'}
                      onClick={() => handleDaysSelect(7)}
                    >
                      7天后
                    </Button>
                    <Button
                      variant={selectedDays === '30' ? 'default' : 'outline'}
                      size="sm"
                      className={selectedDays === '30' ? 'bg-[#0071e3]' : 'border-[#e5e5e5] dark:border-[#38383a]'}
                      onClick={() => handleDaysSelect(30)}
                    >
                      30天后
                    </Button>
                    <Button
                      variant={selectedDays === '90' ? 'default' : 'outline'}
                      size="sm"
                      className={selectedDays === '90' ? 'bg-[#0071e3]' : 'border-[#e5e5e5] dark:border-[#38383a]'}
                      onClick={() => handleDaysSelect(90)}
                    >
                      90天后
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={unlockAt}
                      onChange={(e) => handleCustomDateChange(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="flex-1 px-3 py-2 text-sm bg-background border-[#e5e5e5] dark:border-[#38383a] rounded-md"
                    />
                    <span className="text-xs text-[#86868b]">
                      或选择自定义日期
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveClick}
                    disabled={!content.trim() || !unlockAt}
                    className="bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50"
                  >
                    存入胶囊
                  </Button>
                </div>
              </Card>

              {/* 使用说明 */}
              <Card className="p-6 bg-card border-[#e5e5e5] dark:border-[#38383a]">
                <h3 className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">
                  关于时间胶囊
                </h3>
                <ul className="text-sm text-[#86868b] space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      胶囊在指定日期前无法开启，这是一份给未来的礼物
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      所有内容保存在本地，只有你能看到
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      可以随时删除未开启的胶囊
                    </span>
                  </li>
                </ul>
              </Card>
            </>
          )}
        </div>
      </main>

      {/* 确认对话框 */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Card className="max-w-md w-full mx-4 p-6 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow">
            <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
              确认存入时间胶囊
            </h3>
            <div className="mb-6">
              <p className="text-sm text-[#86868b] mb-2">
                这封信将在以下时间解锁：
              </p>
              <p className="text-base font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                {formatDate(new Date(unlockAt))}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                className="border-[#e5e5e5] dark:border-[#38383a]"
                onClick={handleCancelSave}
              >
                再想想
              </Button>
              <Button
                size="sm"
                className="bg-[#0071e3] hover:bg-[#0077ed]"
                onClick={handleConfirmSave}
              >
                确认存入
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Toast 反馈 */}
      {saveToast.show && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              saveToast.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            <span>{saveToast.type === 'success' ? '✓' : '✕'}</span>
            <span className="text-sm font-medium">{saveToast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
