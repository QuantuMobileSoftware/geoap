import styled, { css } from 'styled-components';
import { em } from 'styles';
import { Button } from 'components/_shared/Button';

export const StyledWindow = styled.div`
  ${({ theme }) => css`
    position: fixed;
    left: 50%;
    top: 50%;
    z-index: ${theme.zIndexes[2]};
    padding: ${em(20)};
    transform: translate(-50%, -50%);
    background: ${theme.colors.misc.background};
    box-shadow: ${theme.shadows()[0]};
    color: ${theme.colors.black};
    font-size: ${em(14)};
    max-height: 80vh;
    overflow-y: auto;
  `}
`;

export const Services = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin: ${em(30)} 0;
  ${({ theme }) =>
    theme.breakpoints.sx(css`
      flex-direction: column;
    `)};
`;

export const ServiceItem = styled.div`
  margin: ${em(5)} ${em(20)};
  width: 230px;
`;

export const Header = styled.h1`
  font-size: ${em(24)};
  text-align: center;
`;

export const Title = styled.p`
  font-size: ${em(20)};
  text-align: center;
`;

export const StyledButton = styled(Button)`
  display: block;
  min-width: 110px;
  margin: auto;
  margin-top: ${em(30)};
`;

export const CheckboxWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${em(10)};
`;
