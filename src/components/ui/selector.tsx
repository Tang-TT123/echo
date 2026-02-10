"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectorProps {
  label: string;
  placeholder: string;
  value?: string;
  onClick: () => void;
  required?: boolean;
  disabled?: boolean;
  children?: React.ReactNode; // 用于自定义显示选中值
}

export function Selector({
  label,
  placeholder,
  value,
  onClick,
  required = false,
  disabled = false,
  children,
}: SelectorProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center justify-between p-4 bg-background",
        "border border-[#e5e5e5] dark:border-[#38383a]",
        "rounded-lg hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e]",
        "transition-colors duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <span className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
          {label}
        </span>
        {required && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] flex-shrink-0" />
        )}
      </div>

      <div className="flex items-center gap-2 flex-1 justify-end">
        {children || (
          <span
            className={cn(
              "text-sm",
              value
                ? "text-[#1d1d1f] dark:text-[#f5f5f7]"
                : "text-[#86868b]"
            )}
          >
            {value || placeholder}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-[#86868b] flex-shrink-0" />
      </div>
    </button>
  );
}
