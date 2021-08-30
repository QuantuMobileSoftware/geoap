import React from 'react';
import { StyledSpinnerWrapper, SpinnerIcon } from './Spinner.styles';

export const Spinner = React.memo(() => {
  return (
    <StyledSpinnerWrapper>
      <SpinnerIcon size={70} />
    </StyledSpinnerWrapper>
  );
});
