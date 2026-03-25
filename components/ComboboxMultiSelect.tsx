"use client";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";
import { ComboboxRoot } from "@base-ui/react";

interface ComboboxItem {
  label: string;
  value: string;
}

type ComboboxMultipleProps = ComboboxRoot.Props<string, true> & {
  items?: ComboboxItem[];
  onSelect?: (selectedValues: string[]) => void;
};

export function ComboboxMultiple({
  items = [],
  onSelect,
  value,
  ...props
}: ComboboxMultipleProps) {
  const handleValueChange = (newValues: string[]) => {
    onSelect?.(newValues);
  };

  return (
    <Combobox
      items={items}
      multiple
      onValueChange={handleValueChange}
      value={value}
      {...props}
    >
      <ComboboxChips>
        <ComboboxValue>
          {value?.map((itemValue) => {
            const item = items.find((i) => i.value === itemValue);
            return (
              <ComboboxChip key={itemValue}>
                {item?.label || itemValue}
              </ComboboxChip>
            );
          })}
        </ComboboxValue>
        <ComboboxChipsInput placeholder="Search employees..." />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: ComboboxItem) => (
            <ComboboxItem key={item.value} value={item.value}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
