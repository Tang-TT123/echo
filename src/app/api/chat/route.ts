import { NextRequest } from 'next/server';
import { HeaderUtils } from 'coze-coding-dev-sdk';
import { COEXIST_MODEL_CONFIG } from '@/lib/config/llm';
import { buildCoexistSystemPrompt } from '@/lib/prompts/coexist';
import { deepSeekClient } from '@/lib/deepseekClient';

/**
 * POST /api/chat
 * 获取 AI 回复（流式输出）
 */
export async function POST(request: NextRequest) {
  let userMessage = '';
  let relationshipCard = null;
  let chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  try {
    const body = await request.json();
    userMessage = body.userMessage || '';
    relationshipCard = body.relationshipCard;
    chatHistory = body.chatHistory || [];

    // 验证请求参数
    if (!userMessage) {
      return new Response(
        JSON.stringify({
          success: false,
          error_code: 'MISSING_USER_MESSAGE',
          error: '缺少 userMessage 参数',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!relationshipCard) {
      return new Response(
        JSON.stringify({
          success: false,
          error_code: 'MISSING_RELATIONSHIP_CARD',
          error: '缺少 relationshipCard 参数',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 验证 relationshipCard 结构
    if (!relationshipCard.relationType || !relationshipCard.theme || !relationshipCard.direction) {
      return new Response(
        JSON.stringify({
          success: false,
          error_code: 'INVALID_RELATIONSHIP_CARD',
          error: 'relationshipCard 缺少必要字段',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 提取并转发请求头（必需）
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    console.log('[API] 提取到的自定义请求头:', Object.keys(customHeaders));

    // 使用 DeepSeek 客户端
    const client = deepSeekClient;

    console.log('[API] 开始调用 AI Client（流式）');
    console.log('[API] chatHistory 长度:', chatHistory.length);
    console.log('[API] 关系类型:', relationshipCard.relationType);
    console.log('[API] 主题:', relationshipCard.theme);
    console.log('[API] 使用模型:', COEXIST_MODEL_CONFIG.model);

    // 构建 system prompt（使用独立的配置文件）
    const systemPrompt = buildCoexistSystemPrompt({
      relationType: relationshipCard.relationType,
      theme: relationshipCard.theme,
      direction: relationshipCard.direction,
      partnerMBTI: relationshipCard.partnerMBTI,
    });

    console.log('[API] System Prompt 长度:', systemPrompt.length);

    // 构建消息数组
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...chatHistory,
      { role: 'user', content: userMessage },
    ];

    console.log('[API] 消息数组长度:', messages.length);

    // 创建流式响应（使用独立配置）
    const stream = client.stream(messages, {
      model: COEXIST_MODEL_CONFIG.model,
      temperature: COEXIST_MODEL_CONFIG.temperature,
    }, undefined, customHeaders);

    console.log('[API] 开始流式输出...');

    // 创建 ReadableStream 用于流式输出
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              const content = chunk.content.toString();
              console.log('[API] 流式输出 chunk:', content.substring(0, 50));
              controller.enqueue(encoder.encode(content));
            }
          }
          console.log('[API] 流式输出完成');
          controller.close();
        } catch (error) {
          console.error('[API] 流式输出错误:', error);
          controller.error(error);
        }
      },
    });

    // 返回流式响应
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[API] 服务器错误:', error);
    console.error('[API] 错误类型:', error.constructor.name);
    console.error('[API] 错误消息:', error.message);
    console.error('[API] 错误堆栈:', error.stack);

    // 判断错误类型
    let error_code = 'UNKNOWN_ERROR';
    let error_message = '服务器内部错误';

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message?.includes('network') || error.message?.includes('fetch')) {
      error_code = 'DEEPSEEK_NETWORK_ERROR';
      error_message = '模型连接失败，请检查网络连接';
    } else if (error.message?.includes('timeout')) {
      error_code = 'DEEPSEEK_TIMEOUT';
      error_message = '模型响应超时，请稍后再试';
    } else if (error.message?.includes('auth') || error.message?.includes('API') || error.status === 401) {
      error_code = 'DEEPSEEK_AUTH_FAIL';
      error_message = '模型鉴权失败，请联系管理员';
    } else if (error.status === 429) {
      error_code = 'DEEPSEEK_RATE_LIMIT';
      error_message = '请求过于频繁，请稍后再试';
    } else if (error.status === 500) {
      error_code = 'DEEPSEEK_SERVER_ERROR';
      error_message = '模型服务暂时不可用，请稍后再试';
    } else if (error.message) {
      error_message = error.message;
    }

    // 返回错误响应
    const errorResponse = {
      success: false,
      error_code,
      error: error_message,
      errorType: error.constructor.name,
    };

    return new Response(
      JSON.stringify(errorResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
