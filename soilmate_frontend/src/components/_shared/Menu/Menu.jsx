import React, {
  Children,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { isArray } from 'lodash-es';

import {
  MenuDropdown,
  MenuList,
  MenuListItem,
  MenuToggle,
  StyledMenu
} from './Menu.styles';

import { getStyledComponentClassName, mergeObjects } from 'utils';

export const Menu = forwardRef(
  (
    {
      isOpen = false,
      children,
      toggleIcon = 'More',
      onClose,
      onItemClick,
      onClickOutside,
      clickOutsideParams,
      ...props
    },
    ref
  ) => {
    const rootRef = useRef(null);

    const [_isOpen, setIsOpen] = useState(isOpen);
    useEffect(() => setIsOpen(isOpen), [isOpen]);

    const _clickOutsideParams = mergeObjects(
      clickOutsideParams,
      { ignoredClassNames: [getStyledComponentClassName(MenuToggle)] },
      (value, sourceValue) => {
        if (isArray(value)) return [...value, ...sourceValue];
      }
    );

    const handleClose = () => {
      setIsOpen(false);
      onClose?.();
    };

    const toggle = () => (_isOpen ? handleClose() : setIsOpen(true));

    const handleMenuToggleClick = event => {
      event.stopPropagation();
      toggle();
    };

    const renderDropdownChildren = () => {
      if (!children) return null;

      const renderChild = (child, i) => {
        if (!child) return null;
        return <MenuListItem key={child.props.key || i}>{child}</MenuListItem>;
      };

      return <MenuList>{Children.map(children, renderChild)}</MenuList>;
    };

    useImperativeHandle(ref, () => ({ element: rootRef.current, toggle }));

    return (
      <StyledMenu {...props} ref={rootRef}>
        <MenuToggle icon={toggleIcon} onClick={handleMenuToggleClick} />

        <MenuDropdown
          isOpen={_isOpen}
          onChildClick={onItemClick}
          onClickOutside={onClickOutside}
          onClose={handleClose}
          clickOutsideParams={_clickOutsideParams}
        >
          {renderDropdownChildren()}
        </MenuDropdown>
      </StyledMenu>
    );
  }
);
