// TODO: Replace flexbox with grid

import styled, { css } from 'styled-components';

import { rem } from 'styles';
import { shouldForwardProp } from 'utils';

export const FormFieldsetItem = styled.div`
  flex: 1;
  max-width: 100%;
`;

export const StyledFormFieldset = styled.fieldset.withConfig({ shouldForwardProp })`
  ${({ theme, direction }) => {
    const childSpacing = theme.spacing[4];

    const directionStyles = {
      row: css`
        flex-direction: row;
      `,
      column: css`
        flex-direction: column;
      `
    };

    return [
      css`
        display: flex;
        flex-wrap: wrap;
        margin: -${rem(childSpacing)};

        &:not(:first-of-type) {
          margin-top: ${rem(theme.spacing[8] - childSpacing)};
        }

        ${FormFieldsetItem} {
          margin: ${rem(childSpacing)};
        }
      `,
      direction && directionStyles[direction]
    ];
  }}
`;
