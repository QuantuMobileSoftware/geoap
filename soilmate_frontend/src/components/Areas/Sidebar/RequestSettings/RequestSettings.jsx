import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Button } from 'components/_shared/Button';
import { Calendar } from 'components/_shared/Calendar';

import { SIDEBAR_MODE } from '_constants';
import { useAreasActions, selectLayers, selectUser } from 'state';
import 'react-datepicker/dist/react-datepicker.css';
import { ButtonWrapper, StyledSelect } from './RequestSettings.styles';

const startYear = 2015;
const layerYears = Array.from({ length: new Date().getFullYear() - startYear + 1 }).map(
  (el, i) => ({ value: startYear + i, name: startYear + i })
);

export const RequestSettings = ({ areas, currentArea }) => {
  const { setSidebarMode, saveAreaRequest } = useAreasActions();
  const currentUser = useSelector(selectUser);
  const layers = useSelector(selectLayers);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notebook, setNotebook] = useState(null);
  const [areaId, setAreaId] = useState(currentArea.id);
  const [canSaveRequest, setCanSaveRequest] = useState(false);

  const filteredLayers = useMemo(() => layers.filter(l => l.success), [layers]);
  const selectOptionsAreas = useMemo(
    () => areas.map(({ name }) => ({ name, value: name })),
    [areas]
  );
  const selectOptionsLayers = useMemo(
    () => filteredLayers.map(({ name, id }) => ({ name, value: id })),
    [filteredLayers]
  );

  const handleSaveRequest = () => {
    const request = {
      aoi: areaId,
      notebook: notebook,
      date_from: startDate.toLocaleDateString('en-CA'),
      date_to: endDate.toLocaleDateString('en-CA'),
      user: currentUser.pk
    };
    saveAreaRequest(currentArea.id, request);
    setSidebarMode(SIDEBAR_MODE.LIST);
  };

  useEffect(() => {
    notebook && startDate && endDate && setCanSaveRequest(true);
  }, [notebook, startDate, endDate]);

  return (
    <>
      <StyledSelect
        items={selectOptionsAreas}
        value={currentArea.name}
        onSelect={item => setAreaId(item.value)}
        label='Choose area'
      />
      <StyledSelect
        items={selectOptionsLayers}
        onSelect={item => setNotebook(item.value)}
        label='Select layers'
      />
      <StyledSelect
        items={layerYears}
        onSelect={item => {
          setStartDate(new Date(item.value, 1));
          setEndDate(null);
        }}
        label='Year'
        value={new Date().getFullYear()}
      />

      <Calendar
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        title='Date range'
      />

      <ButtonWrapper>
        <Button
          icon='ArrowInCircle'
          variant='secondary'
          padding={50}
          onClick={() => setSidebarMode(SIDEBAR_MODE.LIST)}
        >
          Back to list
        </Button>
        <Button variant='primary' disabled={!canSaveRequest} onClick={handleSaveRequest}>
          Save changes
        </Button>
      </ButtonWrapper>
    </>
  );
};
