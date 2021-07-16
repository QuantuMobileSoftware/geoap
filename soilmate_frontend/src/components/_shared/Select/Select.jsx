import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { isArray } from 'lodash-es';
import { mergeObjects } from 'utils';

import {
  SelectDropdown,
  SelectToggle,
  StyledSelect,
  Option,
  StyledIcon,
  Label
} from './Select.styles';

export const Select = forwardRef(
  ({ isOpen = false, onClose, onSelect, items, value, label }, ref) => {
    const selectToggleRef = useRef(null);
    const [_isOpen, setIsOpen] = useState();
    const [selectValue, setSelectValue] = useState();
    useEffect(() => setIsOpen(isOpen), [isOpen]);
    useEffect(() => setSelectValue(value ?? items[0]?.value), [value, items]);

    const _clickOutsideParams = mergeObjects(
      { ignoredRefs: [selectToggleRef] },
      (value, sourceValue) => {
        if (isArray(value)) return [...value, ...sourceValue];
      }
    );

    const handleClose = () => {
      setIsOpen(false);
      onClose?.();
    };

    const handleItemClick = value => {
      setSelectValue(value);
      onSelect?.(value);
    };

    const toggle = () => (_isOpen ? handleClose() : setIsOpen(true));

    return (
      <StyledSelect ref={ref}>
        {label && <Label>{label}</Label>}
        <SelectToggle ref={selectToggleRef} onClick={toggle}>
          {selectValue}
          <StyledIcon open={_isOpen}>ExpandDown</StyledIcon>
          <SelectDropdown
            isOpen={_isOpen}
            clickOutsideParams={_clickOutsideParams}
            onClose={handleClose}
          >
            {items?.map((item, i) => (
              <Option key={i} onClick={() => handleItemClick(item.value)}>
                {item.name}
              </Option>
            ))}
          </SelectDropdown>
        </SelectToggle>
      </StyledSelect>
    );
  }
);
