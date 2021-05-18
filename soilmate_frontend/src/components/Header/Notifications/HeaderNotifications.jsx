import React from 'react';

import { StyledHeaderNotifications } from './HeaderNotifications.styles';

import { Icon } from 'components/_shared/Icon';

export const HeaderNotifications = ({ ...props }) => {
  return (
    <StyledHeaderNotifications {...props}>
      <Icon>Notifications</Icon>
    </StyledHeaderNotifications>
  );
};
