import React from 'react';
import { Row, Chip, Swatch, Count, Label } from './FilterChips.styles';

const CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Reporting' },
  { key: 'late', label: 'Late' },
  { key: 'silent', label: 'Not reporting' }
];

const MIN_UNITS_TO_SHOW = 6;

export const FilterChips = ({ counts, stateFilter, onChangeFilter }) => {
  if (counts.all < MIN_UNITS_TO_SHOW) return null;

  return (
    <Row role='tablist' aria-label='Filter units'>
      {CHIPS.map(({ key, label }) => (
        <Chip
          key={key}
          type='button'
          role='tab'
          aria-pressed={stateFilter === key}
          onClick={() => onChangeFilter(stateFilter === key ? 'all' : key)}
        >
          {key !== 'all' && <Swatch $state={key} />}
          <Count>{counts[key]}</Count>
          <Label>{label}</Label>
        </Chip>
      ))}
    </Row>
  );
};
