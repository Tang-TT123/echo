'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/sidebar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useNavigationBack } from '@/hooks/use-navigation-back';
import {
  getRelationshipClarityCards,
  addChatMessage,
  updateCardSummary,
  generateAssistantReply,
  generateThreadSummary,
  RelationshipClarityCard,
  ChatMessage,
} from '@/lib/storage';

const QUICK_QUESTIONS = [
  '我该怎么说更合适？给我一个温柔版和一个坚定版',
  '对方可能在想什么？给2个可能解释，不裁决',
  '给我下一步行动：两个可选方案 + 各自风险',
];

import { MarkdownRenderer } from '@/components/markdown-renderer';

// 格式化日期
function formatDate(date: string | number | Date | undefined): string {
  if (!date) return '';

  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;

  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function CoachChatPage() {
  const params = useParams();
  const { handleBack } = useNavigationBack(`/coexist/records/${params.id}`);
  const [card, setCard] = useState<RelationshipClarityCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [streamingReply, setStreamingReply] = useState(''); // 用于显示流式输出的临时消息
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 加载卡片数据
  useEffect(() => {
    const cards = getRelationshipClarityCards();
    const foundCard = cards.find((c) => c.id === params.id);

    if (foundCard) {
      // 如果是第一次进入对话页（chatThread 为空），自动添加系统消息
      if (foundCard.chatThread.length === 0) {
        const initialMessage = `📋 **关系分析结论**

**关系类型**：${foundCard.relationType}

**核心主题**：${foundCard.theme}

**温和方向**：${foundCard.direction}

${foundCard.partnerMBTI ? `**对方 MBTI**：${foundCard.partnerMBTI}` : ''}

---

这是这张关系澄清卡的分析结论。接下来，我们可以基于这个基础，继续深入探索。你可以：

- 问我具体的沟通话术
- 探索对方的可能想法
- 制定下一步行动计划
- 分享你的感受和困扰

随时开始吧，我会陪伴你一起探索。`;

        addChatMessage(foundCard.id, 'assistant', initialMessage);

        // 重新加载卡片数据
        const updatedCards = getRelationshipClarityCards();
        const updatedCard = updatedCards.find((c) => c.id === params.id);
        setCard(updatedCard || null);
      } else {
        setCard(foundCard);
      }
    } else {
      setCard(null);
    }

    setLoading(false);
  }, [params.id]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [card?.chatThread]);

  // 发送消息
  const handleSend = async () => {
    if (!inputText.trim() || !card || isSending) {
      return;
    }

    setIsSending(true);
    setStreamingReply(''); // 重置流式输出

    // 1. 立即追加用户消息
    const userMessage = inputText.trim();
    addChatMessage(card.id, 'user', userMessage);

    // 重新加载卡片数据
    const updatedCards = getRelationshipClarityCards();
    const updatedCard = updatedCards.find((c) => c.id === params.id);
    setCard(updatedCard || null);

    setInputText('');

    // 2. 调用 AI API 生成助手回复（流式）
    try {
      if (!updatedCard) {
        throw new Error('Card not found');
      }

      // 准备聊天历史（排除系统初始化消息）
      const chatHistory = (updatedCard.chatThread || [])
        .filter(msg => !msg.content.startsWith('📋 **关系分析结论**'))
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      console.log('[前端] 开始调用后端 API（流式）');
      console.log('[前端] chatHistory 长度:', chatHistory.length);

      // 调用后端 API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          relationshipCard: {
            relationType: updatedCard.relationType,
            theme: updatedCard.theme,
            direction: updatedCard.direction,
            partnerMBTI: updatedCard.partnerMBTI,
          },
          chatHistory,
          userMessage,
        }),
      });

      console.log('[前端] API 响应状态:', response.status);

      // 检查响应头，确认是否为流式响应
      const contentType = response.headers.get('content-type');
      console.log('[前端] Content-Type:', contentType);

      if (response.ok && contentType?.includes('text/plain')) {
        // 流式响应处理
        console.log('[前端] 开始接收流式数据');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullReply = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log('[前端] 流式数据接收完成');
              break;
            }

            // 解码并追加内容
            const chunk = decoder.decode(value, { stream: true });
            fullReply += chunk;
            setStreamingReply(fullReply); // 更新临时消息，实时显示

            console.log('[前端] 收到 chunk，当前长度:', fullReply.length);
          }
        }

        // 流式接收完成，保存完整消息
        console.log('[前端] AI 回复完成，总长度:', fullReply.length);
        addChatMessage(updatedCard.id, 'assistant', fullReply);
        setStreamingReply(''); // 清空临时消息
      } else {
        // 非 2xx 响应或非流式响应
        const data = await response.json();
        console.error('[前端] API 调用失败');
        console.error('[前端] 错误信息:', data.error);
        console.error('[前端] 错误代码:', data.error_code);
        console.error('[前端] 完整响应:', data);

        // 根据 error_code 显示不同的错误提示
        let errorMessage = '❌ AI 调用失败，请稍后再试';

        if (data.error_code === 'DEEPSEEK_NETWORK_ERROR') {
          errorMessage = '❌ 模型连接失败，请检查网络连接';
        } else if (data.error_code === 'DEEPSEEK_TIMEOUT') {
          errorMessage = '❌ 模型响应超时，请稍后再试';
        } else if (data.error_code === 'DEEPSEEK_AUTH_FAIL') {
          errorMessage = '❌ 模型鉴权失败，请联系管理员';
        } else if (data.error_code === 'DEEPSEEK_RATE_LIMIT') {
          errorMessage = '❌ 请求过于频繁，请稍后再试';
        } else if (data.error_code === 'DEEPSEEK_SERVER_ERROR') {
          errorMessage = '❌ 模型服务暂时不可用，请稍后再试';
        } else if (data.error) {
          errorMessage = `❌ ${data.error}`;
        }

        addChatMessage(updatedCard.id, 'assistant', errorMessage);
      }
    } catch (error: any) {
      console.error('[前端] 请求异常:', error);
      console.error('[前端] 错误类型:', error.constructor.name);
      console.error('[前端] 错误消息:', error.message);
      console.error('[前端] 错误堆栈:', error.stack);

      // 网络错误，显示明确的错误提示
      const errorMessage = `❌ 网络连接失败，请检查网络后重试`;
      addChatMessage(card.id, 'assistant', errorMessage);
      setStreamingReply(''); // 清空临时消息
    }

    // 3. 重新加载卡片数据
    const newCards = getRelationshipClarityCards();
    const newCard = newCards.find((c) => c.id === params.id);
    setCard(newCard || null);

    // 4. 检查是否需要更新摘要（每6轮对话更新一次）
    const userMessageCount = newCard?.chatThread.filter(m => m.role === 'user').length || 0;
    if (newCard && userMessageCount % 6 === 0) {
      const summary = generateThreadSummary(newCard.chatThread, newCard);
      updateCardSummary(newCard.id, summary);

      // 重新加载卡片数据以获取摘要
      const finalCards = getRelationshipClarityCards();
      const finalCard = finalCards.find((c) => c.id === params.id);
      setCard(finalCard || null);
    }

    setIsSending(false);
  };

  // 点击快捷追问按钮
  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  // 格式化日期（兼容 string | number | Date | undefined）
  const formatDate = (value: string | number | Date | undefined) => {
    if (!value) return '';

    let date: Date;
    if (value instanceof Date) {
      date = value;
    } else {
      date = new Date(value);
    }

    if (isNaN(date.getTime())) return '';

    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar />
        <main className="ml-64">
          <header className="sticky top-0 z-40 glass border-b border-[#e5e5e5] dark:border-[#38383a]">
            <div className="max-w-4xl mx-auto px-8 py-4">
              <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                关系对话
              </h1>
            </div>
          </header>
          <div className="max-w-4xl mx-auto px-8 py-8">
            <div className="text-center py-12">
              <p className="text-[#86868b]">加载中...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar />
        <main className="ml-64">
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
                <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  关系对话
                </h1>
              </div>
            </div>
          </header>
          <div className="max-w-4xl mx-auto px-8 py-8">
            <Card className="p-8 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow text-center">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-[#86868b] mb-4">未找到这张关系澄清卡</p>
              <Button onClick={handleBack} className="bg-[#0071e3] hover:bg-[#0077ed]">
                返回
              </Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

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
                  关系对话（Coach Chat）
                </h1>
              </div>
            </div>
            <p className="text-sm text-[#86868b] mt-1 ml-16">
              持续追问，深入探索
            </p>
          </div>
        </header>

        {/* 调试提示 */}
        <div className="max-w-4xl mx-auto px-8 py-2">
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2">
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
              关系对话已就绪 ✅
            </p>
          </div>
        </div>

        {/* 对话信息 */}
        <div className="max-w-4xl mx-auto px-8 py-4">
          <Card className="p-4 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {card.relationType}
              </Badge>
              <span className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                主题：{card.theme}
              </span>
              <span className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                方向：{card.direction}
              </span>
              {card.partnerMBTI && (
                <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {card.partnerMBTI}
                </Badge>
              )}
            </div>
          </Card>
        </div>

        {/* 对话摘要 */}
        {card.threadSummary && (
          <div className="max-w-4xl mx-auto px-8 py-2">
            <Card className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 card-shadow">
              <button
                className="w-full text-left flex items-center justify-between"
                onClick={() => setSummaryExpanded(!summaryExpanded)}
              >
                <span className="text-sm font-medium text-[#0071e3] dark:text-blue-300">
                  本线程摘要
                </span>
                <span className="text-xs text-[#0071e3] dark:text-blue-300">
                  {summaryExpanded ? '收起' : '展开'}
                </span>
              </button>
              {summaryExpanded && (
                <div className="mt-3 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-pre-wrap">
                  {card.threadSummary}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* 聊天消息列表 */}
        <div className="max-w-4xl mx-auto px-8 py-4 min-h-[400px]">
          {card.chatThread.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-[#86868b] mb-2">还没有对话记录</p>
              <p className="text-sm text-[#86868b]">
                开始提问吧，我会陪伴你探索这段关系
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {card.chatThread.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-[#0071e3] text-white'
                        : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7]'
                    }`}
                  >
                    <div className="text-xs mb-2 opacity-70">
                      {message.role === 'user' ? '你' : '关系教练'} • {formatDate(message.createdAt)}
                    </div>
                    <div className="text-sm leading-relaxed">
                      <MarkdownRenderer content={message.content} />
                    </div>
                  </div>
                </div>
              ))}

              {/* 流式输出的临时消息 */}
              {streamingReply && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-4 rounded-lg bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7]">
                    <div className="text-xs mb-2 opacity-70">
                      关系教练 • 正在输入...
                    </div>
                    <div className="text-sm leading-relaxed">
                      <MarkdownRenderer content={streamingReply} />
                      <span className="inline-block w-2 h-4 ml-1 bg-[#0071e3] animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <div className="max-w-4xl mx-auto px-8 py-4">
          {/* 快捷追问按钮 */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs border-[#e5e5e5] dark:border-[#38383a] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e]"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          {/* 输入框 */}
          <Card className="p-4 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow">
            <div className="flex gap-3">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="输入你的问题或想法..."
                className="flex-1 min-h-[80px] bg-background border-[#e5e5e5] dark:border-[#38383a] resize-none"
                disabled={isSending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                onClick={handleSend}
                disabled={!inputText.trim() || isSending}
                className="bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 px-6"
              >
                {isSending ? '发送中...' : '发送'}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
