'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Sidebar } from '@/components/sidebar';
import { HeartRecordList } from '@/components/heart-record-list';
import { HeartRecordDetail } from '@/components/heart-record-detail';
import { EmotionMap } from '@/components/emotion-map';
import { useNavigationBack } from '@/hooks/use-navigation-back';
import { getRandomPlaceholder, guidePrompts, getRandomSaveFeedback } from '@/lib/write-heart-text';
import {
  getHeartRecords,
  addHeartRecord,
  deleteHeartRecord as deleteHeartRecordFromStorage,
  updateHeartRecordLowMoment,
  HeartRecord,
  getHeartFilterState,
  saveHeartFilterState,
  HeartFilterState
} from '@/lib/storage';

export default function ResonancePage() {
  const { handleBack } = useNavigationBack('/resonance');
  const [content, setContent] = useState('');
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [sceneTags, setSceneTags] = useState<string[]>([]);
  const [energyTag, setEnergyTag] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [placeholder, setPlaceholder] = useState(getRandomPlaceholder());

  // 模拟心事记录列表（实际应从后端获取）
  const [records, setRecords] = useState<HeartRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HeartRecord | null>(null);
  const [timeFilter, setTimeFilter] = useState<HeartFilterState['timeFilter']>('all');
  const [tagFilter, setTagFilter] = useState<{ type: 'mood' | 'scene' | null; value: string }>({
    type: null,
    value: '',
  });

  const moodOptions = ['平静', '焦虑', '疲惫', '低落', '委屈', '愤怒', '空', '充实', '感动', '失望'];
  const sceneOptions = ['工作', '学业', '关系', '家庭', '身体', '金钱', '未来', '自我价值', '社交'];
  const energyOptions = ['耗能', '中性', '充能'];

  // 从 localStorage 加载记录和筛选状态
  useEffect(() => {
    const loadedRecords = getHeartRecords();
    setRecords(loadedRecords);

    const filterState = getHeartFilterState();
    setTimeFilter(filterState.timeFilter);
    setTagFilter(filterState.tagFilter);
  }, []);

  // 切换情绪标签
  const toggleMoodTag = (tag: string) => {
    setMoodTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // 切换场景标签
  const toggleSceneTag = (tag: string) => {
    setSceneTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // 选择能量标签
  const selectEnergyTag = (tag: string) => {
    setEnergyTag((prev) => (prev === tag ? '' : tag));
  };

  // 轻量引导：点击按钮自动补全
  const insertGuidePrompt = (prompt: string) => {
    setContent((prev) => (prev ? prev + '\n' + prompt : prompt));
  };

  // 保存心事
  const handleSave = () => {
    if (!content.trim()) return;

    // 创建新记录（使用新的字段名称）
    const newRecord: HeartRecord = {
      id: Date.now().toString(),
      type: 'journal',
      content: content.trim(),
      createdAt: new Date(),
      tagsEmotion: moodTags,        // 情绪标签
      tagsContext: sceneTags,       // 场景标签
      energyTag: energyTag,         // 能量标签
      isLowMoment: false,           // 低能量时刻标记（可选）
      updatedAt: new Date(),        // 更新时间（可选）
    };

    // 添加到 localStorage
    addHeartRecord(newRecord);

    // 添加到列表开头
    setRecords((prev) => [newRecord, ...prev]);

    // 显示温柔反馈
    setFeedbackText(getRandomSaveFeedback());
    setShowFeedback(true);

    // 清空表单
    setContent('');
    setMoodTags([]);
    setSceneTags([]);
    setEnergyTag('');
    setPlaceholder(getRandomPlaceholder());

    // 3秒后隐藏反馈
    setTimeout(() => {
      setShowFeedback(false);
    }, 3000);
  };

  // 查看详情
  const handleViewDetail = (record: HeartRecord) => {
    setSelectedRecord(record);
  };

  // 关闭详情
  const handleCloseDetail = () => {
    setSelectedRecord(null);
  };

  // 删除记录
  const handleDeleteRecord = (id: string) => {
    // 从 localStorage 删除
    deleteHeartRecordFromStorage(id);
    // 从状态中删除
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // 根据时间筛选记录
  const getFilteredRecords = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // 本周一开始
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let result = records;

    // 时间筛选
    switch (timeFilter) {
      case 'today':
        result = result.filter(r => new Date(r.createdAt) >= todayStart);
        break;
      case 'week':
        result = result.filter(r => new Date(r.createdAt) >= weekStart);
        break;
      case 'month':
        result = result.filter(r => new Date(r.createdAt) >= monthStart);
        break;
    }

    // 标签筛选
    if (tagFilter.type && tagFilter.value) {
      if (tagFilter.type === 'mood') {
        result = result.filter(r => r.tagsEmotion.includes(tagFilter.value));
      } else if (tagFilter.type === 'scene') {
        result = result.filter(r => r.tagsContext.includes(tagFilter.value));
      }
    }

    return result;
  };

  const filteredRecords = getFilteredRecords();

  // 处理标签筛选点击
  const handleTagFilter = (type: 'mood' | 'scene', value: string) => {
    let newTagFilter;
    if (tagFilter.type === type && tagFilter.value === value) {
      // 取消筛选
      newTagFilter = { type: null, value: '' };
    } else {
      // 应用筛选
      newTagFilter = { type, value };
    }
    setTagFilter(newTagFilter);
    // 保存到 localStorage
    saveHeartFilterState({ timeFilter, tagFilter: newTagFilter });
  };

  // 清除标签筛选
  const clearTagFilter = () => {
    const newTagFilter = { type: null, value: '' };
    setTagFilter(newTagFilter);
    // 保存到 localStorage
    saveHeartFilterState({ timeFilter, tagFilter: newTagFilter });
  };

  // 处理时间筛选
  const handleTimeFilterChange = (newTimeFilter: HeartFilterState['timeFilter']) => {
    setTimeFilter(newTimeFilter);
    // 保存到 localStorage
    saveHeartFilterState({ timeFilter: newTimeFilter, tagFilter });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-[#e5e5e5] dark:border-[#38383a]">
          <div className="max-w-6xl mx-auto px-8 py-4">
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
                    <span>写心事</span>
                  </div>
                  {/* 标题 */}
                  <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    写心事
                  </h1>
                </div>
              </div>

              {/* 右侧按钮 */}
              <Button
                variant="outline"
                size="sm"
                className="border-[#e5e5e5] dark:border-[#38383a]"
                onClick={() => setSelectedRecord(null)}
              >
                查看记录
              </Button>
            </div>
            <p className="text-sm text-[#86868b] mt-1 ml-16">
              把情绪放下来就好，不需要立刻解决
            </p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* 详情视图 */}
          {selectedRecord ? (
            <HeartRecordDetail
              record={selectedRecord}
              onClose={handleCloseDetail}
              onDelete={handleDeleteRecord}
              onTagFilter={handleTagFilter}
            />
          ) : (
            <div className="space-y-8">
              {/* 写心事输入区 */}
              <Card className="p-8 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow">
                <div className="space-y-6">
                  {/* 核心输入区 */}
                  <div>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={placeholder}
                      className="min-h-[200px] text-base leading-relaxed resize-none border-[#e5e5e5] dark:border-[#38383a] focus:border-blue-500 dark:focus:border-blue-500"
                    />
                  </div>

                  {/* 轻量引导按钮 */}
                  <div className="flex flex-wrap gap-2">
                    {guidePrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] border-[#e5e5e5] dark:border-[#38383a]"
                        onClick={() => insertGuidePrompt(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>

                  {/* 情绪标签区 */}
                  <div>
                    <div className="text-xs text-[#86868b] mb-3">情绪（可多选，也可跳过）</div>
                    <div className="flex flex-wrap gap-2">
                      {moodOptions.map((tag) => (
                        <Badge
                          key={tag}
                          variant={moodTags.includes(tag) ? 'default' : 'outline'}
                          className={`cursor-pointer transition-smooth ${
                            moodTags.includes(tag)
                              ? 'bg-[#0071e3] text-white border-[#0071e3]'
                              : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] border-[#e5e5e5] dark:border-[#38383a] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                          }`}
                          onClick={() => toggleMoodTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 触发源标签区 */}
                  <div>
                    <div className="text-xs text-[#86868b] mb-3">发生背景（可多选）</div>
                    <div className="flex flex-wrap gap-2">
                      {sceneOptions.map((tag) => (
                        <Badge
                          key={tag}
                          variant={sceneTags.includes(tag) ? 'default' : 'outline'}
                          className={`cursor-pointer transition-smooth ${
                            sceneTags.includes(tag)
                              ? 'bg-[#0071e3] text-white border-[#0071e3]'
                              : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] border-[#e5e5e5] dark:border-[#38383a] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                          }`}
                          onClick={() => toggleSceneTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 能量标签区 */}
                  <div>
                    <div className="text-xs text-[#86868b] mb-3">能量影响</div>
                    <div className="flex gap-2">
                      {energyOptions.map((tag) => (
                        <Badge
                          key={tag}
                          variant={energyTag === tag ? 'default' : 'outline'}
                          className={`cursor-pointer transition-smooth ${
                            energyTag === tag
                              ? 'bg-[#0071e3] text-white border-[#0071e3]'
                              : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] border-[#e5e5e5] dark:border-[#38383a] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                          }`}
                          onClick={() => selectEnergyTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 保存按钮 */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#e5e5e5] dark:border-[#38383a]">
                    <p className="text-xs text-[#86868b]">
                      你的心事默认仅保存在本地，可选择云端加密或随时删除。
                    </p>
                    <div className="flex items-center gap-3">
                      {showFeedback && (
                        <span className="text-sm text-[#0071e3] animate-in fade-in slide-in-from-bottom-2">
                          {feedbackText}
                        </span>
                      )}
                      <Button
                        className="bg-[#0071e3] hover:bg-[#0077ed]"
                        onClick={handleSave}
                        disabled={!content.trim()}
                      >
                        保存
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 情绪地图 */}
              <EmotionMap records={records} />

              {/* 心事记录列表 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      心事记录
                    </h3>
                    {tagFilter.type && tagFilter.value && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#86868b]">筛选:</span>
                        <Badge variant="outline" className="text-xs bg-[#0071e3] text-white border-[#0071e3]">
                          {tagFilter.value}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] h-6 px-2"
                          onClick={clearTagFilter}
                        >
                          清除
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {[
                      { key: 'today', label: '今天' },
                      { key: 'week', label: '本周' },
                      { key: 'month', label: '本月' },
                      { key: 'all', label: '全部' },
                    ].map((filter) => (
                      <Button
                        key={filter.key}
                        variant={timeFilter === filter.key ? 'default' : 'ghost'}
                        size="sm"
                        className={`text-xs ${
                          timeFilter === filter.key
                            ? 'bg-[#0071e3] text-white'
                            : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                        }`}
                        onClick={() => handleTimeFilterChange(filter.key as any)}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <HeartRecordList records={filteredRecords} onViewDetail={handleViewDetail} onTagFilter={handleTagFilter} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
