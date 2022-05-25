import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Button } from 'components/_shared/Button';
import { Calendar } from 'components/_shared/Calendar';
import { AdditionalField } from './AdditionalField';

import { SIDEBAR_MODE, REQUEST_TABS } from '_constants';
import { useAreasActions, selectLayers, selectUser } from 'state';
import 'react-datepicker/dist/react-datepicker.css';
import {
  ButtonWrapper,
  StyledSelect,
  SelectsWrapper,
  Wrapper,
  WarningText
} from './CreateRequest.styles';

const plotBoundariesId = 4;
const startYear = 2015;
const layerYears = Array.from({ length: new Date().getFullYear() - startYear + 1 }).map(
  (el, i) => ({ value: startYear + i, name: startYear + i })
);

export const CreateRequest = ({ areas, currentArea }) => {
  const { setSidebarMode, saveAreaRequest, setRequestTab, setCurrentArea } =
    useAreasActions();
  const currentUser = useSelector(selectUser);
  const layers = useSelector(selectLayers);

  const [year, setYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notebook, setNotebook] = useState({});
  const [areaId, setAreaId] = useState(currentArea.id);
  const [canSaveRequest, setCanSaveRequest] = useState(false);
  const [additionalParameterValue, setAdditionalParameterValue] = useState('');

  const filteredLayers = useMemo(() => layers.filter(l => l.success), [layers]);
  const selectOptionsAreas = useMemo(
    () => areas.map(({ name, id }) => ({ name, value: id })),
    [areas]
  );
  const selectOptionsLayers = useMemo(
    () =>
      filteredLayers.map(({ name, id, additional_parameter }) => ({
        name,
        value: id,
        additional_parameter
      })),
    [filteredLayers]
  );

  const handleSaveRequest = () => {
    const additionalParameter = additionalParameterValue
      ? { additional_parameter: additionalParameterValue }
      : {};

    const request = {
      aoi: areaId,
      notebook: notebook.value,
      date_from: startDate.toLocaleDateString('en-CA'),
      date_to: endDate.toLocaleDateString('en-CA'),
      user: currentUser.pk,
      ...additionalParameter
    };
    setCurrentArea(areaId);
    saveAreaRequest(areaId, request);
    setRequestTab(REQUEST_TABS.IN_PROGRESS);
    setSidebarMode(SIDEBAR_MODE.REQUESTS);
  };

  useEffect(() => {
    if (startDate && endDate && hasSelectedNotebook(notebook)) {
      setCanSaveRequest(true);
    } else {
      setCanSaveRequest(false);
    }
  }, [notebook, startDate, endDate]);

  const handleAreChange = item => setAreaId(item.value);
  const setDates = (year, notebook) => {
    if (notebook === plotBoundariesId) {
      setStartDate(new Date(year, 5, 1));
      setEndDate(new Date(year, 6, 30));
    } else {
      setStartDate(new Date(year, 0));
      setEndDate(null);
    }
  };

  const handleNoteBookChange = item => {
    setNotebook(item);
    setDates(year, item.value);
  };

  const handleYearChange = item => {
    setYear(item.value);
    setDates(item.value, notebook.value);
  };

  const handleChangeSidebarMode = () => setSidebarMode(SIDEBAR_MODE.REQUESTS);
  const handleFieldChange = e => setAdditionalParameterValue(e.target.value);

  return (
    <Wrapper>
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
          value={year}
        />
        {notebook.value !== plotBoundariesId ? (
          <Calendar
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            title='Date range'
            notebook={notebook.value}
          />
        ) : (
          <WarningText>
            To have better quality and result, Plot Boundaries detection will apply dates
            from June to August
          </WarningText>
        )}
        <AdditionalField
          label={notebook.additional_parameter}
          value={additionalParameterValue}
          onChange={handleFieldChange}
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
    </Wrapper>
  );
};

function hasSelectedNotebook(notebook) {
  if (!notebook) return false;
  return notebook.additional_parameter?.trim() !== '';
}
