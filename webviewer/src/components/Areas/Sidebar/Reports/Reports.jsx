import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { remove, uniq, values, groupBy } from 'lodash';

import { ReportList } from './ReportList';
import { Button } from 'components/_shared/Button';
import { Modal } from 'components/_shared/Modal';

import { useAreasActions, getSelectedResults } from 'state';
import { GET_DATA_INTERVAL, DEFAULT_FOLDER_NAME } from '_constants';

import {
  StyledIcon,
  ButtonTopWrapper,
  StyledSelect,
  DeleteButton,
  ModalButtonsWrapper,
  ReportTitle
} from './Reports.styles';
import { ReportButtons } from './ReportButtons';

export const Reports = ({ currentArea }) => {
  const selectedResults = useSelector(getSelectedResults);
  const { deleteResult, patchResults, deleteSelectedResult } = useAreasActions();

  const [isUpSortList, setIsUpSortList] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    patchResults(currentArea);
    const intervalId = setInterval(() => {
      patchResults(currentArea);
    }, GET_DATA_INTERVAL);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FORMATE RESULTS
  const results = useMemo(() => {
    return currentArea.results
      .filter(r => !r.to_be_deleted)
      .map(result => {
        const requestName = result.request
          ? currentArea.requests.find(r => r.id === result.request).notebook_name
          : DEFAULT_FOLDER_NAME;
        return { ...result, requestName };
      });
  }, [currentArea.requests, currentArea.results]);

  //  SELECT OPTIONS
  const filterSelectItems = useMemo(() => {
    const requestNames = uniq(results.map(r => r.requestName));
    const filterItems = requestNames.map(name => ({ value: name, name }));
    return [{ name: 'All report type', value: '' }, ...filterItems];
  }, [results]);

  const requestsInProgress = useMemo(
    () => currentArea.requests.filter(request => !request.finished_at),
    [currentArea.requests]
  );

  // FILTERED RESULTS
  const filteredResults = useMemo(() => {
    if (filterType) {
      return results.filter(({ requestName }) => requestName === filterType);
    }
    return results;
  }, [results, filterType]);

  const resultFolders = useMemo(
    () => values(groupBy(filteredResults, 'request')),
    [filteredResults]
  );

  // SORTING RESULTS
  const sortedResults = useMemo(() => {
    const results = resultFolders.sort((prev, next) => {
      if (isUpSortList) return prev[0].requestName.localeCompare(next[0].requestName);
      return next[0].requestName.localeCompare(prev[0].requestName);
    });
    return results;
  }, [isUpSortList, resultFolders]);

  const handleSortChange = () => setIsUpSortList(!isUpSortList);
  const handleSelectChange = item => {
    deleteSelectedResult();
    setFilterType(item.value);
  };
  const handleDelete = () => {
    const filteredResults = {};
    handleCloseModal();
    const res = [...currentArea.results];
    remove(res, el => selectedResults.some(id => id === el.id));
    res.forEach(item => (filteredResults[item.id] = item));
    deleteResult({ arrId: selectedResults, results: filteredResults });
  };
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenModal = () => setIsModalOpen(true);

  const resultLength = selectedResults.length;
  const isShowDelete = resultLength > 0;
  const modalHeader =
    resultLength > 1
      ? `Are you sure to delete ${resultLength} reports ?`
      : 'Are you sure to delete this report ?';

  return (
    <>
      <ReportTitle>Reports</ReportTitle>
      <ButtonTopWrapper>
        <Button onClick={handleSortChange}>
          Sorting <StyledIcon up={isUpSortList ? 'true' : ''}>ArrowUp</StyledIcon>
        </Button>
        <StyledSelect
          items={filterSelectItems}
          value={filterType}
          onSelect={handleSelectChange}
        />
        {isShowDelete && <DeleteButton onClick={handleOpenModal} icon='Delete' />}
      </ButtonTopWrapper>
      <ReportList
        requests={requestsInProgress}
        results={sortedResults}
        currentArea={currentArea}
      />
      <ReportButtons currentArea={currentArea} />
      {isModalOpen && (
        <Modal header={modalHeader} textCenter={true} close={handleCloseModal}>
          <ModalButtonsWrapper>
            <Button variant='secondary' padding={50} onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant='primary' onClick={handleDelete}>
              Yes, delete
            </Button>
          </ModalButtonsWrapper>
        </Modal>
      )}
    </>
  );
};
