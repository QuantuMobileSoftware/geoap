import React, { useMemo, useState, useRef } from 'react';
import { Select } from 'components/_shared/Select';
import { Button } from 'components/_shared/Button';
import { SIDEBAR_MODE } from '_constants';
import { useAreasActions, selectLayers, selectUser } from 'state';
import { ButtonWrapper, StyledDatePicker, ApplyButton } from './RequestSettings.styles';
import { useSelector } from 'react-redux';
import 'react-datepicker/dist/react-datepicker.css';

const startYear = 2015;
const layerYears = Array.from({ length: new Date().getFullYear() - startYear + 1 }).map(
  (el, i) => ({ value: startYear + i, name: startYear + i })
);

export const RequestSettings = ({ areas, currentArea }) => {
  const { setSidebarMode, saveAreaRequest } = useAreasActions();
  const currentUser = useSelector(selectUser);
  const layers = useSelector(selectLayers);
  const calendarRef = useRef(null);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [notebook, setNotebook] = useState(null);
  const [areaId, setAreaId] = useState(currentArea.id);

  const selectOptionsAreas = useMemo(
    () => areas.map(({ name }) => ({ name, value: name })),
    [areas]
  );
  const selectOptionsLayers = useMemo(
    () => layers.map(({ name, id }) => ({ name, value: id })),
    [layers]
  );

  const onChange = dates => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const handleSaveRequest = () => {
    const request = {
      aoi: areaId,
      notebook: notebook,
      date_from: startDate.toLocaleDateString('en-CA'),
      date_to: endDate.toLocaleDateString('en-CA'),
      user: currentUser.pk
    };
    saveAreaRequest(currentArea.id, request);
  };

  return (
    <>
      <Select
        items={selectOptionsAreas}
        value={currentArea.name}
        onSelect={item => setAreaId(item.value)}
        label='Choose area'
      />
      <Select
        items={selectOptionsLayers}
        onSelect={item => setNotebook(item.value)}
        label='Select layers'
      />
      <Select
        items={layerYears}
        onSelect={item => setStartDate(new Date(item.value, 1))}
        label='Year'
        value={new Date().getFullYear()}
      />
      <StyledDatePicker
        selected={startDate}
        onChange={onChange}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        shouldCloseOnSelect={false}
        dateFormat='yyyy/MM/dd'
        calendarContainer={({ children }) => {
          return (
            <div>
              <div>{children}</div>
              <ApplyButton
                variant='primary'
                onClick={() => calendarRef.current.setOpen(false)}
              >
                apply
              </ApplyButton>
            </div>
          );
        }}
        ref={calendarRef}
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
        <Button variant='primary' onClick={handleSaveRequest}>
          Save changes
        </Button>
      </ButtonWrapper>
    </>
  );
};
