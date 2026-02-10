'use client';

import { useRouter } from 'next/navigation';
import { useRef, useEffect } from 'react';

/**
 * 统一的返回逻辑 Hook
 *
 * 规则：
 * 1. 默认使用 history.back() 返回上一页
 * 2. 当不存在历史返回路径时，fallback 到指定的模块首页
 * 3. 确保返回行为符合用户的访问路径
 *
 * @param fallbackPath - 当没有历史记录时的 fallback 路径（如 '/resonance'）
 * @returns handleBack - 返回处理函数
 */
export function useNavigationBack(fallbackPath: string = '/') {
  const router = useRouter();
  const hasMounted = useRef(false);

  // 标记组件是否已挂载
  useEffect(() => {
    hasMounted.current = true;
  }, []);

  /**
   * 返回处理函数
   *
   * 优先级：
   * 1. 如果页面已经通过用户交互加载过（有历史记录），使用 history.back()
   * 2. 否则，fallback 到指定的模块首页
   */
  const handleBack = () => {
    // 如果组件还没挂载，说明是首次访问，直接跳转
    if (!hasMounted.current) {
      router.push(fallbackPath);
      return;
    }

    // 使用浏览器的 history.back() 返回上一页
    // 如果用户没有历史记录，浏览器会停留在当前页面
    if (typeof window !== 'undefined') {
      window.history.back();
    } else {
      // 客户端不可用时，直接跳转 fallback 路径
      router.push(fallbackPath);
    }
  };

  return { handleBack };
}
