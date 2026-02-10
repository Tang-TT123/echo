// 每日建议库 - 风格：现代、温柔、不鸡汤、不说教
const dailySuggestions = [
  '今日适合独处，不必强撑社交。',
  '今天更适合整理内心，而不是做决定。',
  '允许慢下来，比效率更重要。',
  '今天不必追求完美，做到就好。',
  '给自己一点时间，不必急于回应。',
  '今天适合倾听，多于表达。',
  '不必解释自己，懂你的人会懂。',
  '今天可以暂停，允许自己休息。',
  '不必强求理解，先理解自己就好。',
  '今天适合做一件小事，感受完成。',
  '不必讨好所有人，先照顾自己。',
  '今天可以什么都不做，只是存在。',
  '不必时时在线，偶尔消失没关系。',
  '今天适合观察，而不是评判。',
  '不必立即行动，想清楚再做。',
  '今天可以接受不完美，拥抱真实。',
  '不必强求共鸣，独处也挺好。',
  '今天适合放下，不必紧抓不放。',
  '不必对抗情绪，允许它流淌。',
  '今天可以信任直觉，比逻辑更有用。',
  '不必急着成长，慢慢来也可以。',
  '今天适合原谅自己，不必苛责。',
  '不必证明什么，你的存在本身就是。',
  '今天可以拥抱不确定，允许未知。',
  '不必掌控一切，放手一部分。',
  '今天适合温柔，对自己也对他人。',
  '不必总是理性，感性也很有用。',
  '今天可以暂停思考，只是感受。',
  '不必分析所有事情，有些事无法解释。',
  '今天适合相信，怀疑也可以放一放。',
];

/**
 * 根据日期获取今日建议
 * 同一天的建议是固定的
 */
export function getDailySuggestion(date: Date = new Date()): string {
  // 使用日期的年月日作为种子
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const index = seed % dailySuggestions.length;
  return dailySuggestions[index];
}

/**
 * 获取明天的建议（用于预告，可选功能）
 */
export function getTomorrowSuggestion(date: Date = new Date()): string {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getDailySuggestion(tomorrow);
}
