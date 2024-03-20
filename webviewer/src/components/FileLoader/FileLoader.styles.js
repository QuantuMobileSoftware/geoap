import styled, { css } from 'styled-components';
import { em } from 'styles';

import { Button } from 'components/_shared/Button';

export const StyledFileLoader = styled.div`
  ${({ theme, top }) => css`
    position: fixed;
    top: ${em(top ? 80 : 360)};
    right: ${em(20)};
    width: ${em(170)};
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: ${theme.zIndexes[1]};
    font-size: ${em(14)};
  `}
`;

export const FileLoaderContent = styled.div`
  ${({ theme }) => css`
    width: 100%;
    margin-top: ${em(8)};
    padding: ${em(10)};
    background: ${theme.colors.nature.n0};
    border-radius: 5px;
    max-height: ${em(300)};
    overflow-y: auto;
  `}
`;

export const Title = styled.div`
  ${({ theme }) => css`
    color: ${theme.colors.nature.n5};
    font-weight: ${theme.fontWeights[1]};
  `}
`;

export const FormatList = styled.div`
  ${({ theme }) => css`
    color: ${theme.colors.nature.n4};
    font-size: ${em(13)};
  `}
`;

export const DownloadButton = styled(Button)`
  margin-top: ${em(10)};
  padding: 0;
  text-decoration: underline;
`;

export const ProgressName = styled.div`
  ${({ theme }) => css`
    margin-top: ${em(10)};
    font-size: ${em(10)};
    font-weight: ${theme.fontWeights[1]};
  `}
`;

export const ProgressFileInfo = styled.div`
  margin: ${em(5)} 0;
  font-size: ${em(12)};
`;

export const ProgressBar = styled.div`
  ${({ theme, percents }) => css`
    background: ${theme.colors.primary.p4};
    height: 4px;
    width: 100%;
    border-radius: 5px;
    overflow: hidden;
    &::after {
      content: '';
      display: block;
      height: 100%;
      width: ${percents}%;
      background: ${theme.colors.primary.p3};
    }
  `}
`;
