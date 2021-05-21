import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import cn from 'classnames';
import { isUndefined } from 'lodash-es';

import {
  SidebarBody,
  SidebarButtonClose,
  SidebarHeading,
  StyledSidebar
} from './Sidebar.styles';

export const Sidebar = forwardRef(
  (
    {
      className,
      children,
      heading,
      isOpen = false,
      withUnmountToggle = true,
      withCloseButton = true,
      onClose,
      ...props
    },
    ref
  ) => {
    const rootRef = useRef(null);

    const [_isOpen, setIsOpen] = useState(isOpen);
    useEffect(() => isOpen && setIsOpen(isOpen), [isOpen]);

    const _className = cn(className, { isOpen: _isOpen });

    const handleClose = () => {
      setIsOpen(false);
      onClose?.();
    };

    const toggle = isOpen => {
      const shouldClose = (!isUndefined(isOpen) && !isOpen) || _isOpen;
      shouldClose ? handleClose() : setIsOpen(true);
    };

    useImperativeHandle(ref, () => ({ element: rootRef.current, toggle }));

    if (!_isOpen && withUnmountToggle) return null;

    return (
      <StyledSidebar
        {...props}
        ref={rootRef}
        className={_className}
        withUnmountToggle={withUnmountToggle}
      >
        {withCloseButton && <SidebarButtonClose onClick={handleClose} />}
        {heading && <SidebarHeading>{heading}</SidebarHeading>}
        {children && <SidebarBody>{children}</SidebarBody>}
      </StyledSidebar>
    );
  }
);
