"use client";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import React from "react";

type Items = {
  label: string;
  value: string;
};

type ComboboxPopupProps = {
  items: Items[];
  value?: string;
  defaultValue?: Items;
  onValueChange?: (value: Items | null) => void;
  placeholder?: string;
  isLoading?: boolean;
  emptyMessage?: string;
};
export function ComboboxPopup({
  items,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Search",
  isLoading = false,
  emptyMessage = "No items found.",
}: ComboboxPopupProps) {
  const [localValue, setLocalValue] = React.useState<Items | undefined>(
    defaultValue,
  );
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : localValue?.value;

  const handleValueChange = (item: Items | null) => {
    if (!isControlled) {
      setLocalValue(item || undefined);
    }
    onValueChange?.(item);
  };

  const selectedItem = React.useMemo(
    () => items.find((item) => item.value === currentValue),
    [items, currentValue],
  );

  return (
    <Combobox
      items={items}
      defaultValue={selectedItem}
      onValueChange={handleValueChange}
      disabled={isLoading}
    >
      <ComboboxTrigger
        render={
          <Button
            variant="outline"
            className="w-full justify-between font-normal bg-white"
            disabled={isLoading}
          >
            {selectedItem ? selectedItem.label : placeholder}
          </Button>
        }
      />
      <ComboboxContent>
        <ComboboxInput
          showTrigger={false}
          placeholder={placeholder}
          disabled={isLoading}
        />
        {isLoading ? (
          <div className="p-3 text-center text-sm text-gray-500">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        ) : (
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        )}
      </ComboboxContent>
    </Combobox>
  );
}
