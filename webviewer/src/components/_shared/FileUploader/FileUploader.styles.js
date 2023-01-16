import styled, { css } from 'styled-components';
import { rem, em } from 'styles';

export const StyledUploader = styled.div`
  width: ${rem(250)};
  & > input {
    display: none;
  }
`;

export const ProgressBar = styled.div`
  ${({ theme, percent }) => css`
    height: ${rem(4)};
    width: 100%;
    margin-top: ${em(12)};
    background: ${theme.colors.nature.n2};
    border-radius: ${rem(theme.radius[3])};
    overflow: hidden;
    &:after {
      content: '';
      display: block;
      width: ${percent}%;
      height: 100%;
      background: ${theme.colors.primary.p2};
    }
  `}
`;

export const FileInfo = styled.div`
  ${({ theme, error }) => css`
    display: flex;
    justify-content: space-between;
    font-size: ${rem(theme.fontSizes[2])};
    color: ${error ? theme.colors.danger : theme.colors.nature.n5};
  `}
`;
