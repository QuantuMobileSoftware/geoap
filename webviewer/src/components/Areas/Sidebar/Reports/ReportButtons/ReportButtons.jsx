import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { generatePath } from 'react-router';

import {
  useAreasActions,
  selectUser,
  getSelectedResults,
  selectCurrentResults
} from 'state';
import { SIDEBAR_MODE, AOI_TYPE, ROUTES } from '_constants';

import { ButtonWrapper, StyledButton } from './ReportButtons.styles';
import { FileLoader } from 'components/FileLoader';

export const ReportButtons = ({ currentArea }) => {
  const { setSidebarMode } = useAreasActions();
  const user = useSelector(selectUser);
  const selectedResults = useSelector(getSelectedResults);
  const allAreaResults = useSelector(selectCurrentResults);

  const filteredResults = useMemo(
    () => allAreaResults.filter(result => selectedResults.includes(result.id)),
    [allAreaResults, selectedResults]
  );

  const additionalRequestPath = useMemo(() => {
    return filteredResults.map(
      result =>
        currentArea?.requests?.find(r => r.id === result.request)?.additional_parameter ??
        ''
    );
  }, [filteredResults, currentArea?.requests]);

  const allPathsAreSame = useMemo(() => {
    const [first, ...rest] = additionalRequestPath;
    return first && rest.every(path => path === first);
  }, [additionalRequestPath]);

  const additionalNotebookName = useMemo(() => {
    return filteredResults.map(
      result =>
        currentArea?.requests?.find(r => r.id === result.request)?.notebook_name ?? ''
    );
  }, [filteredResults, currentArea?.requests]);

  const allNotebookNamesSame = useMemo(() => {
    const [first, ...rest] = additionalNotebookName;
    return first && rest.every(name => name === first);
  }, [additionalNotebookName]);

  const areaMode =
    currentArea.type === AOI_TYPE.AREA ? SIDEBAR_MODE.AREAS : SIDEBAR_MODE.FIELDS;
  const handleChangeMode = mode => () => setSidebarMode(mode);
  const oneSelectedResult = useMemo(
    () =>
      selectedResults.length === 1
        ? allAreaResults.find(({ id }) => selectedResults[0] === id)
        : null,
    [allAreaResults, selectedResults]
  );
  const isShowValidate = oneSelectedResult?.filepath.includes('.gpx');
  const fileLoaderName = useMemo(() => {
    const baseName = currentArea.name;

    const cleanName = name => {
      return name.replace(/\s+/g, '_').replace(/\//g, '__');
    };

    if (allPathsAreSame && allNotebookNamesSame) {
      return `${baseName}_${cleanName(additionalNotebookName[0])}_${cleanName(
        additionalRequestPath[0]
      )}`;
    }

    if (allNotebookNamesSame) {
      return `${baseName}_${cleanName(additionalNotebookName[0])}`;
    }

    if (allPathsAreSame) {
      return `${baseName}_${cleanName(additionalRequestPath[0])}`;
    }

    return baseName;
  }, [
    currentArea.name,
    allPathsAreSame,
    allNotebookNamesSame,
    additionalRequestPath,
    additionalNotebookName
  ]);

  return (
    <ButtonWrapper>
      {selectedResults.length > 0 && (
        <>
          {isShowValidate && (
            <StyledButton
              to={generatePath(ROUTES.STONE_VALIDATION, { id: oneSelectedResult.id })}
              params={{ id: oneSelectedResult.id }}
              variant='primary'
              icon='Check'
            >
              Validate
            </StyledButton>
          )}
          <FileLoader selectedIdResults={selectedResults} areaName={fileLoaderName} />
        </>
      )}
      <StyledButton
        border='true'
        icon='ArrowInCircle'
        variant='secondary'
        padding={50}
        onClick={handleChangeMode(areaMode)}
      >
        Back
      </StyledButton>
      {!user.isDemo && (
        <StyledButton
          icon='Plus'
          variant='primary'
          onClick={handleChangeMode(SIDEBAR_MODE.CREATE_REQUEST)}
        >
          Create new Request
        </StyledButton>
      )}
    </ButtonWrapper>
  );
};
