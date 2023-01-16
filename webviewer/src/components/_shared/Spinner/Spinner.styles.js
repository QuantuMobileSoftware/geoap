import styled, { css, keyframes } from 'styled-components';
import { ImSpinner9 } from 'react-icons/im';
import { rgba } from 'polished';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

export const StyledSpinnerWrapper = styled.div`
  ${({ theme }) => css`
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    background: ${rgba(theme.colors.black, 0.95)};
    z-index: ${theme.zIndexes[1]};
  `}
`;

export const SpinnerIcon = styled(ImSpinner9)`
  ${({ theme }) => css`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: ${theme.colors.nature.n0};
    animation: ${rotate} 1.5s linear infinite;
  `}
`;
