"use client";

import * as React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface SelectorOption {
  value: string;
  label: string;
}

export interface SelectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  options: SelectorOption[];
  mode: "single" | "multiple";
  value?: string;
  values?: string[];
  onConfirm: (value: string | string[]) => void;
}

export function SelectorSheet({
  open,
  onOpenChange,
  title,
  options,
  mode,
  value,
  values,
  onConfirm,
}: SelectorSheetProps) {
  const [tempValue, setTempValue] = React.useState<string>(value || "");
  const [tempValues, setTempValues] = React.useState<string[]>(values || []);

  // 重置临时值当打开时
  React.useEffect(() => {
    if (open) {
      setTempValue(value || "");
      setTempValues(values || []);
    }
  }, [open, value, values]);

  const handleToggleValue = (val: string) => {
    setTempValues((prev) =>
      prev.includes(val)
        ? prev.filter((v) => v !== val)
        : [...prev, val]
    );
  };

  const handleConfirm = () => {
    if (mode === "single") {
      onConfirm(tempValue);
    } else {
      onConfirm(tempValues);
    }
    onOpenChange(false);
  };

  const canConfirm = mode === "single"
    ? !!tempValue
    : tempValues.length > 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[70vh]">
        <DrawerHeader>
          <DrawerTitle className="text-center">{title}</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto max-h-[calc(70vh-140px)]">
          {mode === "single" ? (
            <RadioGroup value={tempValue} onValueChange={setTempValue}>
              {options.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 py-3 border-b border-[#e5e5e5] dark:border-[#38383a] last:border-0"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer text-base text-[#1d1d1f] dark:text-[#f5f5f7]"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-0">
              {options.map((option) => (
                <div
                  key={option.value}
                  className="flex items-start space-x-3 py-3 border-b border-[#e5e5e5] dark:border-[#38383a] last:border-0"
                >
                  <Checkbox
                    id={option.value}
                    checked={tempValues.includes(option.value)}
                    onCheckedChange={() => handleToggleValue(option.value)}
                  />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer text-base text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#e5e5e5] dark:border-[#38383a]">
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 py-6 text-base"
          >
            确定
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
