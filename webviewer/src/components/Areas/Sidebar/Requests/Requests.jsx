import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { remove } from 'lodash';

import { List } from '../../RequestsList';
import { Button } from 'components/_shared/Button';
import { Modal } from 'components/_shared/Modal';

import {
  useAreasActions,
  selectCurrentRequests,
  selectCurrentResults,
  getSelectedResults
} from 'state';
import { SIDEBAR_MODE, AOI_TYPE, GET_DATA_INTERVAL } from '_constants';
import {
  ButtonWrapper,
  StyledIcon,
  ButtonTopWrapper,
  StyledSelect,
  DeleteButton,
  ModalButtonsWrapper,
  ReportTitle
} from './Requests.styles';

const getRequestName = obj => {
  if (obj.notebook_name) return obj.notebook_name;
  return obj.name || obj.layer_type;
};

export const Requests = React.memo(({ currentArea }) => {
  const requests = useSelector(selectCurrentRequests);
  const results = useSelector(selectCurrentResults);
  const selectedResults = useSelector(getSelectedResults);

  const { setSidebarMode, deleteResult, patchResults, deleteSelectedResult } =
    useAreasActions();

  const [isUpSortList, setIsUpSortList] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const areaMode =
    currentArea.type === AOI_TYPE.AREA ? SIDEBAR_MODE.AREAS : SIDEBAR_MODE.FIELDS;

  const requestsInProgress = useMemo(
    () => requests.filter(request => !request.finished_at),
    [requests]
  );

  const filterItems = useMemo(() => {
    const resultNames = results.map(({ name, layer_type }) => name || layer_type);
    const requestNames = requestsInProgress.map(r => r.notebook_name);
    const setReportNames = [...new Set([...resultNames, ...requestNames])];
    return [
      { name: 'All report type', value: '' },
      ...setReportNames.map(name => ({ value: name, name }))
    ];
  }, [requestsInProgress, results]);

  useEffect(() => {
    patchResults(currentArea);
    const intervalId = setInterval(() => {
      patchResults(currentArea);
    }, GET_DATA_INTERVAL);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredResults = useMemo(() => {
    if (filterType) {
      return results.filter(({ name, layer_type }) =>
        name ? name === filterType : layer_type === filterType
      );
    }
    return results;
  }, [results, filterType]);

  const filteredRequests = useMemo(() => {
    if (filterType) {
      return requestsInProgress.filter(
        ({ notebook_name }) => notebook_name === filterType
      );
    } else {
      return requestsInProgress;
    }
  }, [requestsInProgress, filterType]);

  const sortingListItems = useMemo(() => {
    const sortCb = upSort => (prev, next) =>
      getRequestName(upSort ? prev : next).localeCompare(
        getRequestName(upSort ? next : prev)
      );

    const results = filteredResults.sort(sortCb(isUpSortList));
    const requests = filteredRequests.sort(sortCb(isUpSortList));
    return [...requests, ...results];
  }, [isUpSortList, filteredResults, filteredRequests]);

  const handleSortChange = () => setIsUpSortList(!isUpSortList);
  const handleSelectChange = item => {
    deleteSelectedResult();
    setFilterType(item.value);
  };
  const handleChangeMode = mode => () => setSidebarMode(mode);
  const handleDelete = () => {
    const filteredResults = {};
    handleCloseModal();
    const res = [...results];
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
          items={filterItems}
          value={filterType}
          onSelect={handleSelectChange}
        />
        {isShowDelete && <DeleteButton onClick={handleOpenModal} icon='Delete' />}
      </ButtonTopWrapper>
      <List items={sortingListItems} />
      <ButtonWrapper>
        <Button
          icon='ArrowInCircle'
          variant='secondary'
          padding={50}
          onClick={handleChangeMode(areaMode)}
        >
          Cancel
        </Button>
        <Button
          icon='Plus'
          variant='primary'
          onClick={handleChangeMode(SIDEBAR_MODE.CREATE_REQUEST)}
        >
          Create new Request
        </Button>
      </ButtonWrapper>
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
});
