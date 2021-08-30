import styled, { css } from 'styled-components';

import { rem } from 'styles';

import { Typography } from 'components/_shared/Typography';
import { Image } from 'components/_shared/Image';
import { Menu, MenuDropdown } from 'components/_shared/Menu';

export const UserbarMenu = styled(Menu)``;

export const UserbarName = styled(Typography).attrs({ variant: 'body2' })``;

export const UserbarAvatar = styled(Image)`
  ${({ theme }) => css`
    width: ${rem(28)};
    height: ${rem(28)};
    border-radius: 100%;
    margin-right: ${rem(theme.spacing[2])};
  `}
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
