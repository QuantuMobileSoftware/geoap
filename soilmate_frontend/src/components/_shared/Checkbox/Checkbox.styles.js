import styled, { css } from 'styled-components';
import { rem } from 'styles';
import { Icon } from '../Icon';

export const StyledCheckbox = styled.div`
  ${({ theme }) => css`
    position: relative;
    width: ${rem(16)};
    height: ${rem(16)};
    border: ${theme.borders.default({ fontSize: theme.fontSizes[1] })};
    border-radius: ${rem(2)};
  `}
`;

export const StyledIcon = styled(Icon)`
  position: absolute;
  left: 50%;
  top: 49%;
  transform: translate(-50%, -50%);
  width: ${rem(9)};
`;
