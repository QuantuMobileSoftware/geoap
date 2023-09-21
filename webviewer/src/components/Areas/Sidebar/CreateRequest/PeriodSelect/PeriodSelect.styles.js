import styled from 'styled-components';
import { em } from 'styles';
import { DayPicker } from 'components/_shared/Calendar';
import { Select, SelectDropdown } from 'components/_shared/Select';

export const StyledSelect = styled(Select)`
  margin-bottom: ${em(20)};

  ${SelectDropdown} {
    max-height: calc(100vh - 400px - 16rem);
  }
`;

export const StyledDayPicker = styled(DayPicker)`
  margin-bottom: ${em(20)};
  background-color: red;
`;
