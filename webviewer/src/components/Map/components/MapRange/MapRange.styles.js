import styled, { css } from 'styled-components';
import { rem, em, mapControls } from 'styles';

export const StyledMapRange = styled.div`
  ${mapControls}
  bottom: ${rem(30)};
  width: ${rem(140)};
  padding: ${em(14)} ${em(10)} ${em(17)};
`;

export const RangeThumb = styled.div`
  width: ${rem(12)};
  height: ${rem(12)};
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary.p2};
  outline: none;
  cursor: pointer;
`;

export const RangeTrack = styled.div`
  ${({ theme, value }) => css`
    width: 100%;
    height: ${rem(5)};
    margin-top: ${rem(8)};
    border-radius: ${rem(4)};
    background: linear-gradient(
      90deg,
      ${theme.colors.primary.p2} 0%,
      ${theme.colors.primary.p2} ${value}%,
      ${theme.colors.nature.n2} ${value}%,
      ${theme.colors.nature.n2} 100%
    );
    outline: none;
  `}
`;
