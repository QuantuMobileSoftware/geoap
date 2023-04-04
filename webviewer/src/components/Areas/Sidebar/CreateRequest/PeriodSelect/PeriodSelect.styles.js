import styled from 'styled-components';
import { em } from 'styles';
import { DayPicker } from 'components/_shared/Calendar';
import { Select } from 'components/_shared/Select';

export const StyledSelect = styled(Select)`
  margin-bottom: ${em(20)};
`;

export const StyledDayPicker = styled(DayPicker)`
  margin-bottom: ${em(20)};
`;
