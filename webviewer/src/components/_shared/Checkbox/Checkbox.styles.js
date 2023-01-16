import styled, { css } from 'styled-components';
import { rem } from 'styles';
import { Icon } from '../Icon';

const size = 16;

export const StyledCheckbox = styled.div`
  ${({ theme: { borders, colors, fontSizes } }) => css`
    position: relative;
    width: ${rem(size)};
    height: ${rem(size)};
    min-width: ${rem(size)};
    border: ${borders.default({ fontSize: fontSizes[1], color: colors.nature.n3 })};
    border-radius: ${rem(2)};
    &:hover {
      border: ${borders.default({ fontSize: fontSizes[1], color: colors.nature.n4 })};
    }
  `}
`;

export const StyledIcon = styled(Icon)`
  position: absolute;
  left: 50%;
  top: 49%;
  transform: translate(-50%, -50%);
  width: ${rem(9)};
`;
