import { Paper } from 'components/_shared/Paper';
import styled, { css } from 'styled-components';
import { em, rem } from 'styles';
import { Button } from 'components/_shared/Button';
import { shouldForwardProp } from 'utils';
import { rgba } from 'polished';

const containerMargin = 10;

export const Container = styled(Paper)`
  margin: ${containerMargin}px auto;
  overflow-y: auto;
  max-height: calc(100% - ${containerMargin * 2}px);
  width: 70%;
  position: relative;
  buttons {
    outline: none;
  }
`;

export const CopyWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

export const ImgPath = styled.span`
  display: inline-block;
  width: 200px;
  text-overflow: ellipsis;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.nature.n3};
`;

export const ImageLoader = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    width: 100%;
    height: 100%;
    background: ${rgba(theme.colors.nature.n1, 0.8)};
    text-align: center;
    color: ${theme.colors.primary.p1};
    span {
      margin: auto;
    }
  `}
`;

export const BottomContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${rem(14)};
`;

export const ButtonsWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: ${em(10)};
  gap: 20px;
`;

export const StyledButton = styled(Button)`
  ${({ theme }) => css`
    & span::first-letter {
      text-shadow: 0 1px 1px ${theme.colors.black};
      color: gold;
      font-size ${em(20)};
    }
  `};
`;

export const DangerButton = styled(StyledButton)`
  ${({ theme }) => css`
    &:not(:disabled) {
      background: ${theme.colors.danger};
      color: ${theme.colors.nature.n0};
    }
  `};
`;

export const StatusText = styled(Paper).withConfig({ shouldForwardProp })`
  ${({ theme, verified }) => css`
    color: ${verified ? theme.colors.primary.p2 : theme.colors.danger};
    padding: ${em(10)};
    &:first-letter {
      text-transform: uppercase;
    }
  `};
`;
