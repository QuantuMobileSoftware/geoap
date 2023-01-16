import React, { useState, useEffect } from 'react';

import { StyledCheckbox, StyledIcon } from './Checkbox.styles';

export const Checkbox = ({ checked = false, onChange }) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => setIsChecked(checked), [checked]);

  const handleClick = () => {
    setIsChecked(!isChecked);
    onChange?.(!isChecked);
  };

  return (
    <StyledCheckbox onClick={handleClick}>
      {isChecked && <StyledIcon>Check</StyledIcon>}
    </StyledCheckbox>
  );
};
