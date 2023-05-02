import styled, { css } from 'styled-components';
import { em } from 'styles';

const listGap = 20;

export const AnalyticsWrap = styled.div`
  padding: ${em(20)};
  background: #f6f4f0;
`;

export const Header = styled.h2`
  font-size: ${em(24)};
  text-align: center;
`;

export const Title = styled.p`
  text-align: center;
  font-size: ${em(20)};
  margin-bottom: ${em(20)};
`;

export const AnalyticsInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  gap: ${em(listGap)};
  ${({ theme }) =>
    theme.breakpoints.sx(css`
      flex-direction: column;
    `)};
`;

export const AnalyticsInfoTitle = styled.div`
  font-size: ${em(18)};
  margin-bottom: ${em(10)};
`;

export const ListWrap = styled.div`
  width: calc(100% / 3 - ${listGap}px);
  ${({ theme }) =>
    theme.breakpoints.sx(css`
      width: 100%;
    `)};
`;

export const ListItem = styled.li`
  list-style: disc;
  list-style-position: inside;
`;
