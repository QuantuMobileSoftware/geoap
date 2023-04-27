import styled, { css } from 'styled-components';
import { em } from 'styles';
import { modelSize } from './components/ModelItem';
import { Select } from 'components/_shared/Select';

export const ModelWrapper = styled.div`
  ${({ alignLeft }) => css`
    display: grid;
    grid-template-columns: repeat(
      auto-fit,
      minmax(${modelSize}, ${alignLeft ? modelSize : '1fr'})
    );
    grid-template-rows: auto;
    justify-items: center;
    gap: ${em(25)} ${em(30)};
    margin-top: ${em(22)};
  `}
`;

export const Container = styled.main`
  max-width: 1280px;
  margin: auto;
  padding: ${em(20)} ${em(60)};
`;

export const StyledSelect = styled(Select)`
  width: 160px;
  margin-top: ${em(10)};
`;
