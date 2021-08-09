import styled, { css } from 'styled-components';
import { em, rem } from 'styles';
import { Typography } from 'components/_shared/Typography';
import { Button } from 'components/_shared/Button';
import { Icon } from 'components/_shared/Icon';

export const FieldsSidebarButton = styled(Button)`
  ${({ theme }) => css`
    margin: ${rem(theme.spacing[6])} 0 ${rem(theme.spacing[6])} auto;
  `}
`;

export const SidebarMessage = styled(Typography).attrs({
  element: 'p',
  variant: 'body2'
})`
  ${({ theme }) => css`
    text-align: center;
    padding: ${em([theme.spacing[11], theme.spacing[11], theme.spacing[8]])};
  `}
`;

export const StyledIcon = styled(Icon)`
  display: inline-flex;
  transform: rotate(${props => (props.up ? `0` : `180deg`)});
`;

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${em(16)};
`;
