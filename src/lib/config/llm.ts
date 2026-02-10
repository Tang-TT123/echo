/**
 * LLM 模型配置
 *
 * 每个模块使用独立的模型配置，确保互不影响
 */

/**
 * 共生 Co-exist 模块配置
 * 用于关系对话陪伴者 Echo
 */
export const COEXIST_MODEL_CONFIG = {
  model: 'deepseek-chat',
  temperature: 0.8,
  provider: 'deepseek',
} as const;

/**
 * 小精灵 Sprite 模块配置（预留）
 * 用于通用助手功能
 */
export const SPRITE_MODEL_CONFIG = {
  model: 'deepseek-chat',
  temperature: 0.7,
  provider: 'deepseek',
} as const;

/**
 * 获取指定模块的模型配置
 */
export function getModelConfig(module: 'coexist' | 'sprite') {
  switch (module) {
    case 'coexist':
      return COEXIST_MODEL_CONFIG;
    case 'sprite':
      return SPRITE_MODEL_CONFIG;
    default:
      return COEXIST_MODEL_CONFIG;
  }
}
