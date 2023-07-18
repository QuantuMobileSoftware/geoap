import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSuccessfulLayers } from 'hooks';
import { Button } from 'components/_shared/Button';
import { AdditionalField } from './AdditionalField';
import { PeriodSelect } from './PeriodSelect';
import { SIDEBAR_MODE } from '_constants';
import { useAreasActions, selectUser } from 'state';
import { convertDate, hasSelectedNotebook } from './utils';
import 'react-datepicker/dist/react-datepicker.css';
import {
  ButtonWrapper,
  StyledSelect,
  SelectsWrapper,
  Wrapper
} from './CreateRequest.styles';

export const CreateRequest = ({ areas, currentArea }) => {
  const { setSidebarMode, saveAreaRequest, setCurrentArea } = useAreasActions();
  const currentUser = useSelector(selectUser);
  const layers = useSuccessfulLayers();

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [notebook, setNotebook] = useState({});
  const [areaId, setAreaId] = useState(currentArea.id);
  const [canSaveRequest, setCanSaveRequest] = useState(false);
  const [additionalParameterValue, setAdditionalParameterValue] = useState('');

  const selectOptionsAreas = useMemo(
    () => areas.map(({ name, id }) => ({ name, value: id })),
    [areas]
  );

  const selectOptionsLayers = useMemo(
    () =>
      layers.map(layer => ({
        name: layer.name,
        value: layer.id,
        additional_parameter: layer.additional_parameter,
        period_required: layer.period_required,
        date_type: layer.date_type,
        title: `Price ${layer.basic_price || 0} $ per 1 sq. km.`,
        sentinel_image_type: layer.sentinel_image_type
      })),
    [layers]
  );

  const handleSaveRequest = () => {
    const additionalParameter = additionalParameterValue
      ? { additional_parameter: additionalParameterValue }
      : {};
    const dateRange = notebook.period_required
      ? {
          date_from: convertDate(startDate),
          date_to: convertDate(endDate)
        }
      : {};

    const request = {
      aoi: areaId,
      notebook: notebook.value,
      user: currentUser.pk,
      polygon: '', // required filed in BE but can be empty if send aoi id
      ...dateRange,
      ...additionalParameter
    };
    setCurrentArea(areaId);
    saveAreaRequest(areaId, request);
    setSidebarMode(SIDEBAR_MODE.REQUESTS);
  };

  useEffect(() => {
    const canSave =
      (!notebook.period_required || (startDate && endDate)) &&
      (!notebook.additional_parameter || !!additionalParameterValue);
    if (hasSelectedNotebook(notebook) && canSave) {
      setCanSaveRequest(true);
    } else {
      setCanSaveRequest(false);
    }
  }, [notebook, startDate, endDate, additionalParameterValue]);

  const handleAreChange = item => setAreaId(item.value);

  const handleNoteBookChange = item => {
    setNotebook(item);
    setStartDate(null);
    setEndDate(null);
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
        {notebook.period_required && (
          <PeriodSelect
            notebook={notebook}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            currentArea={currentArea}
          />
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
