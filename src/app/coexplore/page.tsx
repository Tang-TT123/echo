'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { Selector, SelectorProps } from '@/components/ui/selector';
import { SelectorSheet, SelectorOption } from '@/components/ui/selector-sheet';
import { useNavigationBack } from '@/hooks/use-navigation-back';
import {
  addRelationshipClarityCard,
  getRelationshipClarityCards,
  RelationshipClarityCard,
} from '@/lib/storage';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

const MBTI_TYPES: SelectorOption[] = [
  { value: 'unknown', label: '不太清楚' },
  { value: 'skip', label: '不想填这个' },
  { value: 'INTJ', label: 'INTJ - 建筑师' },
  { value: 'INTP', label: 'INTP - 逻辑学家' },
  { value: 'ENTJ', label: 'ENTJ - 指挥官' },
  { value: 'ENTP', label: 'ENTP - 辩论家' },
  { value: 'INFJ', label: 'INFJ - 提倡者' },
  { value: 'INFP', label: 'INFP - 调停者' },
  { value: 'ENFJ', label: 'ENFJ - 主人公' },
  { value: 'ENFP', label: 'ENFP - 竞选者' },
  { value: 'ISTJ', label: 'ISTJ - 物流师' },
  { value: 'ISFJ', label: 'ISFJ - 守卫者' },
  { value: 'ESTJ', label: 'ESTJ - 总经理' },
  { value: 'ESFJ', label: 'ESFJ - 执政官' },
  { value: 'ISTP', label: 'ISTP - 鉴赏家' },
  { value: 'ISFP', label: 'ISFP - 探险家' },
  { value: 'ESTP', label: 'ESTP - 企业家' },
  { value: 'ESFP', label: 'ESFP - 表演者' },
];

const RELATIONSHIP_TYPES: SelectorOption[] = [
  { value: '伴侣/暧昧对象', label: '伴侣 / 暧昧对象' },
  { value: '朋友', label: '朋友' },
  { value: '家人', label: '家人' },
  { value: '同事/上级', label: '同事 / 上级' },
  { value: '其他重要的人', label: '其他重要的人' },
];

const CONCERNS: SelectorOption[] = [
  { value: '我不敢表达真实想法', label: '我不太敢说出真实想法' },
  { value: '我总是在迁就', label: '我好像一直在迁就' },
  { value: '我觉得被忽视/不被尊重', label: '我觉得被忽视 / 不被尊重' },
  { value: '我很累，但又不想破坏关系', label: '我其实挺累的，但又不想把关系搞僵' },
  { value: '我不知道对方在想什么', label: '我有点看不懂对方在想什么' },
  { value: '我不知道该不该继续靠近/退出', label: '我不知道该继续靠近，还是慢慢退出' },
  { value: '我在这段关系里很内耗', label: '这段关系让我很内耗' },
  { value: '说不太清楚，想聊聊再说', label: '说不太清楚，想聊聊再说' },
];

type AnalysisResult = {
  structureMirror: string;
  personalityView?: string;
  directions: string[];
  theme: string;
  directionLabel: string;
};

export default function CoexplorePage() {
  const { handleBack } = useNavigationBack('/coexist');

  // 表单状态
  const [relationType, setRelationType] = useState('');
  const [partnerMBTI, setPartnerMBTI] = useState('');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [additionalDescription, setAdditionalDescription] = useState('');

  // Sheet 状态
  const [relationTypeSheetOpen, setRelationTypeSheetOpen] = useState(false);
  const [mbtiSheetOpen, setMbtiSheetOpen] = useState(false);
  const [concernsSheetOpen, setConcernsSheetOpen] = useState(false);

  // 补充描述展开状态
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // 结果状态
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedCardId, setSavedCardId] = useState<string | null>(null);

  // 获取困扰选项标签
  const getConcernLabels = () => {
    return selectedConcerns
      .map((val) => CONCERNS.find((c) => c.value === val)?.label || val)
      .slice(0, 2);
  };

  // 处理关系类型选择
  const handleRelationTypeChange = (value: string) => {
    setRelationType(value);
  };

  // 处理 MBTI 选择
  const handleMBTIChange = (value: string) => {
    if (value === 'skip') {
      setPartnerMBTI('');
    } else {
      setPartnerMBTI(value);
    }
  };

  // 处理困扰选择
  const handleConcernsChange = (values: string[]) => {
    setSelectedConcerns(values);
  };

  // 分析关系
  const handleAnalyze = () => {
    if (!relationType || selectedConcerns.length === 0) {
      return;
    }

    setIsAnalyzing(true);
    setSaved(false);

    // 处理 MBTI：如果选择 "unknown" 或为空，视为未填写
    const normalizedMBTI = partnerMBTI === 'unknown' ? '' : partnerMBTI;

    // 模拟分析（实际应用中可能需要调用 LLM）
    setTimeout(() => {
      const analysisResult = generateAnalysis(
        relationType,
        normalizedMBTI,
        selectedConcerns,
        additionalDescription
      );
      setResult(analysisResult);
      setIsAnalyzing(false);

      // 保存关系澄清卡（如果 MBTI 为 "unknown"，保存为 undefined）
      const card: RelationshipClarityCard = {
        id: Date.now().toString(),
        type: 'relationship-clarity',
        relationType,
        theme: analysisResult.theme,
        direction: analysisResult.directionLabel,
        partnerMBTI: normalizedMBTI || undefined,
        chatThread: [], // 空对话线程
        createdAt: new Date(),
      };

      addRelationshipClarityCard(card);
      setSaved(true);
      setSavedCardId(card.id);
    }, 1500);
  };

  // 重置表单
  const handleReset = () => {
    setRelationType('');
    setPartnerMBTI('');
    setSelectedConcerns([]);
    setAdditionalDescription('');
    setDescriptionExpanded(false);
    setResult(null);
    setSaved(false);
    setSavedCardId(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-[#e5e5e5] dark:border-[#38383a]">
          <div className="max-w-4xl mx-auto px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] h-8 px-2"
                onClick={handleBack}
              >
                ← 返回
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  关系导航
                </h1>
              </div>
            </div>
            <p className="text-sm text-[#86868b] mt-1 ml-16">
              理清困惑，找到温和的方向
            </p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-8 py-8 pb-32">
          {!result ? (
            /* 输入表单 */
            <div className="space-y-4">
              {/* 关系类型 */}
              <Selector
                label="你们的关系"
                placeholder="请选择你们的关系"
                value={relationType}
                onClick={() => setRelationTypeSheetOpen(true)}
                required
              />

              {/* 对方 MBTI */}
              <Selector
                label="对方的性格"
                placeholder="对方的性格（不确定也没关系）"
                value={partnerMBTI && partnerMBTI !== 'unknown' ? partnerMBTI : undefined}
                onClick={() => setMbtiSheetOpen(true)}
              />

              {/* 当前困扰 */}
              <Selector
                label="当前困扰"
                placeholder="选一两个最贴近你现在状态的就行"
                onClick={() => setConcernsSheetOpen(true)}
                required
              >
                {selectedConcerns.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {getConcernLabels().map((label, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 text-xs bg-[#0071e3]/10 text-[#0071e3] dark:bg-[#0071e3]/20 dark:text-blue-300 rounded"
                      >
                        {label}
                      </span>
                    ))}
                    {selectedConcerns.length > 2 && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs bg-[#e5e5e5] text-[#86868b] dark:bg-[#38383a] dark:text-[#86868b] rounded">
                        +{selectedConcerns.length - 2}
                      </span>
                    )}
                  </div>
                ) : null}
              </Selector>

              {/* 补充描述（可选） */}
              <div className="border border-[#e5e5e5] dark:border-[#38383a] rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                  className="w-full flex items-center justify-between p-4 bg-background hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] transition-colors duration-200"
                >
                  <span className="text-sm font-medium text-[#86868b]">
                    补充一句（可选）
                  </span>
                  {descriptionExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#86868b] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#86868b] flex-shrink-0" />
                  )}
                </button>

                {descriptionExpanded && (
                  <div className="p-4 pt-0 border-t border-[#e5e5e5] dark:border-[#38383a]">
                    <Textarea
                      value={additionalDescription}
                      onChange={(e) => setAdditionalDescription(e.target.value)}
                      placeholder="可以随便写一句发生了什么，不用整理得很完整"
                      className="min-h-[120px] bg-background border-[#e5e5e5] dark:border-[#38383a] resize-none mt-4"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* 分析结果 */
            <div className="space-y-6">
              {/* 保存提示 */}
              {saved && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-lg p-4 text-center">
                  <p className="text-sm text-[#0071e3] dark:text-blue-300">
                    已保存为关系澄清卡。
                  </p>
                </div>
              )}

              {/* A. 关系结构镜像 */}
              <div className="p-6 bg-card border border-[#e5e5e5] dark:border-[#38383a] rounded-lg card-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🪞</span>
                  <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    关系结构镜像
                  </h2>
                </div>
                <div className="prose prose-sm max-w-none text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-pre-wrap leading-relaxed">
                  {result.structureMirror}
                </div>
              </div>

              {/* B. 人格/节奏视角（仅当填写了 MBTI 才显示） */}
              {result.personalityView && (
                <div className="p-6 bg-card border border-[#e5e5e5] dark:border-[#38383a] rounded-lg card-shadow">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🎭</span>
                    <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      人格/节奏视角
                    </h2>
                  </div>
                  <div className="prose prose-sm max-w-none text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-pre-wrap leading-relaxed">
                    {result.personalityView}
                  </div>
                </div>
              )}

              {/* C. 温和方向选项 */}
              <div className="p-6 bg-card border border-[#e5e5e5] dark:border-[#38383a] rounded-lg card-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🧭</span>
                  <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    温和方向
                  </h2>
                </div>
                <div className="space-y-3 mb-4">
                  {result.directions.map((direction, index) => (
                    <div
                      key={index}
                      className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg text-sm text-[#1d1d1f] dark:text-[#f5f5f7]"
                    >
                      {direction}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#86868b] italic">
                  这不是结论，只是一些可能的方向。
                </p>
              </div>

              {/* 进入关系对话按钮 */}
              {saved && savedCardId && (
                <Link
                  href={`/coexist/records/${savedCardId}/chat`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <Button className="w-full bg-[#0071e3] hover:bg-[#0077ed] py-6 text-base">
                    进入关系对话
                  </Button>
                </Link>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-[#e5e5e5] dark:border-[#38383a]"
                  onClick={handleReset}
                >
                  分析另一段关系
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
                  onClick={handleBack}
                >
                  返回
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 底部固定按钮（仅输入表单时显示） */}
        {!result && (
          <div className="fixed bottom-0 left-64 right-0 bg-background/95 dark:bg-background/95 backdrop-blur-sm border-t border-[#e5e5e5] dark:border-[#38383a] p-4 z-30">
            <div className="max-w-4xl mx-auto">
              <Button
                onClick={handleAnalyze}
                disabled={!relationType || selectedConcerns.length === 0 || isAnalyzing}
                className="w-full bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 py-6 text-base"
              >
                {isAnalyzing ? '正在分析...' : '开始聊聊'}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* 关系类型选择 Sheet */}
      <SelectorSheet
        open={relationTypeSheetOpen}
        onOpenChange={setRelationTypeSheetOpen}
        title="选择你们的关系"
        options={RELATIONSHIP_TYPES}
        mode="single"
        value={relationType}
        onConfirm={handleRelationTypeChange}
      />

      {/* MBTI 选择 Sheet */}
      <SelectorSheet
        open={mbtiSheetOpen}
        onOpenChange={setMbtiSheetOpen}
        title="选择对方的 MBTI"
        options={MBTI_TYPES}
        mode="single"
        value={partnerMBTI || 'unknown'}
        onConfirm={handleMBTIChange}
      />

      {/* 困扰选择 Sheet */}
      <SelectorSheet
        open={concernsSheetOpen}
        onOpenChange={setConcernsSheetOpen}
        title="选择当前困扰"
        options={CONCERNS}
        mode="multiple"
        values={selectedConcerns}
        onConfirm={handleConcernsChange}
      />
    </div>
  );
}

// 模拟分析函数
function generateAnalysis(
  relationType: string,
  partnerMBTI: string,
  concerns: string[],
  additionalDescription: string
): AnalysisResult {
  const concernText = concerns.join('、');

  let structureMirror = `你正在一段${relationType}关系中，面临这样的挑战：${concernText}。\n\n这种感觉常常出现在关系出现微妙变化的时候。可能是你们的互动方式有些不同步，也可能是某些未被表达的情绪在慢慢积累。`;

  let personalityView: string | undefined;

  if (partnerMBTI) {
    personalityView = `从对方的性格特点来看，${partnerMBTI} 类型的人通常有自己的节奏和表达方式。这可能在某些方面与你有所不同，但这并不是问题本身，而是需要找到彼此都能理解的沟通方式。`;
  }

  const directions = [
    '先接纳自己的感受，承认这些困扰是真实存在的',
    '尝试找一个相对放松的时刻，用"我"的方式表达你的感受',
    '观察对方的反应，不要急于得到答案，先建立对话的信任感',
    '给自己和关系一些时间，改变往往是渐进的',
  ];

  const theme = `${relationType}关系中的困惑与方向`;

  return {
    structureMirror,
    personalityView,
    directions,
    theme,
    directionLabel: '温和的方向',
  };
}
