import styled from 'styled-components';
import { em, rem } from 'styles';
import { InputText } from 'components/_shared/Input';

export const InputWrapper = styled.div`
  display: ${({ isHidden }) => (isHidden ? 'none' : 'block')};
  margin-top: ${em(20)};
`;

export const StyledInput = styled(InputText)`
  font-size: ${rem(16)};
  padding: ${rem(9)} ${rem(10)} ${rem(7)};
`;
