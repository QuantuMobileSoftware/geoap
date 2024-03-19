import styled, { css } from 'styled-components';
import { em } from 'styles';

import { Button } from 'components/_shared/Button';

export const StyledFileLoader = styled.div`
  ${({ theme, top }) => css`
    position: fixed;
    top: ${em(top ? 80 : 290)};
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
