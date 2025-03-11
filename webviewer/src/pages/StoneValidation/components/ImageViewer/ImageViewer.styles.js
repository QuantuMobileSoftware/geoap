import { Paper } from 'components/_shared/Paper';
import styled, { css } from 'styled-components';
import { em } from 'styles';
import { Button } from 'components/_shared/Button';

export const Container = styled(Paper)`
  margin: 10px auto;
  overflow-y: auto;
  max-height: 100%;
  width: 75%;
`;

export const ButtonsWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: ${em(10)} 0;
  gap: 20px;
`;

export const DangerButton = styled(Button)`
  ${({ theme }) => css`
    background: ${theme.colors.danger};
    color: ${theme.colors.nature.n0};
  `};
`;
