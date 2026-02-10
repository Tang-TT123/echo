import { NextRequest, NextResponse } from 'next/server';
import { deepSeekClient } from '@/lib/deepseekClient';

/**
 * POST /api/test-ai
 * 测试 AI 调用是否正常（流式输出）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: '缺少 prompt 参数' },
        { status: 400 }
      );
    }

    console.log('[Test AI] 开始测试 AI 调用（流式）');
    console.log('[Test AI] Prompt:', prompt);

    const client = deepSeekClient;

    const messages = [
      {
        role: 'system' as const,
        content: '你是一个测试助手，请简短回答用户的问题。',
      },
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    console.log('[Test AI] 调用 DeepSeek 模型...');

    const stream = client.stream(messages, {
      model: 'deepseek-chat',
      temperature: 0.8,
    });

    console.log('[Test AI] 开始流式输出...');

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              const content = chunk.content.toString();
              console.log('[Test AI] chunk:', content);
              controller.enqueue(encoder.encode(content));
            }
          }
          console.log('[Test AI] 流式输出完成');
          controller.close();
        } catch (error) {
          console.error('[Test AI] 流式输出错误:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('[Test AI] 错误:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'AI 调用失败',
      errorType: error.constructor.name,
    }, { status: 500 });
  }
}

