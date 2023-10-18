import React from 'react';

import { StyledSection, SectionHeader } from './RulesSection.styles';

export const RulesSection = ({ header, children }) => {
  return (
    <StyledSection>
      <SectionHeader>{header}</SectionHeader>
      {children}
    </StyledSection>
  );
};
