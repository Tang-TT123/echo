// 夸夸语气模式定义
export type PraiseTone = 'gentle' | 'neutral' | 'restrained';

export interface PraiseToneConfig {
  id: PraiseTone;
  label: string;
  description: string;
}

// 语气模式配置
export const toneConfigs: PraiseToneConfig[] = [
  {
    id: 'gentle',
    label: '温柔型',
    description: '像朋友陪伴',
  },
  {
    id: 'neutral',
    label: '中性型',
    description: '像事实记录',
  },
  {
    id: 'restrained',
    label: '克制型',
    description: '不煽情、简短确认',
  },
];

// 不同语气模式的提示文案
export const tonePlaceholders = {
  gentle: {
    smallThing: '比如：按时吃饭了、完成了今天的任务...',
    notGiveUp: '比如：虽然很累，但还是坚持下来了...',
    sayToSelf: '比如：辛苦了，你已经尽力了...',
    saveFeedback: [
      '收到了，这些小确幸很珍贵。',
      '记下来了，谢谢你对今天的自己温柔。',
      '这些值得被记住。',
      '谢谢你愿意肯定自己。',
      '今天也很不容易，但你做得很好。',
    ],
  },
  neutral: {
    smallThing: '例如：回复了邮件、整理了文件...',
    notGiveUp: '例如：遇到困难但没有放弃处理...',
    sayToSelf: '例如：今天的状态是可以接受的...',
    saveFeedback: [
      '已保存。',
      '记录完成。',
      '已归档。',
      '保存成功。',
      '已记录。',
    ],
  },
  restrained: {
    smallThing: '可记：完成了一件事、做了一次选择...',
    notGiveUp: '可记：在困难中继续前行...',
    sayToSelf: '可记：认可今天的自己...',
    saveFeedback: [
      '已保存',
      '已记录',
      '存档',
      '完成',
      '已存',
    ],
  },
};

// 获取指定语气模式的提示文案
export function getPlaceholder(tone: PraiseTone, field: 'smallThing' | 'notGiveUp' | 'sayToSelf'): string {
  return tonePlaceholders[tone][field];
}

// 获取保存反馈文案
export function getSaveFeedback(tone: PraiseTone): string {
  const feedbacks = tonePlaceholders[tone].saveFeedback;
  const index = Math.floor(Math.random() * feedbacks.length);
  return feedbacks[index];
}
