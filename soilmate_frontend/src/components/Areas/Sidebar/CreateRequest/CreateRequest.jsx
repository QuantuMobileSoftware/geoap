import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Button } from 'components/_shared/Button';
import { Calendar } from 'components/_shared/Calendar';

import { SIDEBAR_MODE, AOI_TYPE } from '_constants';
import { useAreasActions, selectLayers, selectUser } from 'state';
import 'react-datepicker/dist/react-datepicker.css';
import { ButtonWrapper, StyledSelect, SelectsWrapper } from './CreateRequest.styles';

const startYear = 2015;
const layerYears = Array.from({ length: new Date().getFullYear() - startYear + 1 }).map(
  (el, i) => ({ value: startYear + i, name: startYear + i })
);

export const CreateRequest = ({ areas, currentArea }) => {
  const { setSidebarMode, saveAreaRequest } = useAreasActions();
  const currentUser = useSelector(selectUser);
  const layers = useSelector(selectLayers);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notebook, setNotebook] = useState(null);
  const [areaId, setAreaId] = useState(currentArea.id);
  const [canSaveRequest, setCanSaveRequest] = useState(false);

  const { AREAS, FIELDS } = SIDEBAR_MODE;
  const areaType = currentArea.type === AOI_TYPE.AREA ? AREAS : FIELDS;

  const filteredLayers = useMemo(() => layers.filter(l => l.success), [layers]);
  const selectOptionsAreas = useMemo(
    () => areas.map(({ name, id }) => ({ name, value: id })),
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
    setSidebarMode(areaType);
  };

  useEffect(() => {
    notebook && startDate && endDate && setCanSaveRequest(true);
  }, [notebook, startDate, endDate]);

  const handleAreChange = item => setAreaId(item.value);

  const handleNoteBookChange = item => setNotebook(item.value);

  const handleYearChange = item => {
    setStartDate(new Date(item.value, 1));
    setEndDate(null);
  };

  const handleChangeSidebarMode = () => setSidebarMode(areaType);

  return (
    <>
      <SelectsWrapper>
        <StyledSelect
          items={selectOptionsAreas}
          value={currentArea.id}
          onSelect={handleAreChange}
          label='Choose area'
        />
        <StyledSelect
          items={selectOptionsLayers}
          onSelect={handleNoteBookChange}
          label='Select layers'
        />
        <StyledSelect
          items={layerYears}
          onSelect={handleYearChange}
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
      </SelectsWrapper>
      <ButtonWrapper>
        <Button
          icon='ArrowInCircle'
          variant='secondary'
          padding={50}
          onClick={handleChangeSidebarMode}
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
