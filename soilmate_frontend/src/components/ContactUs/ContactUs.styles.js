import styled from 'styled-components';

import { em } from 'styles';

import { FormField } from 'components/_shared/Form';
import { Button } from 'components/_shared/Button';

export const StyledFormField = styled(FormField)`
  margin-bottom: ${em(10)};
  width: 100%;
`;

export const StyledButton = styled(Button)`
  display: block;
  margin: auto;
  margin-top: ${em(24)};
  width: ${em(130)};
`;
