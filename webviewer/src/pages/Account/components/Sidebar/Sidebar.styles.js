import styled, { css } from 'styled-components';
import { em } from 'styles';
import { rgba } from 'polished';
import { BasicSidebar } from 'components/_shared/Sidebar';
import { StyledIcon } from 'components/_shared/Icon';
import { Breadcrumbs } from 'components/_shared/Breadcrumbs';

export const StyledBreadcrumbs = styled(Breadcrumbs)`
  padding: ${em(16)} 0;
  padding-left: ${em(25)};
`;

export const StyledSidebar = styled(BasicSidebar)`
  padding: 0;
`;

export const TabItem = styled.div`
  ${({ theme, isActive }) => css`
    display: flex;
    padding: ${em(20)} ${em(20)};
    background: ${isActive ? rgba(theme.colors.primary.p1, 0.1) : 'inherit'};
    font-size: ${em(20)};
    font-weight: ${theme.fontWeights[1]};
    cursor: pointer;
    ${StyledIcon} {
      margin-right: ${em(10)};
    }
  `}
`;
