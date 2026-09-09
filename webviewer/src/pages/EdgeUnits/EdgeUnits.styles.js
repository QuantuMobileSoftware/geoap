import styled, { css } from 'styled-components';
import { em, rem } from 'styles';

const placeholderRegion = css`
  ${({ theme }) => css`
    border: ${em(1)} dashed ${theme.colors.nature.n2};
    border-radius: ${theme.radius[0]}px;
    color: ${theme.colors.nature.n3};
    font-size: ${rem(12)};
    padding: ${em(12)};
  `}
`;

export const ClockRow = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: ${em(8)} ${em(20)} 0;
`;

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${em(16)};
  padding: ${em(20)};
`;

export const StatusLine = styled.div`
  ${placeholderRegion}
`;

export const ChipsRow = styled.nav`
  ${placeholderRegion}
  display: flex;
  gap: ${em(8)};
`;

export const DayBar = styled.div`
  ${placeholderRegion}
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const UnitCardsStrip = styled.div`
  ${placeholderRegion}
  display: flex;
  gap: ${em(12)};
  overflow-x: auto;
`;

export const MapArea = styled.div`
  ${placeholderRegion}
  min-height: ${em(360)};
`;

export const TimelineStrip = styled.section`
  ${placeholderRegion}
  min-height: ${em(140)};
`;

export const DetailPanel = styled.section`
  ${placeholderRegion}
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${em(16)};

  ${({ theme }) =>
    theme.breakpoints.sx(css`
      grid-template-columns: 1fr;
    `)}
`;

export const CardsSkeletonRow = styled.div`
  display: flex;
  gap: ${em(12)};
  width: 100%;
`;

export const RetryRow = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${em(12)};
    color: ${theme.colors.danger};
    font-size: ${rem(12)};
  `}
`;
