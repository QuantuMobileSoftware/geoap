import styled, { css } from 'styled-components';

import { em, rem } from 'styles';

import { Typography } from 'components/_shared/Typography';
import { FormField } from 'components/_shared/Form';
import { Image } from 'components/_shared/Image';
import { Menu, MenuDropdown } from 'components/_shared/Menu';

export const UserbarMenu = styled(Menu)`
  z-index: ${({ theme }) => theme.zIndexes[2]};
`;

export const UserbarName = styled(Typography).attrs({ variant: 'body2' })``;

export const UserbarAvatar = styled(Image)`
  ${({ theme }) => css`
    width: ${rem(28)};
    height: ${rem(28)};
    border-radius: 100%;
    margin-right: ${rem(theme.spacing[2])};
  `}
`;

export const StyledFormField = styled(FormField)`
  margin-bottom: ${em(20)};
`;

export const StyledUserbar = styled.div`
  ${({ theme, onClick }) => {
    return [
      css`
        display: flex;
        align-items: center;

        > * {
          transition: ${theme.transitions.fast};
        }

        ${MenuDropdown} {
          right: 0;
        }
      `,
      onClick &&
        css`
          &:hover {
            ${UserbarAvatar}, ${UserbarName} {
              cursor: pointer;
              color: ${theme.colors.primary.p1};
            }
          }
        `
    ];
  }}
`;

export const ButtonWrapper = styled.div`
  button:first-child {
    margin-right: ${rem(16)};
    border: ${({ theme }) => theme.borders.default(theme.fontSizes[2])};
  }
`;
