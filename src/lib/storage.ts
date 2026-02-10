// 本地存储键名
const STORAGE_KEYS = {
  HEART_RECORDS: 'echo_heart_records',
  PRAISE_RECORDS: 'echo_praise_records',
  HEART_FILTER: 'echo_heart_filter',  // 写心事筛选状态
  CAPSULES: 'echo_capsules',           // 时间胶囊
  RELATIONSHIP_CLARITY_CARDS: 'echo_relationship_clarity_cards', // 关系澄清卡
}

// 心事记录类型
export interface HeartRecord {
  id: string;
  type: 'journal';
  content: string;
  createdAt: Date;
  tagsEmotion: string[];  // 情绪标签
  tagsContext: string[];  // 场景标签
  energyTag: string;      // 耗能/中性/充能
  isLowMoment?: boolean;  // 低能量时刻标记（可选）
  updatedAt?: Date;       // 更新时间（可选）
}

// 夸夸记录类型
export interface PraiseRecord {
  id: string;
  type: 'praise';
  line1: string;          // 我今天做对的一件小事
  line2: string;          // 我今天没有放弃的地方
  line3: string;          // 我愿意对自己说一句
  toneMode: 'gentle' | 'neutral' | 'restrained';
  createdAt: Date;
  isLowMoment?: boolean;  // 低能量时刻标记（可选）
}

// 写心事筛选状态类型
export interface HeartFilterState {
  timeFilter: 'today' | 'week' | 'month' | 'all';
  tagFilter: {
    type: 'mood' | 'scene' | null;
    value: string;
  };
}

// 时间胶囊类型
export interface Capsule {
  id: string;
  type: 'capsule';
  title: string;             // 标题（自动生成，如"写于 2026-01-30"）
  content: string;           // 内容
  unlockAt: Date;            // 解锁时间（未来的某个日期）
  createdAt: Date;           // 创建日期
  status: 'locked' | 'unlocked' | 'opened'; // 状态：锁定、解锁、已开启
  openedAt?: Date;           // 开启时间（可选）
  reply?: string;            // 补充回复（可选）
}

// 安全的胶囊类型（不包含 content，用于未解锁状态）
export interface SafeCapsule {
  id: string;
  type: 'capsule';
  title: string;
  unlockAt: Date;
  createdAt: Date;
  status: 'locked' | 'unlocked' | 'opened';
  openedAt?: Date;
  reply?: string;
}

/**
 * 检查胶囊是否已解锁（基于时间逻辑）
 */
export function isCapsuleUnlocked(capsule: Capsule | SafeCapsule): boolean {
  const now = new Date();
  return capsule.status === 'unlocked' || capsule.status === 'opened' ||
         (capsule.status === 'locked' && now >= capsule.unlockAt);
}

/**
 * 获取安全的胶囊对象（不包含 content，用于未解锁状态）
 */
export function getSafeCapsule(capsule: Capsule): SafeCapsule {
  const { content, ...safeCapsule } = capsule;
  return safeCapsule;
}

/**
 * 获取所有心事记录
 */
export function getHeartRecords(): HeartRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HEART_RECORDS);
    if (!data) return [];

    const records = JSON.parse(data);
    // 将日期字符串转换回 Date 对象
    return records.map((record: any) => ({
      ...record,
      createdAt: new Date(record.createdAt),
      ...(record.updatedAt && { updatedAt: new Date(record.updatedAt) }),
    }));
  } catch (error) {
    console.error('Failed to load heart records:', error);
    return [];
  }
}

/**
 * 保存所有心事记录
 */
export function saveHeartRecords(records: HeartRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HEART_RECORDS, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save heart records:', error);
  }
}

/**
 * 添加一条心事记录
 */
export function addHeartRecord(record: HeartRecord): void {
  const records = getHeartRecords();
  records.unshift(record); // 添加到开头
  saveHeartRecords(records);
}

/**
 * 删除一条心事记录
 */
export function deleteHeartRecord(id: string): void {
  const records = getHeartRecords();
  const filtered = records.filter((r) => r.id !== id);
  saveHeartRecords(filtered);
}

/**
 * 更新心事记录的低能量标记
 */
export function updateHeartRecordLowMoment(id: string, isLowMoment: boolean): void {
  const records = getHeartRecords();
  const updated = records.map((r) =>
    r.id === id ? { ...r, isLowMoment, updatedAt: new Date() } : r
  );
  saveHeartRecords(updated);
}

/**
 * 获取所有夸夸记录
 */
export function getPraiseRecords(): PraiseRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRAISE_RECORDS);
    if (!data) return [];

    const records = JSON.parse(data);
    // 将日期字符串转换回 Date 对象
    return records.map((record: any) => ({
      ...record,
      createdAt: new Date(record.createdAt),
    }));
  } catch (error) {
    console.error('Failed to load praise records:', error);
    return [];
  }
}

/**
 * 保存所有夸夸记录
 */
export function savePraiseRecords(records: PraiseRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRAISE_RECORDS, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save praise records:', error);
  }
}

/**
 * 添加一条夸夸记录
 */
export function addPraiseRecord(record: PraiseRecord): void {
  const records = getPraiseRecords();
  records.unshift(record); // 添加到开头
  savePraiseRecords(records);
}

/**
 * 删除一条夸夸记录
 */
export function deletePraiseRecord(id: string): void {
  const records = getPraiseRecords();
  const filtered = records.filter((r) => r.id !== id);
  savePraiseRecords(filtered);
}

/**
 * 更新夸夸记录的低能量标记
 */
export function updatePraiseRecordLowMoment(id: string, isLowMoment: boolean): void {
  const records = getPraiseRecords();
  const updated = records.map((r) =>
    r.id === id ? { ...r, isLowMoment } : r
  );
  savePraiseRecords(updated);
}

/**
 * 获取写心事筛选状态
 */
export function getHeartFilterState(): HeartFilterState {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HEART_FILTER);
    if (!data) {
      return {
        timeFilter: 'all',
        tagFilter: { type: null, value: '' },
      };
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load heart filter state:', error);
    return {
      timeFilter: 'all',
      tagFilter: { type: null, value: '' },
    };
  }
}

/**
 * 保存写心事筛选状态
 */
export function saveHeartFilterState(filterState: HeartFilterState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HEART_FILTER, JSON.stringify(filterState));
  } catch (error) {
    console.error('Failed to save heart filter state:', error);
  }
}

/**
 * 生成胶囊标题（自动生成）
 */
export function generateCapsuleTitle(date: Date): string {
  return `写于 ${date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })}`;
}

/**
 * 对胶囊进行排序
 * 排序规则：
 * 1. 已到期但未打开 → 最上
 * 2. 未到期 → 按解锁时间升序
 * 3. 已打开 → 最后
 */
export function sortCapsules(capsules: Capsule[]): Capsule[] {
  const now = new Date();

  return capsules.sort((a, b) => {
    // 获取状态
    const aIsUnlocked = a.status === 'unlocked' || (a.status === 'locked' && now >= a.unlockAt);
    const bIsUnlocked = b.status === 'unlocked' || (b.status === 'locked' && now >= b.unlockAt);

    // 1. 已到期但未打开的放最前
    if (aIsUnlocked && a.status !== 'opened' && (!bIsUnlocked || b.status === 'opened')) {
      return -1;
    }
    if (bIsUnlocked && b.status !== 'opened' && (!aIsUnlocked || a.status === 'opened')) {
      return 1;
    }

    // 2. 已打开的放最后
    if (a.status === 'opened' && b.status !== 'opened') {
      return 1;
    }
    if (b.status === 'opened' && a.status !== 'opened') {
      return -1;
    }

    // 3. 未到期的按解锁时间升序
    if (a.status === 'locked' && b.status === 'locked') {
      return a.unlockAt.getTime() - b.unlockAt.getTime();
    }

    // 4. 其他情况按创建时间倒序
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

/**
 * 检查是否有已到期但未打开的胶囊
 */
export function hasReadyCapsules(): boolean {
  const capsules = getCapsules();
  const now = new Date();
  return capsules.some(
    (capsule) => {
      if (capsule.status === 'opened') {
        return false;
      }
      return capsule.status === 'unlocked' || (capsule.status === 'locked' && now >= capsule.unlockAt);
    }
  );
}

/**
 * 获取所有时间胶囊
 */
export function getCapsules(): Capsule[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CAPSULES);
    if (!data) return [];

    const capsules = JSON.parse(data);
    // 将日期字符串转换回 Date 对象，并为没有标题的旧数据生成标题
    const processedCapsules = capsules.map((capsule: any) => ({
      ...capsule,
      unlockAt: new Date(capsule.unlockAt),
      createdAt: new Date(capsule.createdAt),
      ...(capsule.openedAt && { openedAt: new Date(capsule.openedAt) }),
      // 如果没有标题，自动生成
      title: capsule.title || generateCapsuleTitle(new Date(capsule.createdAt)),
    }));

    // 自动更新状态
    const now = new Date();
    const updatedCapsules = processedCapsules.map((capsule: Capsule) => {
      if (capsule.status === 'locked' && now >= capsule.unlockAt) {
        return { ...capsule, status: 'unlocked' as const };
      }
      return capsule;
    });

    return sortCapsules(updatedCapsules);
  } catch (error) {
    console.error('Failed to load capsules:', error);
    return [];
  }
}

/**
 * 保存所有时间胶囊
 */
export function saveCapsules(capsules: Capsule[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CAPSULES, JSON.stringify(capsules));
  } catch (error) {
    console.error('Failed to save capsules:', error);
  }
}

/**
 * 添加一个时间胶囊
 */
export function addCapsule(capsule: Capsule): void {
  const capsules = getCapsules();
  capsules.unshift(capsule); // 添加到开头
  saveCapsules(capsules);
}

/**
 * 删除一个时间胶囊
 */
export function deleteCapsule(id: string): void {
  const capsules = getCapsules();
  const filtered = capsules.filter((c) => c.id !== id);
  saveCapsules(filtered);
}

/**
 * 开启一个时间胶囊
 */
export function openCapsule(id: string): void {
  const capsules = getCapsules();
  const now = new Date();
  const updated = capsules.map((c) =>
    c.id === id ? { ...c, status: 'opened' as const, openedAt: now } : c
  );
  saveCapsules(updated);
}

/**
 * 更新胶囊的补充回复
 */
export function updateCapsuleReply(id: string, reply: string): void {
  const capsules = getCapsules();
  const updated = capsules.map((c) =>
    c.id === id ? { ...c, reply } : c
  );
  saveCapsules(updated);
}

// ========== 关系澄清卡 ==========

// 对话消息类型
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

// 关系澄清卡类型
export interface RelationshipClarityCard {
  id: string;
  type: 'relationship-clarity';
  relationType: string;    // 关系类型：伴侣/暧昧对象、朋友、家人、同事/上级、其他重要的人
  theme: string;           // 从困扰中归纳的主题：边界/委屈/内耗/误解/疲惫/期待 等
  direction: string;       // 从建议中归纳的方向：表达/休息/拉开距离/观察/澄清边界 等
  partnerMBTI?: string;    // 对方 MBTI（可选）
  chatThread: ChatMessage[]; // 对话线程
  threadSummary?: string;   // 对话摘要（每6轮对话更新一次）
  createdAt: Date;
}

/**
 * 获取所有关系澄清卡
 */
export function getRelationshipClarityCards(): RelationshipClarityCard[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RELATIONSHIP_CLARITY_CARDS);
    if (!data) return [];

    const cards = JSON.parse(data);
    // 将日期字符串转换回 Date 对象
    return cards.map((card: any) => ({
      ...card,
      createdAt: new Date(card.createdAt),
      chatThread: (card.chatThread || []).map((msg: any) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
      })),
    }));
  } catch (error) {
    console.error('Failed to load relationship clarity cards:', error);
    return [];
  }
}

/**
 * 保存所有关系澄清卡
 */
export function saveRelationshipClarityCards(cards: RelationshipClarityCard[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RELATIONSHIP_CLARITY_CARDS, JSON.stringify(cards));
  } catch (error) {
    console.error('Failed to save relationship clarity cards:', error);
  }
}

/**
 * 添加一条关系澄清卡
 */
export function addRelationshipClarityCard(card: RelationshipClarityCard): void {
  const cards = getRelationshipClarityCards();
  cards.unshift(card); // 添加到开头
  saveRelationshipClarityCards(cards);
}

/**
 * 删除一条关系澄清卡
 */
export function deleteRelationshipClarityCard(id: string): void {
  const cards = getRelationshipClarityCards();
  const filtered = cards.filter((c) => c.id !== id);
  saveRelationshipClarityCards(filtered);
}

/**
 * 添加聊天消息到指定卡片的对话线程
 */
export function addChatMessage(cardId: string, role: 'user' | 'assistant', content: string): void {
  const cards = getRelationshipClarityCards();
  const updatedCards = cards.map((card) => {
    if (card.id === cardId) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role,
        content,
        createdAt: new Date(),
      };
      return {
        ...card,
        chatThread: [...card.chatThread, newMessage],
      };
    }
    return card;
  });
  saveRelationshipClarityCards(updatedCards);
}

/**
 * 更新关系澄清卡的摘要
 */
export function updateCardSummary(cardId: string, summary: string): void {
  const cards = getRelationshipClarityCards();
  const updatedCards = cards.map((card) => {
    if (card.id === cardId) {
      return { ...card, threadSummary: summary };
    }
    return card;
  });
  saveRelationshipClarityCards(updatedCards);
}

/**
 * 生成助手回复（模板）
 * 助手回复必须包含4块：
 * 1. 镜像一句（复述用户重点）
 * 2. 可能性（2条）
 * 3. 下一步行动（2选1）
 * 4. 一个追问
 */
export function generateAssistantReply(userMessage: string, card?: RelationshipClarityCard): string {
  // 简化的模板生成逻辑
  const mirror = `看起来，${userMessage.substring(0, 50)}...`;
  
  const possibilities = `可能有两种情况：\n1. 对方也有类似的想法，但不知道如何表达\n2. 对方的节奏和你不同，需要更多时间来处理`;
  
  const actions = `你可以考虑：\n\n选择A：直接表达你的感受和需求\n选择B：先给自己一些空间，观察对方的行为`;
  
  const followUp = `你更倾向于哪个方向？或者有其他顾虑吗？`;
  
  return `${mirror}\n\n${possibilities}\n\n${actions}\n\n${followUp}`;
}

/**
 * 生成对话摘要（每6轮对话调用一次）
 */
export function generateThreadSummary(chatThread: ChatMessage[], card: RelationshipClarityCard): string {
  const userMessages = chatThread.filter(m => m.role === 'user');
  const assistantMessages = chatThread.filter(m => m.role === 'assistant');
  
  return `本次对话共 ${userMessages.length} 轮用户提问。核心议题围绕${card.theme}展开。你的需求是${card.direction}。通过对话，你探索了多种可能性，包括直接表达和先观察两种路径。建议继续在实践中尝试这些方案，并注意观察对方的反馈。`;
}
