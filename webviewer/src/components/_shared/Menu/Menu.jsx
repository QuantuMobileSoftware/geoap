import React, {
  Children,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import cn from 'classnames';
import { isArray } from 'lodash-es';

import {
  MenuDropdown,
  MenuList,
  MenuListItem,
  MenuToggle,
  StyledMenu
} from './Menu.styles';

import { mergeObjects } from 'utils';

export const Menu = forwardRef(
  (
    {
      className,
      isOpen = false,
      children,
      toggleIcon = 'More',
      onClose,
      onItemClick,
      onClick,
      onClickOutside,
      clickOutsideParams,
      ...props
    },
    ref
  ) => {
    const rootRef = useRef(null);
    const menuToggleRef = useRef(null);

    const [_isOpen, setIsOpen] = useState(isOpen);
    useEffect(() => setIsOpen(isOpen), [isOpen]);

    const _className = cn(className, { isOpen: _isOpen });

    const _clickOutsideParams = mergeObjects(
      clickOutsideParams,
      { ignoredRefs: [menuToggleRef] },
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
      onClick?.();
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
      <StyledMenu {...props} ref={rootRef} className={_className}>
        <MenuToggle
          ref={menuToggleRef}
          icon={toggleIcon}
          onClick={handleMenuToggleClick}
        />

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
