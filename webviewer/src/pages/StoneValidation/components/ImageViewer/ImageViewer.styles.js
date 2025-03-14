import { Paper } from 'components/_shared/Paper';
import styled, { css } from 'styled-components';
import { em, rem } from 'styles';
import { Button } from 'components/_shared/Button';
import { shouldForwardProp } from 'utils';

const containerMargin = 10;

export const Container = styled(Paper)`
  margin: ${containerMargin}px auto;
  overflow-y: auto;
  max-height: calc(100% - ${containerMargin * 2}px);
  width: 70%;
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
  width: 120px;
  text-overflow: ellipsis;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.nature.n3};
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
