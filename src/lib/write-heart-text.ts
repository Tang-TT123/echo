// 输入框占位文案库
const placeholderTexts = [
  '此刻我最想说的一句话是……',
  '刚刚发生了什么？',
  '我现在的感受是……',
  '这件事让我感觉……',
  '我真正想说的是……',
  '现在我的心里……',
  '这一刻，我想……',
  '有些话想对自己说……',
  '让我想想……',
  '慢慢来，不着急……',
];

/**
 * 获取随机的占位文案
 */
export function getRandomPlaceholder(): string {
  const index = Math.floor(Math.random() * placeholderTexts.length);
  return placeholderTexts[index];
}

/**
 * 轻量引导文案库
 */
export const guidePrompts = [
  '我真正需要的是……',
  '让我最难受的是……',
  '如果有人理解我，他会说……',
];

/**
 * 保存反馈文案库（温柔、安抚）
 */
const saveFeedbacks = [
  '已收好。',
  '这段心事被温柔地保存了。',
  '你不需要独自承受。',
  '说出来就很勇敢了。',
  '你的感受很重要。',
  '谢谢你愿意信任自己。',
  '这段记录很有意义。',
  '你做得很好。',
  '允许自己有情绪，没关系的。',
  '这段心事被好好保管了。',
];

/**
 * 获取随机的保存反馈
 */
export function getRandomSaveFeedback(): string {
  const index = Math.floor(Math.random() * saveFeedbacks.length);
  return saveFeedbacks[index];
}
