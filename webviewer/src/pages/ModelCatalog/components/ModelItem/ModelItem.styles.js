import styled, { css } from 'styled-components';
import { rem, em } from 'styles';
import { rgba } from 'polished';

export const modelSize = '260px';

export const Model = styled.div`
  ${({ theme, bg }) => css`
    width: ${modelSize};
    height: ${modelSize};
    border-radius: ${rem(theme.radius[2])};
    background: center / cover no-repeat url(${bg});
    box-shadow: ${theme.shadows()[0]};
    overflow: hidden;
    &:hover {
      ${ModelDescription} {
        bottom: 0;
      }
    }
  `}
`;

export const ModelDescription = styled.div`
  ${({ theme }) => css`
    padding: ${em(6)} ${em(14)};
    height: 100%;
    position: relative;
    bottom: -73%;
    background: ${rgba(theme.colors.nature.n0, 0.8)};
    backdrop-filter: blur(4px);
    transition: ${theme.transitions.medium};
  `}
`;

export const ModelTitle = styled.p`
  ${({ theme }) => css`
    text-align: center;
    font-size: ${em(20)};
    color: ${rgba(theme.colors.black, 0.7)};
  `}
`;

export const ModelTitleWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  margin-bottom: ${em(4)};
`;

export const ModelText = styled.p`
  font-size: ${em(13)};
  color: ${({ theme }) => theme.colors.black};
`;
