import React, { useState, useEffect } from 'react';

import { StyledCheckbox, StyledIcon } from './Checkbox.styles';

export const Checkbox = ({ checked = false }) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => setIsChecked(checked), [checked]);

  const handleClick = () => setIsChecked(!isChecked);

  return (
    <StyledCheckbox onClick={handleClick}>
      {isChecked && <StyledIcon>Check</StyledIcon>}
    </StyledCheckbox>
  );
};
