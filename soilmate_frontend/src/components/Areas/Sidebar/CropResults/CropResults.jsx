import React from 'react';
import { useSelector } from 'react-redux';

import { useAreasActions, selectSelectedResults } from 'state';
import { SIDEBAR_MODE } from '_constants';

import { Button } from 'components/_shared/Button';

import { ButtonWrapper, LabelsItem, ColorBlock, Title } from './CropResults.styles';

export const CropResults = ({ currentArea }) => {
  const { setSidebarMode } = useAreasActions();
  const selectedResults = useSelector(selectSelectedResults);

  const handleChangeMode = () => setSidebarMode(SIDEBAR_MODE.REQUESTS);

  const currentResult = selectedResults[selectedResults.length - 1];
  let labels = currentArea.results.find(r => r.id === currentResult).labels;
  labels = JSON.parse(labels);

  return (
    <>
      <Title>{currentArea.name}</Title>
      <ul>
        {labels.map(({ color, name, area }) => (
          <LabelsItem key={name}>
            <ColorBlock color={color} />
            <div>
              <div>{name}</div>
              <div>{area} km2</div>
            </div>
          </LabelsItem>
        ))}
      </ul>
      <ButtonWrapper>
        <Button
          icon='ArrowInCircle'
          variant='secondary'
          padding={50}
          onClick={handleChangeMode}
        >
          Back
        </Button>
        <Button icon='Download' variant='primary'>
          Download
        </Button>
      </ButtonWrapper>
    </>
  );
};
