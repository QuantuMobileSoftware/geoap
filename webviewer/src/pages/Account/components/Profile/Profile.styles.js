import styled from 'styled-components';
import { rgba } from 'polished';
import { em } from 'styles';
import { Typography } from 'components/_shared/Typography';
import { Button } from 'components/_shared/Button';

export const InfoItem = styled.div`
  margin: ${em(16)} 0;
`;

export const InfoTitle = styled.span`
  color: ${({ theme }) => rgba(theme.colors.black, 0.7)};
  margin-right: ${em(10)};
`;

export const InfoValue = styled.span`
  ${({ theme, large }) => `
  color: ${theme.colors.nature.n5};
  font-size: ${large ? em(20) : em(16)};
  `}
`;

export const Title = styled(Typography).attrs({
  element: 'h2',
  variant: 'h3'
})`
  margin-top: ${em(60)};
  color: ${({ theme }) => theme.colors.nature.n4};
`;

export const StyledButton = styled(Button)`
  display: flex;
  margin: ${em(20)} 0;
  color: ${({ theme, variantType }) => variantType === 'danger' && theme.colors.danger};
`;

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-top: ${em(24)};
`;

export const UserMessage = styled.p`
  font-style: italic;
  margin-bottom: ${em(16)};
`;
