import React from 'react';
import { useSelector } from 'react-redux';

import { useAreasActions, getSelectedResults } from 'state';
import { SIDEBAR_MODE } from '_constants';

import { Button } from 'components/_shared/Button';

import { ButtonWrapper, LabelsItem, ColorBlock, Title, List } from './CropResults.styles';

export const CropResults = ({ currentArea }) => {
  const { setSidebarMode } = useAreasActions();
  const selectedResults = useSelector(getSelectedResults);

  const handleChangeMode = () => setSidebarMode(SIDEBAR_MODE.REQUESTS);

  const currentResult = selectedResults[selectedResults.length - 1];
  const labels = JSON.parse(currentArea.results.find(r => r.id === currentResult).labels);

  return (
    <>
      <Title>{currentArea.name}</Title>
      <List>
        {labels.map(({ color, name, area }) => (
          <LabelsItem key={name}>
            <ColorBlock color={color} />
            <div>
              <div>{name}</div>
              <div>{area} km2</div>
            </div>
          </LabelsItem>
        ))}
      </List>
      <ButtonWrapper>
        <Button
          icon='ArrowInCircle'
          variant='secondary'
          padding={50}
          onClick={handleChangeMode}
        >
          Back
        </Button>
      </ButtonWrapper>
    </>
  );
};
