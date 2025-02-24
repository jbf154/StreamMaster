import { getTopToolOptions } from '@lib/common/common';
import { ResetLogoIcon } from '@lib/common/icons';
import { Button } from 'primereact/button';
import { useClickOutside } from 'primereact/hooks';
import { InputText } from 'primereact/inputtext';
import { type TooltipOptions } from 'primereact/tooltip/tooltipoptions';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const StringEditorBodyTemplate = (props: StringEditorBodyTemplateProperties) => {
  const [originalValue, setOriginalValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const overlayReference = useRef<HTMLDivElement | null>(null);

  const [inputValue, setInputValue] = useState<string>('');

  const debounced = useDebouncedCallback(
    useCallback(
      (value: string) => {
        if (value !== originalValue && !props.isLoading) {
          setInputValue(value);
          props.onChange(value);
        }
      },
      [originalValue, props]
    ),
    props.debounceMs ? props.debounceMs : 1500,
    {}
  );

  const save = useCallback(
    (forceValueSave?: string | undefined) => {
      if (props.isLoading || (forceValueSave === undefined && (inputValue === undefined || inputValue === originalValue))) {
        return;
      }

      debounced.cancel();
      if (forceValueSave === undefined) {
        props.onChange(inputValue);
      } else {
        props.onChange(forceValueSave);
      }
    },
    [debounced, inputValue, originalValue, props]
  );

  // Keyboard Enter
  useEffect(() => {
    const callback = (event: KeyboardEvent) => {
      if (!isFocused) {
        return;
      }

      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        save();
      }
    };

    document.addEventListener('keydown', callback);

    return () => {
      document.removeEventListener('keydown', callback);
    };
  }, [isFocused, save]);

  useClickOutside(overlayReference, () => {
    if (!isFocused) {
      return;
    }

    setIsFocused(false);

    if (originalValue !== inputValue) {
      save();
    }
  });

  useEffect(() => {
    if (!props.isLoading && props.value !== null && props.value !== undefined) {
      setInputValue(props.value);
      setOriginalValue(props.value);
    }
  }, [props.value, props.isLoading, setInputValue]);

  return (
    <div className="relative h-full" ref={overlayReference}>
      {isFocused && props.resetValue !== undefined && props.resetValue !== inputValue && (
        <Button
          className="absolute right-0"
          disabled={props.isLoading}
          icon={<ResetLogoIcon sx={{ fontSize: 18 }} />}
          onClick={() => {
            setInputValue(props.resetValue === undefined ? '' : props.resetValue);
            save(props.resetValue);
          }}
          rounded
          severity="warning"
          size="small"
          text
          tooltip="Reset Name"
          tooltipOptions={getTopToolOptions}
        />
      )}
      {originalValue !== inputValue && <i className="absolute right-0 pt-1 pi pi-save pr-2 text-500" />}
      <InputText
        className="p-0 flex justify-content-start w-full h-full"
        onChange={(e) => {
          setInputValue(e.target.value as string);
          debounced(e.target.value as string);
        }}
        onClick={() => {
          props.onClick?.();
        }}
        onFocus={() => setIsFocused(true)}
        placeholder={props.placeholder}
        tooltip={props.tooltip}
        tooltipOptions={props.tooltipOptions}
        value={inputValue}
      />
    </div>
  );
};

StringEditorBodyTemplate.displayName = 'String Editor Body Template';

export interface StringEditorBodyTemplateProperties {
  readonly debounceMs?: number;
  readonly isLoading?: boolean;
  readonly onChange: (value: string) => void;
  readonly onClick?: () => void;
  readonly placeholder?: string;
  readonly resetValue?: string | undefined;
  readonly tooltip?: string | undefined;
  readonly tooltipOptions?: TooltipOptions | undefined;
  readonly value: string | undefined;
}

export default memo(StringEditorBodyTemplate);
