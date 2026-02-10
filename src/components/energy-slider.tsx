'use client';

import { useState, useCallback } from 'react';

interface EnergySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function EnergySlider({ value, onChange }: EnergySliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateValue(e);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) {
        updateValue(e);
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const updateValue = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    onChange(Math.round(percentage));
  };

  return (
    <div className="relative w-full h-12 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-2xl overflow-hidden cursor-pointer select-none group">
      {/* 背景水波纹效果 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-pulse" />
      </div>

      {/* 能量水位 */}
      <div
        className={`
          absolute left-0 top-0 bottom-0 rounded-2xl transition-all duration-300
          bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600
          ${isDragging ? 'shadow-lg shadow-blue-500/30' : ''}
        `}
        style={{
          width: `${value}%`,
          // 添加呼吸效果
          opacity: 0.8 + (value / 100) * 0.2,
        }}
      >
        {/* 水面光泽效果 */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
      </div>

      {/* 拖拽指示器 */}
      <div
        className={`
          absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full
          bg-white shadow-lg border-2 border-blue-500
          transition-all duration-300 z-10
          ${isDragging ? 'scale-125 shadow-xl shadow-blue-500/40' : 'scale-100'}
        `}
        style={{
          left: `calc(${value}% - 12px)`,
        }}
      >
        {/* 内部光晕 */}
        <div
          className={`
            absolute inset-1 rounded-full bg-blue-500/20
            animate-pulse
          `}
        />
      </div>

      {/* 拖拽交互层 */}
      <div
        className="absolute inset-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
