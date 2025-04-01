import { Select } from 'components/_shared/Select';
import { shouldForwardProp } from 'utils';
import styled, { css } from 'styled-components';
import { em } from 'styles';

export const HeaderContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    background: ${theme.colors.primary.p1};
    color: ${theme.colors.nature.n0};
    padding: 8px 12px;
  `}
`;

export const StyledSelect = styled(Select)`
  ${({ theme }) => css`
    min-width: ${em(180)};
    & div {
      background: ${theme.colors.nature.n0};
    }
  `}
`;

export const MiddleContainer = styled.div`
  width: 50%;
  font-size: ${em(12)};
`;

export const ProgressWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Breadcrumbs = styled.div`
  margin-top: ${em(6)};
  span:first-child {
    font-weight: bold;
  }
  & > span:not(:last-child) {
    cursor: pointer;
    &:hover {
      color: ${({ theme }) => theme.colors.nature.n2};
    }
  }
`;

export const Progress = styled.div.withConfig({ shouldForwardProp })`
  ${({ theme, size }) => css`
    background: ${theme.colors.nature.n0};
    padding: 1px;
    border-radius: ${em(5)};
    & > div {
      height: 6px;
      width: ${size}%;
      background: ${theme.colors.primary.p2};
      border-radius: ${em(5)};
    }
  `}
`;
