import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useSuccessfulLayers } from 'hooks';
import { Button } from 'components/_shared/Button';
import { AdditionalField } from './AdditionalField';
import { PeriodSelect } from './PeriodSelect';
import { SIDEBAR_MODE } from '_constants';
import { StoneOptions } from './StoneOptions';
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
  const { setSidebarMode, saveAreaRequest, setCurrentArea, getArea } = useAreasActions();
  const currentUser = useSelector(selectUser);
  const layers = useSuccessfulLayers();

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [notebook, setNotebook] = useState({});
  const [areaId, setAreaId] = useState(currentArea.id);
  const [canSaveRequest, setCanSaveRequest] = useState(false);
  const [additionalParameterValue, setAdditionalParameterValue] = useState('');
  const [secondAdditionalParameterValue, setSecondAdditionalParameterValue] =
    useState('');

  const updateAreaData = area => {
    if (area.sentinel_hub_available_dates_update_time === null) getArea(area.id);
  };

  useEffect(() => {
    updateAreaData(currentArea);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        additional_parameter2: layer.additional_parameter2,
        period_required: layer.period_required,
        date_type: layer.date_type,
        title: `Price ${layer.basic_price || 0} $ per 1 sq. km.`,
        sentinels: layer.sentinels,
        google_bucket_input_data: layer.google_bucket_input_data
      })),
    [layers]
  );

  const handleSaveRequest = () => {
    const additionalParameter = additionalParameterValue
      ? { additional_parameter: additionalParameterValue }
      : {};
    const secondAdditionalParameter = secondAdditionalParameterValue
      ? { additional_parameter2: secondAdditionalParameterValue }
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
      ...additionalParameter,
      ...secondAdditionalParameter
    };
    setCurrentArea(areaId);
    saveAreaRequest(areaId, request);
    setSidebarMode(SIDEBAR_MODE.REPORTS);
  };

  useEffect(() => {
    const canSave =
      (!notebook.period_required || (startDate && endDate)) &&
      (!notebook.additional_parameter || !!additionalParameterValue) &&
      (!notebook.additional_parameter2 || !!secondAdditionalParameterValue);
    if (hasSelectedNotebook(notebook) && canSave) {
      setCanSaveRequest(true);
    } else {
      setCanSaveRequest(false);
    }
  }, [
    notebook,
    startDate,
    endDate,
    additionalParameterValue,
    secondAdditionalParameterValue
  ]);

  const handleAreChange = item => {
    setAreaId(item.value);
    const area = areas.find(({ id }) => id === item.value);
    updateAreaData(area);
  };

  const handleNoteBookChange = item => {
    setNotebook(item);
    setStartDate(null);
    setEndDate(null);
  };
  const handleStoneFolderChange = useCallback(
    folder => {
      setAdditionalParameterValue(currentUser.stone_google_folder + '/' + folder.value);
    },
    [currentUser.stone_google_folder]
  );

  const handleStoneSizeChange = useCallback(size => {
    setSecondAdditionalParameterValue(size.value);
  }, []);

  const handleChangeSidebarMode = () => setSidebarMode(SIDEBAR_MODE.REPORTS);
  const handleFieldChange = e => setAdditionalParameterValue(e.target.value);
  const handleSecondFieldChange = e => setSecondAdditionalParameterValue(e.target.value);

  return (
    <Wrapper>
      <SelectsWrapper>
        <StyledSelect
          items={selectOptionsAreas}
          value={areaId}
          onSelect={handleAreChange}
          label='Choose area'
        />
        <StyledSelect
          items={selectOptionsLayers}
          onSelect={handleNoteBookChange}
          label='Select layers'
        />
        {notebook.period_required && !notebook.google_bucket_input_data && (
          <PeriodSelect
            notebook={notebook}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            currentArea={currentArea}
          />
        )}
        {notebook.google_bucket_input_data && (
          <StoneOptions
            handleStoneFolderChange={handleStoneFolderChange}
            handleStoneSizeChange={handleStoneSizeChange}
          />
        )}
        <AdditionalField
          label={notebook.additional_parameter}
          value={additionalParameterValue}
          onChange={handleFieldChange}
          isHidden={!!notebook.google_bucket_input_data}
        />
        <AdditionalField
          label={notebook.additional_parameter2}
          value={secondAdditionalParameterValue}
          onChange={handleSecondFieldChange}
          isHidden={!!notebook.google_bucket_input_data}
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
