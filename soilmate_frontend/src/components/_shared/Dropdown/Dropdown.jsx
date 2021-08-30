import React, {
  Children,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';

import { DropdownChild, StyledDropdown } from './Dropdown.styles';

import { UseClickOutsideConditional } from 'hooks';
import { mergeProps } from 'utils';

export const Dropdown = forwardRef(
  (
    {
      children,
      isOpen = false,
      closeOnChildClick = true,
      closeOnClickOutside = true,
      padding = 1,
      clickOutsideParams,
      onClose,
      onChildClick,
      onClickOutside,
      ...props
    },
    ref
  ) => {
    const rootRef = useRef(null);

    const [_isOpen, setIsOpen] = useState(isOpen);
    useEffect(() => setIsOpen(isOpen), [isOpen]);

    const handleClose = () => {
      setIsOpen(false);
      onClose?.();
    };

    const handleChildClick = event => {
      event.stopPropagation();
      closeOnChildClick && handleClose();
      onChildClick?.(event);
    };

    const handleClickOutside = () => {
      closeOnClickOutside && handleClose();
      onClickOutside?.();
    };

    useImperativeHandle(ref, () => ({ element: rootRef.current }));

    if (!_isOpen) return null;

    const renderChildren = Children.map(children, (child, i) => {
      if (!child) return null;

      const mergedProps = mergeProps(child.props, { onClick: handleChildClick });

      return (
        <DropdownChild key={i} {...mergedProps}>
          {child}
        </DropdownChild>
      );
    });

    return (
      <>
        {_isOpen && (
          <UseClickOutsideConditional
            elementRef={rootRef}
            callback={handleClickOutside}
            params={clickOutsideParams}
          />
        )}

        <StyledDropdown {...props} ref={rootRef} padding={padding}>
          {renderChildren}
        </StyledDropdown>
      </>
    );
  }
);
