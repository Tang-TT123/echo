import { LLMClient, Config, LLMConfig } from 'coze-coding-dev-sdk';

/**
 * 关系教练系统人格
 */
export const RELATION_COACH_SYSTEM_PROMPT = `你是一位温和、克制、不评判的关系教练，专门帮助 INFJ 人群理清关系中的困惑。

## 你的角色定位
- 像一位有同理心的朋友，倾听而不急于给建议
- 帮助用户看清关系中的模式，但不替用户做决定
- 尊重用户的节奏，不强迫"向前看"或"放下"

## 回复结构要求（灵活应用）
每次回复应该包含以下 4 个部分，但不需要严格标注，用自然的语言表达即可：

### 1. 镜像复述（不超过 20 字）
复述用户的核心困惑或情绪，用"看起来/也许/可能"等温和措辞。
示例：
- "看起来你在这段关系中感到有些委屈"
- "也许你不确定该如何表达自己的需求"
- "可能你在这段关系中有点内耗"

### 2. 可能解释（2-3 条）
给出 2-3 个可能的原因或角度，用"也许/可能/另一种可能是"开头。
每个解释不超过 30 字，保持开放性，不下结论。
**重要**：根据对话历史和用户的具体情况，动态调整解释内容，不要重复相同的模板。
示例：
- 也许对方也感到困惑，不知道如何回应你
- 可能你们的沟通节奏不太一样
- 另一种可能是，你对自己有些严厉

### 3. 可执行下一步（2 个）
给出 2 个非常小、可立即执行的行动，不需要太费力。
每个行动不超过 25 字，强调"可以试试"而不是"必须"。
**重要**：根据对话上下文，给出个性化的行动建议。
示例：
- 可以试着给自己 5 分钟，什么都不做
- 试试写下你此刻最想对TA说的一句话

### 4. 继续追问（2 个选项）
给出 2 个用户可以选择的追问方向，帮助对话继续深入。
**重要**：基于当前对话的上下文，提出相关联的追问，帮助用户深入探索。
示例：
- 你更想探索哪一种可能性？
- 或者，你想聊聊你自己的感受？

## 上下文引用要求
- 仔细阅读对话历史，引用用户之前提到的具体细节
- 根据对话的进展，调整回复的侧重点
- 保持对话的连贯性和深度

## 禁止事项
❌ 禁止说教："你应该..."
❌ 禁止鸡汤："一切都会好的"
❌ 禁止夸大诊断："这就是典型的..."
❌ 禁止下结论："TA就是不喜欢你"
❌ 禁止强迫："你必须..."
❌ 禁止评判："这样做不对"
❌ 禁止使用固定模板：每次回复都要根据上下文动态生成

## 语气要求
- 温和：像在和一个好朋友聊天
- 克制：不给过度的情绪反馈
- 不评判：尊重用户的所有感受
- INFJ 友好：理解 INFJ 的内省和细腻

记住：你不是来"解决"问题，而是陪伴用户一起探索。`;

/**
 * 构建对话消息
 * @param relationshipCard 关系澄清卡信息
 * @param chatHistory 聊天历史
 * @param userMessage 用户新消息
 * @returns 消息数组
 */
export function buildConversationMessages(
  relationshipCard: {
    relationType: string;
    theme: string;
    direction: string;
    partnerMBTI?: string;
  },
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  userMessage: string
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  // 限制历史消息数量（最近 20 条）
  const recentHistory = chatHistory.slice(-20);

  // 构建 context 信息
  const contextInfo = `## 关系背景信息

**关系类型**：${relationshipCard.relationType}
**核心主题**：${relationshipCard.theme}
**温和方向**：${relationshipCard.direction}
${relationshipCard.partnerMBTI ? `**对方 MBTI**：${relationshipCard.partnerMBTI}` : ''}

请基于以上关系信息，回答用户的问题。`;

  // 构建消息数组
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: `${RELATION_COACH_SYSTEM_PROMPT}\n\n${contextInfo}`,
    },
    ...recentHistory.map((msg) => ({
      role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.content,
    })),
    {
      role: 'user',
      content: userMessage,
    },
  ];

  return messages;
}

/**
 * AI 调用错误类
 */
export class AICallError extends Error {
  constructor(
    message: string,
    public errorType: 'network' | 'api' | 'unknown',
    public originalError?: any
  ) {
    super(message);
    this.name = 'AICallError';
  }
}

/**
 * LLM 配置
 */
const llmConfig: LLMConfig = {
  model: 'deepseek-v3-2-251201', // 使用 DeepSeek V3.2 模型
  temperature: 0.8, // 适中的创造力
  caching: 'enabled', // 启用缓存以支持多轮对话
  streaming: false, // 非流式响应（前端实现流式效果）
};

/**
 * AI Client 类
 */
export class AIClient {
  private client: LLMClient;

  constructor() {
    const config = new Config();
    this.client = new LLMClient(config);
  }

  /**
   * 调用 AI 获取回复
   * @param relationshipCard 关系澄清卡信息
   * @param chatHistory 聊天历史
   * @param userMessage 用户新消息
   * @returns AI 回复
   * @throws AICallError 当 AI 调用失败时抛出
   */
  async getReply(
    relationshipCard: {
      relationType: string;
      theme: string;
      direction: string;
      partnerMBTI?: string;
    },
    chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    userMessage: string
  ): Promise<string> {
    try {
      // 构建对话消息
      const messages = buildConversationMessages(
        relationshipCard,
        chatHistory,
        userMessage
      );

      console.log('[AI Client] 开始调用 DeepSeek 模型');
      console.log('[AI Client] 消息数量:', messages.length);
      console.log('[AI Client] 系统提示词长度:', messages[0]?.content?.length || 0);
      console.log('[AI Client] 用户消息:', userMessage.substring(0, 50) + '...');
      console.log('[AI Client] 配置模型:', llmConfig.model);

      // 调用 LLM（真实大模型 API）
      console.log('[AI Client] 开始调用 client.invoke...');
      const response = await this.client.invoke(messages, llmConfig);
      console.log('[AI Client] client.invoke 调用完成');

      console.log('[AI Client] 收到 API 响应');
      console.log('[AI Client] 响应类型:', typeof response);
      console.log('[AI Client] 响应是否为 null:', response === null);
      console.log('[AI Client] 响应是否为 undefined:', response === undefined);

      // 打印完整的响应对象（包含所有属性）
      console.log('[AI Client] 响应完整对象:', JSON.stringify(response, null, 2));
      console.log('[AI Client] 响应键值列表:', Object.keys(response));

      // 校验响应结构
      if (!response) {
        throw new AICallError('API 返回空响应', 'api', new Error('Empty response'));
      }

      // 尝试不同的可能结构
      let replyContent: string | undefined;

      // 方式1: 标准 LLMResponse 结构 (最常见)
      console.log('[AI Client] 尝试方式1: response.content');
      if (response && typeof response === 'object' && 'content' in response) {
        console.log('[AI Client] 发现 content 属性，类型:', typeof (response as any).content);
        if (typeof (response as any).content === 'string') {
          replyContent = (response as any).content;
          console.log('[AI Client] ✓ 方式1 成功');
        }
      }

      // 方式2: 嵌套结构 response.data.content
      if (!replyContent && response && typeof response === 'object' && 'data' in response) {
        console.log('[AI Client] 尝试方式2: response.data.content');
        const data = (response as any).data;
        console.log('[AI Client] data 对象:', JSON.stringify(data, null, 2));
        if (data && typeof data.content === 'string') {
          replyContent = data.content;
          console.log('[AI Client] ✓ 方式2 成功');
        }
      }

      // 方式3: OpenAI 兼容结构 response.choices[0].message.content
      if (!replyContent && response && typeof response === 'object' && 'choices' in response) {
        console.log('[AI Client] 尝试方式3: response.choices[0].message.content');
        const choices = (response as any).choices;
        console.log('[AI Client] choices 数组长度:', choices?.length);
        if (choices && choices.length > 0 && choices[0] && choices[0].message) {
          console.log('[AI Client] message 对象:', JSON.stringify(choices[0].message, null, 2));
          if (typeof choices[0].message.content === 'string') {
            replyContent = choices[0].message.content;
            console.log('[AI Client] ✓ 方式3 成功');
          }
        }
      }

      // 方式4: 直接就是字符串
      if (!replyContent && typeof response === 'string') {
        console.log('[AI Client] 尝试方式4: 响应本身是字符串');
        replyContent = response;
        console.log('[AI Client] ✓ 方式4 成功');
      }

      console.log('[AI Client] 提取到的内容长度:', replyContent?.length || 0);

      if (!replyContent) {
        console.error('[AI Client] ❌ 无法从响应中提取内容');
        console.error('[AI Client] 完整响应:', JSON.stringify(response, null, 2));
        throw new AICallError(
          `API 返回无法识别的响应结构。响应类型: ${typeof response}，包含属性: ${Object.keys(response).join(', ')}`,
          'api',
          new Error('Unrecognized response structure')
        );
      }

      if (replyContent.trim() === '') {
        throw new AICallError('AI 返回空内容', 'api', new Error('Empty content'));
      }

      console.log('[AI Client] DeepSeek 回复成功');
      console.log('[AI Client] 回复长度:', replyContent.length);
      console.log('[AI Client] 回复内容预览:', replyContent.substring(0, 100) + '...');

      // 直接返回模型生成的内容，不做任何模板处理
      return replyContent;
    } catch (error: any) {
      console.error('[AI Client] AI 调用失败:', error);
      console.error('[AI Client] 错误类型:', error.constructor.name);
      console.error('[AI Client] 错误消息:', error.message);
      console.error('[AI Client] 错误堆栈:', error.stack);

      // 判断错误类型
      let errorType: 'network' | 'api' | 'unknown' = 'unknown';
      let errorMessage = 'AI 调用失败';

      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message?.includes('network') || error.message?.includes('fetch')) {
        errorType = 'network';
        errorMessage = '网络连接失败，无法获取 AI 回复';
      } else if (error.message?.includes('API') || error.status || error.statusCode) {
        errorType = 'api';
        errorMessage = 'AI 服务暂时不可用，请稍后再试';
      } else if (error.name === 'AICallError') {
        // 重新抛出 AICallError
        throw error;
      } else {
        errorMessage = `AI 调用失败: ${error.message || '未知错误'}`;
      }

      // 抛出明确的错误，不再使用模板冒充 AI
      throw new AICallError(errorMessage, errorType, error);
    }
  }

  /**
   * 调用 AI 获取流式回复
   * @param relationshipCard 关系澄清卡信息
   * @param chatHistory 聊天历史
   * @param userMessage 用户新消息
   * @returns AsyncGenerator<string> 流式回复内容
   */
  async *streamReply(
    relationshipCard: {
      relationType: string;
      theme: string;
      direction: string;
      partnerMBTI?: string;
    },
    chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    userMessage: string
  ): AsyncGenerator<string> {
    try {
      // 构建对话消息
      const messages = buildConversationMessages(
        relationshipCard,
        chatHistory,
        userMessage
      );

      console.log('[AI Client] 开始流式调用 DeepSeek 模型');
      console.log('[AI Client] 消息数量:', messages.length);

      // 调用 LLM stream
      const stream = await this.client.stream(messages, {
        ...llmConfig,
        streaming: true,
      });

      for await (const chunk of stream) {
        if (chunk.content) {
          const content = chunk.content.toString();
          yield content;
        }
      }
      
      console.log('[AI Client] 流式调用完成');
    } catch (error: any) {
      console.error('[AI Client] 流式调用失败:', error);
      // 这里的错误处理可能需要根据实际需求调整，因为 generator 已经开始 yielding 了
      throw new AICallError(error.message || 'Stream error', 'api', error);
    }
  }
}

// 导出单例
export const aiClient = new AIClient();
