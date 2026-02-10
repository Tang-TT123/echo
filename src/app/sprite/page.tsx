'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sidebar } from '@/components/sidebar';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickQuestion {
  id: number;
  question: string;
  icon: string;
}

const quickQuestionsByGroup = {
  recommended: [
    {
      id: 1,
      question: '历史上或电影里有哪些 INFJ 名人？',
      icon: '🎬',
    },
    {
      id: 2,
      question: 'INFJ 适合什么工作/专业？',
      icon: '💼',
    },
    {
      id: 3,
      question: '余音/共生怎么用？',
      icon: '📖',
    },
  ],
  need: [
    {
      id: 4,
      question: '我有点焦虑，怎么快速缓一缓？',
      icon: '🌿',
    },
    {
      id: 5,
      question: '帮我把这段话说得更礼貌/更有边界感',
      icon: '✨',
    },
    {
      id: 6,
      question: '帮我把一个想法写成更清晰的提纲',
      icon: '📝',
    },
  ],
};

type AnswerStyle = 'brief' | 'expand';

import { MarkdownRenderer } from '@/components/markdown-renderer';

export default function SpritePage() {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answerStyle, setAnswerStyle] = useState<AnswerStyle>('brief');
  const [showQuickQuestionHint, setShowQuickQuestionHint] = useState(false);
  const [isFromQuickQuestion, setIsFromQuickQuestion] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
    setIsFromQuickQuestion(true);
    setShowQuickQuestionHint(true);
    // 自动聚焦到输入框
    const textarea = document.querySelector('textarea');
    textarea?.focus();
  };

  const handleInputChange = (value: string) => {
    setInputText(value);
    // 用户手动修改输入时，隐藏提示
    if (showQuickQuestionHint && isFromQuickQuestion) {
      setShowQuickQuestionHint(false);
      setIsFromQuickQuestion(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) {
      toast.error('请输入内容');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    // 添加用户消息
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsSending(true);

    // 创建临时助手消息用于流式显示
    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ]);

    try {
      // 构建历史消息（排除 system prompt，只传对话历史）
      const chatHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/sprite-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: currentInput,
          chatHistory,
          detailLevel: answerStyle === 'brief' ? 'short' : 'long',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[小E精灵] API 错误:', errorData);

        // 根据错误代码显示不同的错误提示
        if (errorData.error_code === 'SPRITE_NETWORK_ERROR') {
          toast.error('连接失败', {
            description: errorData.error || '网络连接异常，请检查网络后重试',
          });
        } else if (errorData.error_code === 'SPRITE_TIMEOUT') {
          toast.error('响应超时', {
            description: errorData.error || '模型响应时间过长，请稍后再试',
          });
        } else if (errorData.error_code === 'SPRITE_AUTH_FAIL') {
          toast.error('鉴权失败', {
            description: errorData.error || '模型服务鉴权异常，请联系管理员',
          });
        } else if (errorData.error_code === 'SPRITE_RATE_LIMIT') {
          toast.error('请求过于频繁', {
            description: errorData.error || '请稍后再试',
          });
        } else if (errorData.error_code === 'SPRITE_SERVER_ERROR') {
          toast.error('服务异常', {
            description: errorData.error || '模型服务暂时不可用，请稍后再试',
          });
        } else {
          toast.error('发送失败', {
            description: errorData.error || '未知错误',
          });
        }

        // 更新助手消息为错误提示
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: '小E精灵暂时没听清，能不能再说一遍？😅',
                }
              : msg
          )
        );
        setIsSending(false);
        return;
      }

      // 流式读取响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;

          // 更新流式输出
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, content: assistantContent } : msg
            )
          );
        }
      }

      console.log('[小E精灵] 对话完成');
      // 隐藏快捷问题提示
      setShowQuickQuestionHint(false);
      setIsFromQuickQuestion(false);
    } catch (error) {
      console.error('[小E精灵] 请求错误:', error);
      toast.error('请求失败', {
        description: '网络请求异常，请稍后重试',
      });

      // 更新助手消息为错误提示
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content: '小E精灵暂时没听清，能不能再说一遍？😅',
              }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-[#e5e5e5] dark:border-[#38383a]">
          <div className="max-w-4xl mx-auto px-8 py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-2xl shadow-lg">
                🧚
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  小E精灵
                </h1>
                <p className="text-sm text-[#86868b]">
                  想聊什么都可以
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-8 py-8 space-y-8">
          {/* 首屏欢迎条 - 仅在无聊天记录时显示 */}
          {messages.length === 0 && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-2xl px-6 py-4 border border-pink-100 dark:border-pink-900/20">
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">✨</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                    我是小E精灵✨ 这里什么都能聊～
                  </p>
                  <p className="text-xs text-[#86868b] mt-1">
                    如果是关系相处困扰，去「共生」会更专业一点
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 聊天记录 */}
          {messages.length > 0 && (
            <div className="space-y-4 mb-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-lg flex-shrink-0 shadow-md">
                      🧚
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                        : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7]'
                    }`}
                  >
                    <div className="text-sm leading-relaxed">
                      <MarkdownRenderer content={message.content} />
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-lg flex-shrink-0 shadow-md">
                      👤
                    </div>
                  )}
                </div>
              ))}
              {isSending && (
                <div className="flex gap-4 justify-start">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-lg flex-shrink-0 shadow-md">
                    🧚
                  </div>
                  <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] px-4 py-3 rounded-2xl">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-[#86868b] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-[#86868b] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-[#86868b] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* 猜你想问 - 仅在无聊天记录时显示 */}
          {messages.length === 0 && (
            <div className="space-y-6">
              {/* 今日推荐 */}
              <div>
                <h3 className="text-base font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">
                  今日推荐
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quickQuestionsByGroup.recommended.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleQuickQuestion(item.question)}
                      className="text-left px-4 py-3 rounded-lg border border-[#e5e5e5] dark:border-[#38383a] hover:border-[#0071e3] dark:hover:border-blue-400 bg-card hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] transition-smooth group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-xl group-hover:scale-110 transition-smooth">
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                            {item.question}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 你可能需要 */}
              <div>
                <h3 className="text-base font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">
                  你可能需要
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quickQuestionsByGroup.need.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleQuickQuestion(item.question)}
                      className="text-left px-4 py-3 rounded-lg border border-[#e5e5e5] dark:border-[#38383a] hover:border-[#0071e3] dark:hover:border-blue-400 bg-card hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] transition-smooth group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-xl group-hover:scale-110 transition-smooth">
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                            {item.question}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 输入区域 */}
          <Card className="p-6 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow">
            <div className="space-y-4">
              {/* 输入框标题和简短/展开开关 */}
              <div className="flex justify-between items-start">
                <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                  想聊点什么？
                </label>
                <div className="flex items-center gap-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg p-1">
                  <button
                    onClick={() => setAnswerStyle('brief')}
                    className={`px-3 py-1 text-xs rounded-md transition-smooth ${
                      answerStyle === 'brief'
                        ? 'bg-white dark:bg-[#3c3c3e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-sm'
                        : 'text-[#86868b] hover:text-[#1d1d1f]'
                    }`}
                  >
                    简短
                  </button>
                  <button
                    onClick={() => setAnswerStyle('expand')}
                    className={`px-3 py-1 text-xs rounded-md transition-smooth ${
                      answerStyle === 'expand'
                        ? 'bg-white dark:bg-[#3c3c3e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-sm'
                        : 'text-[#86868b] hover:text-[#1d1d1f]'
                    }`}
                  >
                    展开
                  </button>
                </div>
              </div>

              {/* 可编辑提示 */}
              {showQuickQuestionHint && (
                <div className="text-xs text-[#86868b]">
                  已帮你选好问题，你也可以改改再发
                </div>
              )}

              {/* 输入框 */}
              <div>
                <Textarea
                  value={inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="随便说点什么，小E精灵会认真听..."
                  className="min-h-[120px] bg-background border-[#e5e5e5] dark:border-[#38383a] resize-none"
                  disabled={isSending}
                />
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-[#86868b]">
                  按 Enter 发送，Shift + Enter 换行
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setInputText('')}
                    disabled={isSending || !inputText.trim()}
                    className="border-[#e5e5e5] dark:border-[#38383a]"
                  >
                    清空
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={isSending || !inputText.trim()}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    {isSending ? '发送中...' : '发送 ✨'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* 功能说明 - 仅在无聊天记录时显示 */}
          {messages.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e]">
                <span className="text-sm text-[#86868b]">
                  🧚 小E精灵是一个通用的 AI 小助手，想聊什么都可以～
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e]">
                <span className="text-sm text-[#86868b]">
                  💡 如果是关系困惑，推荐试试「共生」模块，更专业～
                </span>
              </div>
            </div>
          )}

          {/* 安全与边界轻提示 */}
          <div className="text-center py-4">
            <p className="text-xs text-[#86868b]">
              提示：我不是医生/律师/投资顾问；紧急情况请优先联系线下专业帮助。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
