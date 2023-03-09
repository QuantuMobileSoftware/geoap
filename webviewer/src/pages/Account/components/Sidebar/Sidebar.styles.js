import styled, { css } from 'styled-components';
import { em } from 'styles';
import { BasicSidebar } from 'components/_shared/Sidebar';
import { StyledBreadCrumbs } from 'components/_shared/Sidebar/BreadCrumbs';
import { StyledIcon } from 'components/_shared/Icon';

export const BreadCrumbs = styled(StyledBreadCrumbs)`
  padding: ${em(20)};
`;

export const BreadCrumbsItem = styled.span`
  cursor: pointer;
`;

export const StyledSidebar = styled(BasicSidebar)`
  padding-left: 0;
  padding-right: 0;
`;

export const TabItem = styled.div`
  ${({ theme, isActive }) => css`
    display: flex;
    padding: ${em(20)} ${em(20)};
    background: ${isActive ? theme.colors.primary.p4 : 'inherit'};
    font-size: ${em(20)};
    font-weight: ${theme.fontWeights[1]};
    cursor: pointer;
    ${StyledIcon} {
      margin-right: ${em(10)};
    }
  `}
`;
