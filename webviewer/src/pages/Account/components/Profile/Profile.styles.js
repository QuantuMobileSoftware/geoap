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
  element: 'h3',
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
