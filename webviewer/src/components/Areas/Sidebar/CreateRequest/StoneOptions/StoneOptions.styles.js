import { Option, Select } from 'components/_shared/Select';
import { Typography } from 'components/_shared/Typography';
import styled, { css } from 'styled-components';
import { em, rem } from 'styles';

export const Label = styled(Typography).attrs({ variant: 'caption1' })`
  ${({ theme }) => css`
    display: block;
    color: ${theme.colors.nature.n5};
    font-size: ${rem(14)};
  `}
`;

export const LabelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${rem(8)};
  margin-bottom: ${em(20)};
`;

export const StyledSelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${em(8)};

  input {
    padding: ${em(8)};
    border: 1px solid #ccc;
    border-radius: 4px;
  }
`;

export const StyledSelect = styled(Select)`
  margin-bottom: ${em(20)};
  ${Option} {
    max-width: 280px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

export const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const StyledInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  color: #898989;
  &:focus-visible {
    outline-color: #efefef;
    outline-width: 0;
  }
`;

export const DropdownList = styled.ul`
  position: absolute;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  list-style: none;
  margin-top: 4px;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000; /* Increase the z-index */
`;

export const DropdownItem = styled.li`
  padding: 10px;
  cursor: pointer;
  &:hover {
    color: #ffffff;
    background: #35603d;
  }
`;
