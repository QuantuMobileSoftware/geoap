import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { isUndefined } from 'lodash-es';

import {
  SidebarBody,
  SidebarButtonClose,
  SidebarHeading,
  StyledSidebar
} from './Sidebar.styles';

export const Sidebar = forwardRef(
  (
    { children, heading, isOpen = false, withCloseButton = true, onClose, ...props },
    ref
  ) => {
    const rootRef = useRef(null);

    const [_isOpen, setIsOpen] = useState(isOpen);
    useEffect(() => isOpen && setIsOpen(isOpen), [isOpen]);

    const handleClose = () => {
      setIsOpen(false);
      onClose?.();
    };

    const toggle = isOpen => {
      const shouldClose = (!isUndefined(isOpen) && !isOpen) || _isOpen;
      shouldClose ? handleClose() : setIsOpen(true);
    };

    useImperativeHandle(ref, () => ({ element: rootRef.current, toggle }));

    if (!_isOpen) return null;

    return (
      <StyledSidebar {...props} ref={rootRef}>
        {withCloseButton && <SidebarButtonClose onClick={handleClose} />}
        {heading && <SidebarHeading>{heading}</SidebarHeading>}
        {children && <SidebarBody>{children}</SidebarBody>}
      </StyledSidebar>
    );
  }
);
